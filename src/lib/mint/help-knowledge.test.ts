import { describe, expect, it } from 'vitest';

import { buildMintSystemPrompt } from '@/lib/mint/help-knowledge';
import { getFoliomintKnowledgeBase, resetFoliomintKnowledgeCache } from '@/lib/mint/knowledge-base';

describe('mint knowledge base', () => {
  it('loads the FolioMint source-of-truth document', () => {
    resetFoliomintKnowledgeCache();
    const doc = getFoliomintKnowledgeBase();
    expect(doc).toContain('FolioMint platform knowledge');
    expect(doc).toContain('Re-import resume');
    expect(doc).toContain('Resume health panel');
    expect(doc).toContain('3 per rolling 30 days');
    expect(doc).toContain('Known limitations');
  });

  it('includes knowledge base and session context in the system prompt', () => {
    const prompt = buildMintSystemPrompt({
      pathname: '/editor/abc',
      editorStep: 'profile',
      tier: 'pro',
      hasPortfolio: true,
      isPublished: false,
      resumeHealth: {
        score: 63,
        label: 'Getting there',
        openItems: [
          {
            id: 'bullets',
            label: 'Enough impact bullets',
            editorStep: 'Experience or Projects',
          },
        ],
        missingFields: [],
      },
    });

    expect(prompt).toContain('# FolioMint Knowledge Base');
    expect(prompt).toContain('Re-import resume');
    expect(prompt).toContain('Resume health: 63/100');
    expect(prompt).toContain('Enough impact bullets');
    expect(prompt).toContain('Security and confidentiality');
    expect(prompt).toContain('NEVER disclose');
  });
});
