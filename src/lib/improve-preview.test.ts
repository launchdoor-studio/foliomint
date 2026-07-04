import { describe, expect, it } from 'vitest';

import { formatImprovePreview, normalizeImproveAfter } from '@/lib/improve-preview';

describe('improve-preview', () => {
  it('unwraps nested bio from model output', () => {
    const nested = {
      bio: 'Results-driven software engineer with a passion for crafting polished developer experiences.',
    };
    expect(normalizeImproveAfter('bio', nested)).toBe(nested.bio);
    expect(formatImprovePreview('bio', nested)).toBe(nested.bio);
  });

  it('formats skills as a comma-separated list', () => {
    expect(formatImprovePreview('skills', ['TypeScript', 'React'])).toBe('TypeScript, React');
  });

  it('shows plain strings for headline', () => {
    expect(formatImprovePreview('headline', 'Product engineer')).toBe('Product engineer');
  });
});
