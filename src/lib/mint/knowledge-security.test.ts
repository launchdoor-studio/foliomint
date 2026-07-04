import { describe, expect, it } from 'vitest';

import {
  FORBIDDEN_KNOWLEDGE_PATTERNS,
  getFoliomintKnowledgeBase,
  resetFoliomintKnowledgeCache,
} from '@/lib/mint/knowledge-base';

describe('mint knowledge security', () => {
  it('does not include forbidden internal or secret patterns', () => {
    resetFoliomintKnowledgeCache();
    const doc = getFoliomintKnowledgeBase();
    for (const pattern of FORBIDDEN_KNOWLEDGE_PATTERNS) {
      expect(doc, `matched ${pattern.source}`).not.toMatch(pattern);
    }
  });

  it('includes user-facing product guidance', () => {
    resetFoliomintKnowledgeCache();
    const doc = getFoliomintKnowledgeBase();
    expect(doc).toContain('Re-import resume');
    expect(doc).toContain('Security and confidentiality');
  });
});
