import { describe, expect, it } from 'vitest';

import {
  isParseGapSatisfied,
  reconcilePortfolioGaps,
} from '@/lib/mint/portfolio-gap-reconciliation';
import { createBlankPortfolioContent } from '@/lib/portfolio-content';

describe('portfolio gap reconciliation', () => {
  it('resolves GitHub/LinkedIn gaps when profile fields are filled', () => {
    const content = {
      ...createBlankPortfolioContent(),
      github: 'https://github.com/maskedsyntax',
      linkedin: 'https://linkedin.com/in/aftaabsiddiqui',
      portfolioSuggestions: {
        missingFields: ['Project links', 'GitHub/LinkedIn profiles'],
      },
    };

    const status = reconcilePortfolioGaps(content);
    expect(status.openGaps).toEqual(['Project links']);
    expect(status.resolvedGaps).toContain('GitHub/LinkedIn profiles');
    expect(status.profileLinks.github).toBe(true);
    expect(status.profileLinks.linkedin).toBe(true);
  });

  it('keeps project link gaps when no project URLs exist', () => {
    const content = {
      ...createBlankPortfolioContent(),
      projects: [{ name: 'FolioMint', description: 'Portfolio builder', technologies: [], bullets: [] }],
      portfolioSuggestions: {
        missingFields: ['Project links'],
      },
    };

    expect(isParseGapSatisfied('Project links', content)).toBe(false);
    expect(reconcilePortfolioGaps(content).openGaps).toEqual(['Project links']);
  });

  it('resolves project link gaps when a project has links', () => {
    const content = {
      ...createBlankPortfolioContent(),
      projects: [
        {
          name: 'FolioMint',
          description: 'Portfolio builder',
          technologies: [],
          bullets: [],
          links: [{ label: 'GitHub', url: 'https://github.com/org/repo' }],
        },
      ],
      portfolioSuggestions: {
        missingFields: ['Project links'],
      },
    };

    expect(reconcilePortfolioGaps(content).openGaps).toEqual([]);
  });
});
