import { describe, expect, it } from 'vitest';

import { exportClassicSite } from '@foliomint/core';

describe('exportClassicSite', () => {
  it('generates static files with portfolio content', () => {
    const files = exportClassicSite(
      {
        name: 'Jane Doe',
        skills: ['TypeScript'],
        experience: [{ company: 'Acme', role: 'Engineer', startDate: '2020', bullets: ['Built things'] }],
        education: [],
        projects: [],
        location: 'NYC',
      },
      { theme: 'classic', includeFooter: true, title: 'Jane Portfolio' },
    );

    expect(files['index.html']).toContain('Jane Doe');
    expect(files['index.html']).toContain('FolioMint');
    expect(files['styles.css']).toContain('--portfolio-accent');
    expect(files['theme.js']).toBeTruthy();
  });

  it('omits footer when Pro export', () => {
    const files = exportClassicSite(
      { name: 'Pro User', skills: [], experience: [], education: [], projects: [] },
      { theme: 'classic', includeFooter: false },
    );
    expect(files['index.html']).not.toContain('Built with');
  });
});
