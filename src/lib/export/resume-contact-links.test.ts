import { describe, expect, it } from 'vitest';

import {
  buildResumeContactLinks,
  formatGithubLabel,
  formatLinkedInLabel,
  formatWebsiteLabel,
  resolveGithubHref,
} from '@/lib/export/resume-contact-links';

describe('resume-contact-links', () => {
  it('uses short labels with full hrefs', () => {
    const links = buildResumeContactLinks({
      email: 'aftaab@aftaab.dev',
      website: 'https://aftaab.dev',
      github: 'https://github.com/maskedsyntax',
      linkedin: 'https://linkedin.com/in/aftaabsiddiqui',
      location: 'India',
    });

    expect(links).toEqual([
      { label: 'aftaab@aftaab.dev', href: 'mailto:aftaab@aftaab.dev' },
      { label: 'aftaab.dev', href: 'https://aftaab.dev' },
      { label: 'maskedsyntax', href: 'https://github.com/maskedsyntax' },
      { label: 'aftaabsiddiqui', href: 'https://linkedin.com/in/aftaabsiddiqui' },
      { label: 'India' },
    ]);
  });

  it('accepts bare github usernames', () => {
    expect(formatGithubLabel('maskedsyntax')).toBe('maskedsyntax');
    expect(resolveGithubHref('maskedsyntax')).toBe('https://github.com/maskedsyntax');
  });

  it('formats website hostnames', () => {
    expect(formatWebsiteLabel('https://www.example.com/path')).toBe('example.com');
  });

  it('formats linkedin slugs from paths', () => {
    expect(formatLinkedInLabel('https://www.linkedin.com/in/aftaabsiddiqui/')).toBe('aftaabsiddiqui');
  });
});
