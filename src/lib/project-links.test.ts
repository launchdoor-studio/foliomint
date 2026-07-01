import { describe, expect, it } from 'vitest';

import { getProjectLinks, inferProjectLinkLabel, normalizeProjectLinks } from '@/lib/project-links';
import { normalizeProjectBullets } from '@/lib/resume-parser';

describe('project links', () => {
  it('infers store and repo labels from URLs', () => {
    expect(inferProjectLinkLabel('https://github.com/you/patterns')).toBe('GitHub');
    expect(inferProjectLinkLabel('https://gitlab.com/you/patterns')).toBe('GitLab');
    expect(inferProjectLinkLabel('https://apps.apple.com/app/id123')).toBe('App Store');
    expect(inferProjectLinkLabel('https://play.google.com/store/apps/details?id=com.you.app')).toBe(
      'Play Store',
    );
  });

  it('merges legacy url with links and dedupes', () => {
    const links = normalizeProjectLinks(
      [{ label: 'GitHub', url: 'https://github.com/you/patterns' }],
      'https://github.com/you/patterns',
    );
    expect(links).toHaveLength(1);
    expect(getProjectLinks({ url: 'https://example.com/patterns' })).toEqual([
      { label: 'Website', url: 'https://example.com/patterns' },
    ]);
  });
});

describe('normalizeProjectBullets', () => {
  it('splits a long single bullet into meaningful bullets', () => {
    const copy =
      'Open-source cross-platform Flutter/Dart journaling app for OCD pattern tracking – implements a clinical-psychology exercise to help users identify and analyze compulsive patterns.';
    const { bullets, description } = normalizeProjectBullets([copy]);
    expect(bullets.length).toBeGreaterThanOrEqual(2);
    expect(description).toBeUndefined();
  });

  it('moves a long description into bullets when bullets are empty', () => {
    const { bullets, description } = normalizeProjectBullets(
      [],
      'Built a real-time dashboard; integrated Stripe billing; shipped to 2k users in beta.',
    );
    expect(bullets.length).toBeGreaterThanOrEqual(2);
    expect(description).toBeUndefined();
  });
});
