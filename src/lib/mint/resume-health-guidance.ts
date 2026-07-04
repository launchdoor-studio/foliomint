import type { ResumeHealthResult } from '@/lib/resume-health';
import type { ResumeData } from '@/types';

const CHECK_EDITOR_STEP: Record<string, string> = {
  bio: 'Profile',
  headline: 'Profile',
  projects: 'Projects',
  bullets: 'Experience or Projects',
  metrics: 'Experience or Projects',
  skills: 'Skills',
  contact: 'Profile',
  gaps: 'Profile',
};

export interface MintResumeHealthSnapshot {
  score: number;
  label: string;
  openItems: Array<{ id: string; label: string; hint?: string; editorStep: string }>;
  missingFields: string[];
  suggestedTagline?: string;
}

export function buildMintResumeHealthSnapshot(content: ResumeData, health: ResumeHealthResult): MintResumeHealthSnapshot {
  const openItems = health.checks
    .filter((check) => !check.passed)
    .map((check) => ({
      id: check.id,
      label: check.label,
      hint: check.hint,
      editorStep: CHECK_EDITOR_STEP[check.id] ?? 'Profile',
    }));

  return {
    score: health.score,
    label: health.label,
    openItems,
    missingFields: content.portfolioSuggestions?.missingFields ?? [],
    suggestedTagline: content.portfolioSuggestions?.heroTagline,
  };
}

export function isResumeHealthQuestion(message: string): boolean {
  return /resume health|health score|health panel|enough impact|quantified impact|achievement bullet|what am i supposed to do|what do i do|what should i fix|what to fix|help me (with|fix|improve)/i.test(
    message.trim(),
  );
}

export function buildResumeHealthMintAnswer(snapshot: MintResumeHealthSnapshot | undefined): string | null {
  if (!snapshot) return null;

  if (snapshot.openItems.length === 0) {
    return `Your resume health is **${snapshot.score}/100 — ${snapshot.label}**. You're in good shape on the checklist. If you want to polish further, tighten bullet wording on **Experience** or add one more project highlight.`;
  }

  const lines: string[] = [
    `You're at **${snapshot.score}/100 — ${snapshot.label}**. Happy to help — here's what I'd do next:`,
    '',
  ];

  snapshot.openItems.slice(0, 4).forEach((item, index) => {
    const hint = item.hint ? ` ${item.hint}` : '';
    lines.push(`${index + 1}. **${item.label}** — open **${item.editorStep}** in the wizard.${hint}`);
  });

  if (snapshot.missingFields.length > 0) {
    lines.push('');
    lines.push(`Also on the gaps list: ${snapshot.missingFields.join('; ')}.`);
  }

  if (snapshot.suggestedTagline) {
    lines.push('');
    lines.push(`You could use the suggested tagline "${snapshot.suggestedTagline}" on **Profile** if it fits your voice.`);
  }

  lines.push('');
  lines.push('Save after each edit and your score will update. Tell me a role or project if you want help wording a bullet.');

  return lines.join('\n');
}
