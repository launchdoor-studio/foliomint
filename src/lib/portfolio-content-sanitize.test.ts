import { describe, expect, it } from 'vitest';

import { createBlankPortfolioContent } from '@/lib/portfolio-content';
import {
  parseAndSanitizePortfolioContent,
  sanitizePortfolioContentUrls,
} from '@/lib/portfolio-content-sanitize';

describe('portfolio-content-sanitize', () => {
  it('strips javascript URLs from profile and project links', () => {
    const content = sanitizePortfolioContentUrls({
      ...createBlankPortfolioContent('Test User'),
      website: 'javascript:alert(1)',
      github: 'https://github.com/safe',
      projects: [
        {
          name: 'App',
          description: '',
          url: 'javascript:alert(2)',
          links: [{ label: 'Demo', url: 'https://demo.example.com' }],
          technologies: [],
          bullets: [],
        },
      ],
    });

    expect(content.website).toBeUndefined();
    expect(content.github).toBe('https://github.com/safe');
    expect(content.projects[0]?.url).toBeUndefined();
    expect(content.projects[0]?.links).toEqual([{ label: 'Demo', url: 'https://demo.example.com' }]);
  });

  it('rejects invalid portfolio content shape', () => {
    const result = parseAndSanitizePortfolioContent({ name: 123 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/name/i);
    }
  });

  it('accepts valid blank content', () => {
    const result = parseAndSanitizePortfolioContent(createBlankPortfolioContent('Alice'));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content.name).toBe('Alice');
    }
  });
});
