import { describe, expect, it } from 'vitest';

import { findCuratedMintAnswer } from '@/lib/mint/help-knowledge';
import { buildResumeHealthMintAnswer } from '@/lib/mint/resume-health-guidance';

describe('resume health mint guidance', () => {
  const snapshot = {
    score: 63,
    label: 'Getting there',
    openItems: [
      {
        id: 'bullets',
        label: 'Enough impact bullets',
        hint: 'Add achievement bullets to experience and projects.',
        editorStep: 'Experience or Projects',
      },
      {
        id: 'metrics',
        label: 'Quantified impact',
        hint: 'Include numbers where possible (% faster, $ saved, users served).',
        editorStep: 'Experience or Projects',
      },
    ],
    missingFields: ['Add a profile photo', 'Link GitHub or LinkedIn'],
    suggestedTagline: 'Building thoughtful products',
  };

  it('builds a personalized action plan', () => {
    const answer = buildResumeHealthMintAnswer(snapshot);
    expect(answer).toContain('63/100');
    expect(answer).toContain('Enough impact bullets');
    expect(answer).toContain('Experience or Projects');
    expect(answer).toContain('Add a profile photo');
    expect(answer).not.toContain('not a chat message');
  });

  it('answers resume health questions with context', () => {
    const answer = findCuratedMintAnswer('what am I supposed to do here?', {
      pathname: '/editor/abc',
      resumeHealth: snapshot,
    });
    expect(answer).toContain('Quantified impact');
  });
});
