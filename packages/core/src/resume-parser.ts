import * as pdfjsLib from 'pdfjs-dist';

import { ParseError } from './errors';
import { resumeDataSchema, type ResumeData } from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const parts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      parts.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
    }
    const text = parts.join('\n').trim();
    if (!text) {
      throw new ParseError('PDF appears to be empty or contains only images');
    }
    return text;
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError('Failed to extract text from PDF');
  }
}

export async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth');
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    if (!result.value?.trim()) {
      throw new ParseError('DOCX appears to be empty');
    }
    return result.value;
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError('Failed to extract text from DOCX');
  }
}

export function mimeFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (lower.endsWith('.txt')) return 'text/plain';
  return 'application/octet-stream';
}

export async function extractTextFromFile(buffer: ArrayBuffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case 'application/pdf':
      return extractTextFromPdf(buffer);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractTextFromDocx(buffer);
    case 'text/plain':
      return new TextDecoder().decode(buffer);
    default:
      throw new ParseError(`Unsupported file type: ${mimeType}`);
  }
}

type UnknownRecord = Record<string, unknown>;

const SECTION_HEADINGS = new Set([
  'profile',
  'professional profile',
  'contact',
  'contacts',
  'about',
  'about me',
  'summary',
  'professional summary',
  'experience',
  'work experience',
  'professional experience',
  'work history',
  'employment',
  'education',
  'projects',
  'selected projects',
  'personal projects',
  'skills',
  'technical skills',
  'technologies',
  'certifications',
  'certificates',
  'languages',
  'awards',
  'honors',
  'achievements',
  'activities',
  'extracurricular',
  'leadership',
  'volunteering',
  'publications',
  'courses',
]);

const CONTACT_LABELS = /\b(email|phone|mobile|linkedin|github|website|portfolio|location)\b/i;
const DATE_RANGE_PATTERN =
  /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\.?\s*\d{4}\s*(?:[-–—]|to)\s*(?:present|current|now|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\.?\s*\d{4}|\d{4})\b/i;

function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function normalizeLines(rawText: string): string[] {
  return rawText
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) =>
      line
        .replace(/^[\s•*·▪◦-]+/, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);
}

function unique(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const cleaned = cleanText(value);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }
  return result;
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return unique(value.flatMap((item) => stringArray(item)));
  }
  const text = cleanText(value);
  if (!text) return [];
  return unique(
    text
      .split(/\n|,|;|\||•|·|▪|◦/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

/** Parse bullet lists without splitting on commas (commas often appear inside one accomplishment). */
function parseBulletList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => parseBulletList(item));
  }
  const text = cleanText(value);
  if (!text) return [];

  if (!text.includes('\n') && /;\s+\S/.test(text)) {
    return text
      .split(/;\s+/)
      .map((part) => part.replace(/^[\s•*·▪◦-]+/, '').trim())
      .filter(Boolean);
  }

  const parts = text.includes('\n')
    ? text.split(/\n+/)
    : text.split(/(?:^|\s)[•·▪◦]\s+|\s+•\s+/);

  return parts
    .map((part) => part.replace(/^[\s•*·▪◦-]+/, '').trim())
    .filter(Boolean);
}

const MAX_EXPERIENCE_BULLETS = 6;
const NEW_ACHIEVEMENT_VERB =
  /^(shipped|built|designed|developed|led|implemented|created|optimized|migrated|architected|delivered|launched|established|improved|reduced|increased|managed|co-founded|founded|spearheaded|drove|owned|introduced|automated|scaled|refactored)\b/i;

function shouldMergeBulletFragment(text: string): boolean {
  if (/^(and|or)\b/i.test(text)) return true;
  if (/^(a|an|the)\s+/i.test(text)) return true;
  if (/^[a-z]/.test(text)) return true;
  const words = text.split(/\s+/);
  if (words.length === 1 && text.length <= 16) return true;
  if (words.length <= 2 && text.length < 28) return true;
  return false;
}

function joinBulletFragments(previous: string, fragment: string): string {
  if (/^and\b/i.test(fragment)) return `${previous} ${fragment}`;
  if (/^[,.;]/.test(fragment)) return `${previous}${fragment}`;
  if (/[–—-]$/.test(previous) || previous.endsWith(':')) return `${previous} ${fragment}`;
  return `${previous}, ${fragment}`;
}

/** Merge comma-split fragments and cap bullets per role. */
export function normalizeExperienceBullets(raw: string[]): string[] {
  const merged: string[] = [];

  for (const bullet of raw.map((item) => cleanText(item)).filter(Boolean) as string[]) {
    const startsNewAchievement = NEW_ACHIEVEMENT_VERB.test(bullet);

    if (
      merged.length > 0 &&
      shouldMergeBulletFragment(bullet) &&
      !startsNewAchievement
    ) {
      merged[merged.length - 1] = joinBulletFragments(merged[merged.length - 1], bullet);
      continue;
    }

    merged.push(bullet);
  }

  const polished = merged.map((bullet) =>
    bullet.charAt(0).toUpperCase() + bullet.slice(1),
  );

  return polished.slice(0, MAX_EXPERIENCE_BULLETS);
}

function validEmail(value: unknown): string | undefined {
  const text = cleanText(value);
  if (!text) return undefined;
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0];
}

function normalizeUrl(value: unknown): string | undefined {
  const text = cleanText(value);
  if (!text) return undefined;
  const match = text.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s),;]*)?/i);
  if (!match) return undefined;
  const url = match[0].replace(/[).,;]+$/, '');
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}

function isHeading(line: string): boolean {
  const normalized = line
    .toLowerCase()
    .replace(/[:\-]+$/, '')
    .trim();
  return SECTION_HEADINGS.has(normalized);
}

function findLikelyName(lines: string[], provided?: unknown): string {
  const providedName = cleanText(provided);
  if (
    providedName &&
    !isHeading(providedName) &&
    !providedName.includes('@') &&
    !CONTACT_LABELS.test(providedName)
  ) {
    return providedName;
  }

  const headingBlacklist = new Set([
    'profile',
    'contact',
    'contacts',
    'about',
    'summary',
    'experience',
    'work experience',
    'work history',
    'education',
    'projects',
    'skills',
    'certifications',
    'languages',
  ]);

  return (
    lines.find((line) => {
      const lower = line.toLowerCase();
      if (headingBlacklist.has(lower)) return false;
      if (lower.includes('@')) return false;
      if (lower.includes('linkedin.com') || lower.includes('github.com')) return false;
      if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('www.')) {
        return false;
      }
      const words = line.split(/\s+/);
      if (words.length < 2 || words.length > 5) return false;
      const capitalizedWords = words.filter((w) => /^[A-Z][a-zA-Z'-]*$/.test(w));
      return capitalizedWords.length >= 2;
    }) ??
    lines.find((line) => !isHeading(line) && !CONTACT_LABELS.test(line) && line.length <= 80) ??
    'Unknown'
  );
}

function collectSections(lines: string[]): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  let current: string | null = null;

  for (const line of lines) {
    const heading = line
      .toLowerCase()
      .replace(/[:\-]+$/, '')
      .trim();
    if (SECTION_HEADINGS.has(heading)) {
      current = heading;
      if (!sections.has(current)) sections.set(current, []);
      continue;
    }

    if (current) {
      sections.get(current)?.push(line);
    }
  }

  return sections;
}

function firstSection(sections: Map<string, string[]>, names: string[]): string[] {
  for (const name of names) {
    const section = sections.get(name);
    if (section?.length) return section;
  }
  return [];
}

function extractContacts(rawText: string, lines: string[]) {
  const email = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = rawText
    .match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]
    ?.replace(/\s+/g, ' ')
    .trim();
  const urls = unique(
    rawText.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s),;]*)?/gi) ?? [],
  );
  const linkedin = normalizeUrl(urls.find((url) => /linkedin\.com/i.test(url)));
  const github = normalizeUrl(urls.find((url) => /github\.com/i.test(url)));
  const website = normalizeUrl(urls.find((url) => !/linkedin\.com|github\.com|mailto:/i.test(url)));
  const location =
    lines.find(
      (line) =>
        /(?:^|\b)(remote|india|usa|united states|canada|london|berlin|delhi|mumbai|bangalore|bengaluru|hyderabad|pune|chennai|san francisco|new york)(?:\b|$)/i.test(
          line,
        ) && !line.includes('@'),
    ) ?? undefined;

  return { email, phone, linkedin, github, website, location };
}

const MAX_SKILLS = 24;
const MAX_SKILL_LENGTH = 36;
const MAX_SKILL_WORDS = 4;

const NON_SKILL_PATTERN =
  /\b(university|college|institute|school|b\.?\s*tech|bachelor|master|ph\.?d)\b/i;

function expandSkillTokens(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  let value = trimmed;
  const colonIndex = trimmed.indexOf(':');
  if (colonIndex > 0 && colonIndex <= 40) {
    value = trimmed.slice(colonIndex + 1).trim();
  }

  if (!value) return [];

  if (value.includes(',')) {
    return value.split(',').flatMap((part) => expandSkillTokens(part));
  }

  return [value];
}

function isValidSkillToken(skill: string, blockedInstitutions: Set<string>): boolean {
  if (!skill || skill.length > MAX_SKILL_LENGTH) return false;
  if (skill.split(/\s+/).length > MAX_SKILL_WORDS) return false;
  if (DATE_RANGE_PATTERN.test(skill)) return false;
  if (NON_SKILL_PATTERN.test(skill)) return false;
  if (blockedInstitutions.has(skill.toLowerCase())) return false;
  if (/^[\w\s/]+:$/.test(skill)) return false;
  return true;
}

/** Collapse AI/fallback skill noise: strip category labels, dedupe, cap count. */
export function normalizeSkills(
  raw: string[],
  education: Array<{ institution?: string }> = [],
): string[] {
  const blockedInstitutions = new Set(
    education
      .map((entry) => cleanText(entry.institution))
      .filter(Boolean)
      .map((name) => name!.toLowerCase()),
  );

  const seen = new Map<string, string>();

  for (const item of raw.flatMap((skill) => expandSkillTokens(skill))) {
    const cleaned = cleanText(item);
    if (!cleaned || !isValidSkillToken(cleaned, blockedInstitutions)) continue;

    const key = cleaned.toLowerCase();
    const existing = seen.get(key);
    if (!existing || cleaned.length < existing.length) {
      seen.set(key, cleaned);
    }
  }

  return Array.from(seen.values()).slice(0, MAX_SKILLS);
}

function fallbackSkills(sections: Map<string, string[]>): string[] {
  const skillsText = firstSection(sections, ['skills', 'technical skills', 'technologies']).join(
    ', ',
  );
  return stringArray(skillsText);
}

function fallbackBio(sections: Map<string, string[]>, rawText: string): string | undefined {
  const summary = firstSection(sections, [
    'summary',
    'professional summary',
    'profile',
    'professional profile',
    'about',
    'about me',
  ]);
  const source = summary.length ? summary.join(' ') : rawText;
  return cleanText(source)?.slice(0, 700);
}

function extractDateRange(text: string): { startDate: string; endDate?: string } {
  const match = text.match(DATE_RANGE_PATTERN)?.[0];
  if (!match) return { startDate: '' };
  const [start, end] = match.split(/\s*(?:[-–—]|to)\s*/i).map((part) => part.trim());
  return { startDate: start ?? '', ...(end ? { endDate: end } : {}) };
}

function splitLooseEntries(lines: string[]): string[][] {
  const entries: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const startsNew = DATE_RANGE_PATTERN.test(line) && current.length >= 2;
    if (startsNew) {
      entries.push(current);
      current = [];
    }
    current.push(line);
  }

  if (current.length) entries.push(current);
  return entries;
}

function fallbackExperience(sections: Map<string, string[]>): ResumeData['experience'] {
  const lines = firstSection(sections, [
    'experience',
    'work experience',
    'professional experience',
    'work history',
    'employment',
  ]);
  if (!lines.length) return [];

  return splitLooseEntries(lines).map((entry) => {
    const header = entry.find((line) => !DATE_RANGE_PATTERN.test(line)) ?? entry[0] ?? '';
    const dates = extractDateRange(entry.join(' '));
    const [rolePart, companyPart] = header
      .split(/\s+(?:at|@)\s+|[|–—]/i)
      .map((part) => part.trim());
    const bullets = normalizeExperienceBullets(
      unique(entry.filter((line) => line !== header && !DATE_RANGE_PATTERN.test(line))),
    );
    return {
      company: companyPart ?? '',
      role: rolePart ?? '',
      startDate: dates.startDate,
      ...(dates.endDate ? { endDate: dates.endDate } : {}),
      bullets: bullets.length
        ? bullets
        : normalizeExperienceBullets(unique(entry.filter((line) => line !== header))),
    };
  });
}

function fallbackEducation(sections: Map<string, string[]>): ResumeData['education'] {
  const lines = firstSection(sections, ['education']);
  if (!lines.length) return [];
  return splitLooseEntries(lines).map((entry) => {
    const dates = extractDateRange(entry.join(' '));
    const institution = entry.find((line) => !DATE_RANGE_PATTERN.test(line)) ?? '';
    const degree =
      entry.find(
        (line) =>
          line !== institution &&
          /\b(bachelor|master|phd|doctor|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|degree|diploma|university|college)\b/i.test(
            line,
          ),
      ) ?? '';
    return {
      institution,
      degree,
      startDate: dates.startDate,
      ...(dates.endDate ? { endDate: dates.endDate } : {}),
    };
  });
}

function fallbackProjects(sections: Map<string, string[]>): ResumeData['projects'] {
  const lines = firstSection(sections, ['projects', 'selected projects', 'personal projects']);
  if (!lines.length) return [];
  const entries = splitLooseEntries(lines.length > 1 ? lines : (lines[0]?.split(/\s+•\s+/) ?? []));
  return entries.map((entry) => {
    const name = entry[0] ?? 'Project';
    return {
      name,
      bullets: unique(entry.slice(1)),
      technologies: [],
    };
  });
}

function normalizeExperience(value: unknown): ResumeData['experience'] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ResumeData['experience'] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as UnknownRecord;
    const bullets = normalizeExperienceBullets(parseBulletList(record.bullets));
    const company = cleanText(record.company) ?? '';
    const role = cleanText(record.role) ?? cleanText(record.title) ?? '';
    const startDate = cleanText(record.startDate) ?? cleanText(record.start) ?? '';
    const endDate = cleanText(record.endDate) ?? cleanText(record.end);
    const location = cleanText(record.location);
    if (!company && !role && !startDate && !endDate && bullets.length === 0) return [];
    return [
      {
        company,
        role,
        startDate,
        ...(endDate ? { endDate } : {}),
        ...(location ? { location } : {}),
        bullets,
      },
    ];
  });
}

function normalizeEducation(value: unknown): ResumeData['education'] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ResumeData['education'] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as UnknownRecord;
    const institution =
      cleanText(record.institution) ??
      cleanText(record.school) ??
      cleanText(record.university) ??
      '';
    const degree = cleanText(record.degree) ?? '';
    const field = cleanText(record.field) ?? cleanText(record.major);
    const startDate = cleanText(record.startDate) ?? cleanText(record.start) ?? '';
    const endDate = cleanText(record.endDate) ?? cleanText(record.end);
    const gpa = cleanText(record.gpa);
    if (!institution && !degree && !field && !startDate && !endDate) return [];
    return [
      {
        institution,
        degree,
        ...(field ? { field } : {}),
        startDate,
        ...(endDate ? { endDate } : {}),
        ...(gpa ? { gpa } : {}),
      },
    ];
  });
}

function normalizeProjects(value: unknown): ResumeData['projects'] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ResumeData['projects'] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as UnknownRecord;
    const name = cleanText(record.name) ?? cleanText(record.title) ?? '';
    const description = cleanText(record.description) ?? cleanText(record.summary);
    const url = normalizeUrl(record.url) ?? normalizeUrl(record.link);
    const technologies = stringArray(record.technologies ?? record.techStack ?? record.stack);
    const bullets = normalizeExperienceBullets(
      parseBulletList(record.bullets ?? record.highlights ?? record.details),
    );
    if (!name && !description && !url && technologies.length === 0 && bullets.length === 0)
      return [];
    return [
      {
        name,
        ...(description ? { description } : {}),
        ...(url ? { url } : {}),
        technologies,
        bullets,
      },
    ];
  });
}

function normalizeTitledSections(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const sections = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as UnknownRecord;
      const title = cleanText(record.title) ?? cleanText(record.name) ?? '';
      const bullets = stringArray(record.bullets ?? record.items ?? record.content);
      if (!title && bullets.length === 0) return null;
      return { title, bullets };
    })
    .filter((item): item is { title: string; bullets: string[] } => Boolean(item));
  return sections.length ? sections : undefined;
}

export function normalizeResumeData(candidate: unknown, rawText: string): ResumeData {
  const record = candidate && typeof candidate === 'object' ? (candidate as UnknownRecord) : {};
  const lines = normalizeLines(rawText);
  const sections = collectSections(lines);
  const contacts = extractContacts(rawText, lines);

  const bio = cleanText(record.bio) ?? fallbackBio(sections, rawText);
  const fallbackName = findLikelyName(lines, record.name);
  const experience = normalizeExperience(record.experience);
  const education = normalizeEducation(record.education);
  const projects = normalizeProjects(record.projects);
  const resolvedEducation = education.length ? education : fallbackEducation(sections);
  const skills = normalizeSkills(
    [...stringArray(record.skills), ...fallbackSkills(sections)],
    resolvedEducation,
  );

  const normalized = {
    name: fallbackName,
    headline: cleanText(record.headline),
    profileImageUrl: normalizeUrl(record.profileImageUrl),
    email: validEmail(record.email) ?? contacts.email,
    phone: cleanText(record.phone) ?? contacts.phone,
    location: cleanText(record.location) ?? contacts.location,
    website: normalizeUrl(record.website) ?? contacts.website,
    linkedin: normalizeUrl(record.linkedin) ?? contacts.linkedin,
    github: normalizeUrl(record.github) ?? contacts.github,
    bio,
    skills,
    experience: experience.length ? experience : fallbackExperience(sections),
    education: resolvedEducation,
    projects: projects.length ? projects : fallbackProjects(sections),
    certifications: unique(stringArray(record.certifications)),
    languages: unique(stringArray(record.languages)),
    awards: unique(stringArray(record.awards)),
    extracurricular: normalizeTitledSections(record.extracurricular),
    otherSections: normalizeTitledSections(record.otherSections),
    portfolioSuggestions:
      record.portfolioSuggestions && typeof record.portfolioSuggestions === 'object'
        ? {
            heroTagline: cleanText((record.portfolioSuggestions as UnknownRecord).heroTagline),
            bioVariants: stringArray((record.portfolioSuggestions as UnknownRecord).bioVariants),
            missingFields: stringArray(
              (record.portfolioSuggestions as UnknownRecord).missingFields,
            ),
            recommendedSectionOrder: stringArray(
              (record.portfolioSuggestions as UnknownRecord).recommendedSectionOrder,
            ),
          }
        : {
            heroTagline: undefined,
            bioVariants: [],
            missingFields: ['Review imported text', 'Add project links', 'Add social links'],
            recommendedSectionOrder: ['profile', 'experience', 'projects', 'skills', 'education'],
          },
  };

  return resumeDataSchema.parse(normalized);
}

export function buildFallbackResumeData(rawText: string): ResumeData {
  return normalizeResumeData({}, rawText);
}
