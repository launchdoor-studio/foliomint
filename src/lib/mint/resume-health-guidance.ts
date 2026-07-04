import type { ResumeHealthResult } from '@/lib/resume-health';
import {
  formatProfileLinkStatusForMint,
  reconcilePortfolioGaps,
  type PortfolioGapStatus,
  type ProfileLinkStatus,
  type ProjectLinkStatus,
} from '@/lib/mint/portfolio-gap-reconciliation';
import type { ResumeData } from '@/types';

const CHECK_EDITOR_STEP: Record<string, string> = {
  bio: 'Profile',
  headline: 'Profile',
  projects: 'Projects',
  bullets: 'Experience or Projects',
  metrics: 'Experience or Projects',
  skills: 'Skills',
  contact: 'Profile',
  gaps: 'Awards & more',
};

export interface MintResumeHealthSnapshot {
  score: number;
  label: string;
  openItems: Array<{ id: string; label: string; hint?: string; editorStep: string }>;
  /** @deprecated use openGaps — kept for API compatibility */
  missingFields: string[];
  openGaps: string[];
  resolvedGaps: string[];
  profileLinks: ProfileLinkStatus;
  projects: ProjectLinkStatus;
  suggestedTagline?: string;
}

export function buildMintResumeHealthSnapshot(
  content: ResumeData,
  health: ResumeHealthResult,
): MintResumeHealthSnapshot {
  const gapStatus = reconcilePortfolioGaps(content);
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
    missingFields: gapStatus.openGaps,
    openGaps: gapStatus.openGaps,
    resolvedGaps: gapStatus.resolvedGaps,
    profileLinks: gapStatus.profileLinks,
    projects: gapStatus.projects,
    suggestedTagline: content.portfolioSuggestions?.heroTagline,
  };
}

export function isResumeHealthQuestion(message: string): boolean {
  return /resume health|health score|health panel|enough impact|quantified impact|achievement bullet|what am i supposed to do|what do i do|what should i fix|what to fix|help me (with|fix|improve)|why.*gap|already (have|filled|present)|stale|wrong/i.test(
    message.trim(),
  );
}

export function buildResumeHealthMintAnswer(snapshot: MintResumeHealthSnapshot | undefined): string | null {
  if (!snapshot) return null;

  if (snapshot.openItems.length === 0 && snapshot.openGaps.length === 0) {
    return `Your resume health is **${snapshot.score}/100 — ${snapshot.label}**. The checklist looks good. If you want to polish further, tighten bullets on **Experience** or add another project highlight.`;
  }

  const lines: string[] = [
    `You're at **${snapshot.score}/100 — ${snapshot.label}**. Here's what still needs attention:`,
    '',
  ];

  snapshot.openItems.slice(0, 4).forEach((item, index) => {
    const hint = item.hint ? ` ${item.hint}` : '';
    lines.push(`${index + 1}. **${item.label}** — edit **${item.editorStep}**.${hint}`);
  });

  if (snapshot.openGaps.length > 0) {
    lines.push('');
    lines.push(`Open parse suggestions: ${snapshot.openGaps.join('; ')}.`);
  }

  if (snapshot.resolvedGaps.length > 0) {
    lines.push('');
    lines.push(
      `Already done in your editor (ignore stale parse reminders): ${snapshot.resolvedGaps.join('; ')}.`,
    );
  }

  if (snapshot.suggestedTagline) {
    lines.push('');
    lines.push(
      `Optional tagline idea for **Profile**: "${snapshot.suggestedTagline}".`,
    );
  }

  lines.push('');
  lines.push('Save after edits — the score updates from your current content, not the original parse.');

  return lines.join('\n');
}

export function buildPortfolioSnapshotForMint(content: ResumeData, gapStatus: PortfolioGapStatus) {
  return [
    `- Profile links (live): ${formatProfileLinkStatusForMint(gapStatus.profileLinks)}`,
    `- Projects: ${gapStatus.projects.total} total, ${gapStatus.projects.withLinks} with links`,
    gapStatus.openGaps.length > 0
      ? `- Open parse suggestions: ${gapStatus.openGaps.join('; ')}`
      : '- Open parse suggestions: none',
    gapStatus.resolvedGaps.length > 0
      ? `- Resolved since parse (do not ask user to redo): ${gapStatus.resolvedGaps.join('; ')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n');
}
