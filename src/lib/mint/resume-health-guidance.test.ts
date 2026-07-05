import { describe, expect, it } from 'vitest';

import { buildMintSystemPrompt } from '@/lib/mint/help-knowledge';
import { buildResumeHealthMintAnswer } from '@/lib/mint/resume-health-guidance';

describe('resume health mint guidance', () => {
  const snapshot = {
    score: 88,
    label: 'Strong',
    openItems: [
      {
        id: 'gaps',
        label: 'No major gaps flagged by Mint',
        hint: 'Still open: Project links.',
        editorStep: 'Resume health',
      },
    ],
    missingFields: ['Project links'],
    openGaps: ['Project links'],
    resolvedGaps: ['GitHub/LinkedIn profiles'],
    profileLinks: {
      email: true,
      phone: false,
      website: true,
      github: true,
      linkedin: true,
      profileImage: false,
    },
    projects: { total: 2, withLinks: 0 },
    suggestedTagline: 'Building thoughtful products',
  };

  it('builds a personalized action plan with stale gaps called out', () => {
    const answer = buildResumeHealthMintAnswer(snapshot);
    expect(answer).toContain('88/100');
    expect(answer).toContain('Project links');
    expect(answer).toContain('Already done in your editor');
    expect(answer).toContain('GitHub/LinkedIn profiles');
  });

  it('includes live portfolio snapshot in the Mint system prompt', () => {
    const prompt = buildMintSystemPrompt({
      pathname: '/editor/abc',
      resumeHealth: snapshot,
    });
    expect(prompt).toContain('Portfolio snapshot');
    expect(prompt).toContain('github set');
    expect(prompt).toContain('linkedin set');
    expect(prompt).toContain('Open parse suggestions: Project links');
    expect(prompt).toContain('Already satisfied');
    expect(prompt).toContain('Resume health & portfolio intelligence');
    expect(prompt).not.toContain('Suggested health plan for this user');
  });
});
