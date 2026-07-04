import type { ResumeData } from '@/types';

export interface ResumeHealthResult {
  score: number;
  label: 'Needs work' | 'Getting there' | 'Strong';
  checks: Array<{ id: string; label: string; passed: boolean; hint?: string }>;
}

const METRICS_PATTERN = /\d+%|\$\d|[\d,]+\+?|\d+x|\d+\s*(users|customers|clients|projects)/i;

export function scoreResumeHealth(content: ResumeData): ResumeHealthResult {
  const experienceBullets = (content.experience ?? []).flatMap((e) => e.bullets ?? []);
  const projectBullets = (content.projects ?? []).flatMap((p) => p.bullets ?? []);
  const allBullets = [...experienceBullets, ...projectBullets];

  const hasMetrics = allBullets.some((b) => METRICS_PATTERN.test(b));
  const hasEnoughBullets = allBullets.length >= 4;
  const hasProjects = (content.projects ?? []).length >= 1;
  const hasSkills = (content.skills ?? []).length >= 3;
  const hasBio = Boolean(content.bio?.trim());
  const hasHeadline = Boolean(content.headline?.trim());
  const hasContact = Boolean(content.email || content.linkedin || content.github || content.website);
  const missingFromAi = content.portfolioSuggestions?.missingFields?.length ?? 0;

  const checks = [
    {
      id: 'bio',
      label: 'Professional summary',
      passed: hasBio,
      hint: 'Add a 2–4 sentence bio on the Profile step.',
    },
    {
      id: 'headline',
      label: 'Portfolio headline',
      passed: hasHeadline,
      hint: 'Add a concise headline that states your role or focus.',
    },
    {
      id: 'projects',
      label: 'At least one project',
      passed: hasProjects,
      hint: 'Projects help visitors judge your work — add one on the Projects step.',
    },
    {
      id: 'bullets',
      label: 'Enough impact bullets',
      passed: hasEnoughBullets,
      hint: 'Add achievement bullets to experience and projects.',
    },
    {
      id: 'metrics',
      label: 'Quantified impact',
      passed: hasMetrics,
      hint: 'Include numbers where possible (% faster, $ saved, users served).',
    },
    {
      id: 'skills',
      label: 'Skills listed',
      passed: hasSkills,
      hint: 'Add core tools and technologies on the Skills step.',
    },
    {
      id: 'contact',
      label: 'Contact or profile links',
      passed: hasContact,
      hint: 'Add email, LinkedIn, GitHub, or a personal site.',
    },
    {
      id: 'gaps',
      label: 'No major gaps flagged by Mint',
      passed: missingFromAi === 0,
      hint:
        missingFromAi > 0
          ? `Mint flagged ${missingFromAi} gap(s) — review suggestions below.`
          : undefined,
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);

  let label: ResumeHealthResult['label'] = 'Needs work';
  if (score >= 75) label = 'Strong';
  else if (score >= 50) label = 'Getting there';

  return { score, label, checks };
}
