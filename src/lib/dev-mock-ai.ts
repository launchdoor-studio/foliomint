import type { ImproveRequest, ImproveResult } from '@/lib/groq-improve';
import type { MintContext } from '@/lib/mint/help-knowledge';
import { getFoliomintKnowledgeBase } from '@/lib/mint/knowledge-base';
import { createBlankPortfolioContent } from '@/lib/portfolio-content';
import type { ResumeData } from '@/types';

const DEV_NOTE =
  ' (Local dev mock — set GROQ_API_KEY in .env.local for full Mint responses.)';

export function buildMockResumeFromText(rawText: string, fallbackName?: string): ResumeData {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const name =
    lines.find((line) => line.length > 1 && line.length < 80 && !line.includes('@')) ??
    fallbackName ??
    'Dev User';

  const emailLine = lines.find((line) => line.includes('@'));
  const email = emailLine?.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0];

  return {
    ...createBlankPortfolioContent(name),
    email,
    headline: 'Software Engineer',
    bio: `Portfolio built from your uploaded file in local dev mode.${DEV_NOTE}`,
    skills: ['TypeScript', 'React', 'Node.js', 'Product design'],
    experience: [
      {
        company: 'Example Co',
        role: 'Software Engineer',
        startDate: '2022',
        endDate: 'Present',
        bullets: [
          'Shipped user-facing features with measurable impact on engagement.',
          'Collaborated across design and backend teams on portfolio tooling.',
        ],
      },
    ],
    education: [
      {
        institution: 'State University',
        degree: 'B.S.',
        field: 'Computer Science',
        startDate: '2018',
        endDate: '2022',
      },
    ],
    projects: [
      {
        name: 'Portfolio Builder',
        description: 'A personal site generated from resume data.',
        technologies: ['Next.js', 'Tailwind CSS'],
        bullets: ['Structured content for fast editing and publishing.'],
      },
    ],
    portfolioSuggestions: {
      heroTagline: 'Building thoughtful products',
      bioVariants: ['Engineer focused on polished developer experiences.'],
      missingFields: ['Add a profile photo', 'Link GitHub or LinkedIn'],
      recommendedSectionOrder: ['profile', 'projects', 'experience', 'skills', 'education'],
    },
  };
}

export function mockImproveResumeSection(req: ImproveRequest): ImproveResult {
  const { section, content, targetIndex = 0 } = req;

  if (section === 'headline') {
    const before = content.headline ?? '';
    const after = before.trim()
      ? `${before.trim()} — impact-driven builder`
      : `Software engineer shipping polished products${DEV_NOTE}`;
    return { before, after, patch: { headline: after } };
  }

  if (section === 'bio') {
    const before = content.bio ?? '';
    const after = before.trim()
      ? `${before.trim()} Focused on clarity, craft, and measurable outcomes.${DEV_NOTE}`
      : `I build reliable web products and enjoy turning resumes into portfolios.${DEV_NOTE}`;
    return { before, after, patch: { bio: after } };
  }

  if (section === 'skills') {
    const before = content.skills;
    const after = Array.from(new Set([...before, 'Communication', 'Leadership']));
    return { before, after, patch: { skills: after } };
  }

  if (section === 'experience') {
    const item = content.experience[targetIndex];
    if (!item) {
      throw new Error('Experience entry not found');
    }
    const bullets = item.bullets.length
      ? item.bullets.map((bullet) => bullet.replace(/\.$/, '') + ' with measurable impact.')
      : ['Delivered features that improved user outcomes.'];
    const after = { ...item, bullets };
    const experience = [...content.experience];
    experience[targetIndex] = after;
    return { before: item, after, patch: { experience } };
  }

  if (section === 'projects') {
    const item = content.projects[targetIndex];
    if (!item) {
      throw new Error('Project not found');
    }
    const after = {
      ...item,
      description: item.description?.trim()
        ? `${item.description.trim()}${DEV_NOTE}`
        : `A polished portfolio project${DEV_NOTE}`,
    };
    const projects = [...content.projects];
    projects[targetIndex] = after;
    return { before: item, after, patch: { projects } };
  }

  const item = content.education[targetIndex];
  if (!item) {
    throw new Error('Education entry not found');
  }
  const after = { ...item, degree: item.degree || 'B.S.' };
  const education = [...content.education];
  education[targetIndex] = after;
  return { before: item, after, patch: { education } };
}

export function mockMintReply(message: string, context: MintContext): string {
  const knowledge = getFoliomintKnowledgeBase().toLowerCase();
  const q = message.trim().toLowerCase();

  if (/re-?import|parse.*again|parse my resume/.test(q) && knowledge.includes('re-import resume')) {
    return 'Open the editor toolbar and click **Re-import resume**, upload your file, then **Parse with Mint**. That re-extracts content into this portfolio without creating a new one.';
  }
  if (/publish|go live|make live/.test(q)) {
    return 'Set your **Public username** on the Profile step, then click **Publish** in the editor toolbar. Your site will be at `/u/your-handle`.';
  }
  if (/resume health|what should i fix|health score/.test(q) && context.resumeHealth) {
    const open = context.resumeHealth.openItems.map((item) => item.label).join(', ');
    return `Your resume health is **${context.resumeHealth.score}/100**. Focus on: ${open || 'keeping up the good work'}. Edit the matching wizard steps and save — or use **Ask Mint what to fix first** in the health panel.`;
  }

  return `I'm running in local dev mode without a Groq API key, so this is a stub reply.${DEV_NOTE} Ask about publishing, re-import resume, resume health, or pricing — answers come from our FolioMint knowledge base when Groq is configured.`;
}
