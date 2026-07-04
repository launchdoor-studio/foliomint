import Groq from 'groq-sdk';

import { ParseError } from '@/lib/errors';
import { normalizeResumeData, normalizeProjectBullets } from '@/lib/resume-parser';
import { normalizeProjectLinks } from '@/lib/project-links';
import type { ResumeData } from '@/types';

function buildExtractionPrompt(rawText: string): string {
  return `You are FolioMint's portfolio intake engine. Your job is not to make a generic resume JSON dump; it is to extract reliable facts and shape them into editable portfolio content.

Return ONLY valid JSON matching this schema:

{
  "name": "string",
  "headline": "string or null (role/title/value proposition for a portfolio hero)",
  "profileImageUrl": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "website": "string or null",
  "linkedin": "string or null",
  "github": "string or null",
  "bio": "string or null (professional summary/objective)",
  "skills": ["string"],
  "experience": [{"company": "string", "role": "string", "startDate": "string", "endDate": "string or omit if current", "bullets": ["string"], "location": "string or omit"}],
  "education": [{"institution": "string", "degree": "string", "field": "string or omit", "startDate": "string", "endDate": "string or omit", "gpa": "string or omit"}],
  "projects": [{"name": "string", "description": "string or null (one short tagline max)", "links": [{"label": "GitHub|GitLab|Website|App Store|Play Store|Demo|etc.", "url": "https://..."}], "technologies": ["string"] or omit, "bullets": ["string"]}],
  "certifications": ["string"] or omit,
  "languages": ["string"] or omit,
  "awards": ["string"] or omit,
  "extracurricular": [{"title": "string", "bullets": ["string"]}] or omit,
  "otherSections": [{"title": "string", "bullets": ["string"]}] or omit,
  "portfolioSuggestions": {
    "heroTagline": "string or null",
    "bioVariants": ["2-3 concise first-person or neutral bio options"],
    "missingFields": ["specific fields the user should add manually"],
    "recommendedSectionOrder": ["profile", "projects", "experience", "skills", "education", "other"]
  }
}

Rules:
- Extract as much factual information as possible. Do not stop after profile/contact details; every resume section should map into the JSON when there is supporting text.
- Accuracy is more important than polish. Never invent companies, dates, degrees, links, metrics, or technologies that are not supported by the resume.
- Use null or empty arrays for truly missing information, but do not leave fields empty when the resume contains the information under a different heading or dense PDF text.
- The "name" field MUST be the person's full name (e.g., "John Doe"), not a section heading like "Contact", "Profile", "About", etc.
- "profileImageUrl" is optional and usually unavailable in resume text exports. Use null unless an explicit personal image URL is present.
- When the resume comes from LinkedIn or similar, the name is usually the prominent personal name at the top of the document. Use that as "name".
- Do NOT set "name" to labels or entire sidebars such as "Contact", "Profile", or other section titles.
- Contact fields ("email", "phone", "location", "website", "linkedin", "github") should come from explicit contact/profile info, not from project descriptions.
- GITHUB / LINKEDIN: Many resumes show icon rows with bare handles only (e.g. "maskedsyntax" and "aftaabsiddiqui" without github.com or linkedin.com). When the contact row order is email | website | GitHub handle | LinkedIn handle | location, map bare handles to full URLs: github -> https://github.com/{handle}, linkedin -> https://www.linkedin.com/in/{slug}. Prefer labeled lines ("GitHub: user") when present.
- Set "website" ONLY when the URL is clearly the person's own site/portfolio/homepage/blog.
- Do NOT use a project/product/company URL as "website" unless the resume explicitly states it is the person's site.
- If a URL belongs to a specific project, put it in that project's "links" array (not top-level "website").
- If "website" is ambiguous, return null.
- PROJECT LINKS: Each project may have multiple links in "links" — GitHub repo, live demo, App Store, Play Store, GitLab, case study site, etc. Use clear labels (GitHub, App Store, Play Store, Website, Demo, GitLab).
- Legacy "url" on a project is discouraged; prefer "links" with one entry per URL.
- Map all section headings semantically (e.g., "Work History" -> experience, "Technical Skills" -> skills, "Leadership" -> extracurricular unless it is paid work).
- Normalize dates to readable formats (e.g., "Jan 2023", "2023")
- Keep bullet points concise
- If a section is missing, use empty arrays
- HEADLINE: Derive a concise portfolio headline from the strongest evidence: current role, target role, seniority, domain, or skill cluster. Do not invent a job title that conflicts with the resume.
- BIO: Keep "bio" as a polished 2-4 sentence professional summary suitable for a portfolio homepage. If the resume summary is weak, improve wording without adding unsupported claims.
- HERO TAGLINE: Make it shorter and punchier than bio, suitable below a hero heading.
- PROJECTS (critical): For EVERY project, you MUST populate "bullets" with 2-5 concise outcome bullets when the resume provides enough detail. Each bullet is one complete sentence focused on impact, scope, or tech — not a comma list.
- PROJECTS: "description" is optional — at most ONE short tagline sentence (or null). Never paste an entire bullet list or long paragraph into "description".
- PROJECTS: Put stack/tech keywords in "technologies" only when the resume lists them as technologies for that project; otherwise omit "technologies".
- PROJECTS: Prefer surfacing project impact, stack, links, and ownership because portfolios are often judged from projects first.
- EXPERIENCE: Use 3-6 complete achievement bullets per role. Each bullet must be one full sentence starting with a strong action verb (Built, Shipped, Led, Optimized, etc.). Never split one accomplishment across multiple bullets. Never emit single-word bullets, comma fragments, or lines starting with "and". Group related product/feature details into the same bullet when they describe one outcome.
- EDUCATION: Capture institution, degree, field/major, dates, GPA, coursework, and academic honors when present. Put coursework/honors that do not fit the schema into "otherSections".
- SKILLS: Return at most 24 distinct, short skill tags (e.g. "TypeScript", "React", "PostgreSQL"). Prefer languages, frameworks, databases, and widely recognized tools. Do NOT prefix skills with category labels (never "Languages : TypeScript" — use "TypeScript" only). Never include school or university names in skills. Do not list the same skill twice in different forms.
- AWARDS: Map sections titled Awards, Honors, Achievements, Recognition to "awards" as a flat list of strings.
- EXTRACURRICULAR: Map sections titled Extracurricular, Activities, Leadership, Volunteering (when not a job) to "extracurricular" as subsections: each subsection has its own "title" and "bullets".
- OTHER SECTIONS: If the resume has a labeled section that does not fit above (e.g., Publications, Patents, Volunteer, Courses), put it in "otherSections" as {"title": "<section heading>", "bullets": [...]}. Prefer first-class fields when obvious.
- MISSING FIELDS: Include only actionable gaps that matter for a public portfolio, such as missing project links, missing headline, missing GitHub/LinkedIn, weak bio, or no measurable impact.
- RECOMMENDED SECTION ORDER: Choose the order that best markets this person. For students and builders, projects often come before experience. For experienced professionals, experience often comes before projects.
- Return ONLY the JSON object, no extra text

Resume text:
---
${rawText}
---`;
}

function sanitizeWebsiteField(
  data: Record<string, unknown>,
  rawText: string,
): Record<string, unknown> {
  const website = typeof data.website === 'string' ? data.website.trim() : null;
  if (!website) return data;

  const projects = Array.isArray(data.projects) ? data.projects : [];
  const projectUrls = new Set<string>();
  for (const project of projects) {
    if (!project || typeof project !== 'object') continue;
    const record = project as { url?: unknown; links?: unknown };
    if (typeof record.url === 'string' && record.url.trim()) {
      projectUrls.add(record.url.trim());
    }
    if (Array.isArray(record.links)) {
      for (const link of record.links) {
        if (link && typeof link === 'object' && typeof (link as { url?: unknown }).url === 'string') {
          projectUrls.add((link as { url: string }).url.trim());
        }
      }
    }
  }

  if (!projectUrls.has(website)) {
    return data;
  }

  const escapedWebsite = website.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const websitePattern = new RegExp(
    `(website|portfolio|homepage|personal\\s+site|blog)\\s*[:\\-]?\\s*${escapedWebsite}`,
    'i',
  );

  if (!websitePattern.test(rawText)) {
    data.website = null;
  }

  return data;
}

/** When the model merges bullets into description, split and normalize project copy. */
function normalizeProjectFields(data: Record<string, unknown>): Record<string, unknown> {
  if (!Array.isArray(data.projects)) return data;

  data.projects = data.projects.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const p = item as Record<string, unknown>;
    const legacyUrl = typeof p.url === 'string' ? p.url.trim() : '';
    const links = normalizeProjectLinks(p.links, legacyUrl || null);
    const desc = typeof p.description === 'string' ? p.description.trim() : '';
    const rawBullets = Array.isArray(p.bullets)
      ? p.bullets.map((b) => String(b).trim()).filter(Boolean)
      : [];
    const { bullets, description } = normalizeProjectBullets(rawBullets, desc || null);

    const next: Record<string, unknown> = {
      ...p,
      bullets,
      description: description ?? null,
      links,
    };
    delete next.url;
    return next;
  });

  return data;
}

/** Validate platform Groq connectivity with a lightweight models list call. */
export async function validateGroqApiKey(apiKey: string): Promise<boolean> {
  const groq = new Groq({ apiKey: apiKey.trim() });
  try {
    await groq.models.list();
    return true;
  } catch {
    return false;
  }
}

export async function extractResumeFields(rawText: string, apiKey: string): Promise<ResumeData> {
  const groq = new Groq({ apiKey });
  const prompt = buildExtractionPrompt(rawText);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You extract structured portfolio data from resumes. Return strict JSON only and preserve facts from every section.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    });

    const json = completion.choices[0]?.message?.content;

    if (!json) {
      throw new ParseError('Mint did not receive a response. Please try again.');
    }

    const parsed = JSON.parse(json) as Record<string, unknown>;
    const sanitized = normalizeProjectFields(sanitizeWebsiteField(parsed, rawText));
    return normalizeResumeData(sanitized, rawText);
  } catch (error) {
    if (error instanceof ParseError) throw error;

    if (error instanceof Groq.APIError) {
      if (error.status === 401 || error.status === 403) {
        throw new ParseError(
          'Mint parsing is temporarily unavailable. Please try again in a few minutes.',
        );
      }
      if (error.status === 429) {
        throw new ParseError(
          'Mint is rate-limited right now. Please wait a moment and try again.',
        );
      }
    }

    throw new ParseError(
      `Mint could not parse your resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
