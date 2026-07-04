import { describe, expect, it } from 'vitest';

import {
  buildFallbackResumeData,
  normalizeExperienceBullets,
  normalizeResumeData,
  normalizeSkills,
} from '@/lib/resume-parser';

const RAW_RESUME = `
Aftaab Siddiqui
aftaab@example.com | +91 98765 43210 | Bengaluru, India
https://github.com/aftaab | https://linkedin.com/in/aftaab

Summary
Full-stack engineer building AI-assisted products and developer tools.

Technical Skills
TypeScript, React, Next.js, Python, C++, PostgreSQL, Docker

Experience
Founder at Launchdoor
Jan 2024 - Present
Built portfolio tooling for creators

Education
Example University
B.Tech Computer Science
2020 - 2024

Projects
FolioMint
AI-assisted portfolio builder
`;

describe('resume parser normalization', () => {
  it('keeps useful AI fields when one field is malformed', () => {
    const normalized = normalizeResumeData(
      {
        name: 'Aftaab Siddiqui',
        email: 'not an email',
        headline: 'Full-stack engineer',
        skills: 'TypeScript, React',
        experience: [
          {
            company: 'Launchdoor',
            role: 'Founder',
            startDate: '2024',
            bullets: 'Built portfolio tooling; Shipped AI parsing',
          },
        ],
      },
      RAW_RESUME,
    );

    expect(normalized.email).toBe('aftaab@example.com');
    expect(normalized.skills).toEqual(
      expect.arrayContaining(['TypeScript', 'React', 'Next.js', 'Python', 'C++']),
    );
    expect(normalized.experience[0]).toMatchObject({
      company: 'Launchdoor',
      role: 'Founder',
      bullets: ['Built portfolio tooling', 'Shipped AI parsing'],
    });
  });

  it('fallback extraction fills contact and skills from raw text', () => {
    const fallback = buildFallbackResumeData(RAW_RESUME);

    expect(fallback.name).toBe('Aftaab Siddiqui');
    expect(fallback.email).toBe('aftaab@example.com');
    expect(fallback.github).toBe('https://github.com/aftaab');
    expect(fallback.linkedin).toBe('https://linkedin.com/in/aftaab');
    expect(fallback.skills).toEqual(expect.arrayContaining(['TypeScript', 'React', 'Docker']));
    expect(fallback.bio).toContain('Full-stack engineer');
    expect(fallback.experience[0]).toMatchObject({
      company: 'Launchdoor',
      role: 'Founder',
      bullets: ['Built portfolio tooling for creators'],
    });
    expect(fallback.education[0]).toMatchObject({
      institution: 'Example University',
      degree: 'B.Tech Computer Science',
    });
    expect(fallback.projects[0]).toMatchObject({
      name: 'FolioMint',
      bullets: ['AI-assisted portfolio builder'],
    });
  });

  it('infers github and linkedin from icon-style bare handles in a contact row', () => {
    const iconRowResume = `
Aftaab Siddiqui
aftaab@aftaab.dev | aftaab.dev | maskedsyntax | aftaabsiddiqui | India

Summary
Full-stack engineer.
`;

    const fallback = buildFallbackResumeData(iconRowResume);
    expect(fallback.github).toBe('https://github.com/maskedsyntax');
    expect(fallback.linkedin).toBe('https://www.linkedin.com/in/aftaabsiddiqui');
    expect(fallback.website).toBe('https://aftaab.dev');
    expect(fallback.email).toBe('aftaab@aftaab.dev');
  });

  it('normalizes bare github and linkedin handles from AI output', () => {
    const normalized = normalizeResumeData(
      {
        name: 'Aftaab Siddiqui',
        github: 'maskedsyntax',
        linkedin: 'aftaabsiddiqui',
      },
      'Aftaab Siddiqui',
    );

    expect(normalized.github).toBe('https://github.com/maskedsyntax');
    expect(normalized.linkedin).toBe('https://www.linkedin.com/in/aftaabsiddiqui');
  });

  it('trims overcrowded categorized skills and blocks institution names', () => {
    const noisy = normalizeSkills(
      [
        'TypeScript',
        'Languages : TypeScript',
        'Frontend / Backend : React',
        'Mobile / Desktop : Flutter',
        'Data / Infrastructure : PostgreSQL',
        'self-hosting',
        'deployment pipelines',
        'GitHub Actions',
        'AI / ML : PyTorch',
        'on-device inference',
        'vector retrieval',
        'semantic search',
        'model compression',
        'dataset profiling',
        'Nirma University',
        'JavaScript',
        'Go',
        'Java',
        'Python',
        'Rust',
        'Dart',
        'SQL',
        'Next.js',
        'SvelteKit',
        'TailwindCSS',
        'Spring Boot',
        'Node.js',
        'Angular',
        'Docker',
        'Redis',
      ],
      [{ institution: 'Nirma University' }],
    );

    expect(noisy).toContain('TypeScript');
    expect(noisy).toContain('React');
    expect(noisy).toContain('PostgreSQL');
    expect(noisy).not.toContain('Nirma University');
    expect(noisy.some((skill) => skill.includes(':'))).toBe(false);
    expect(noisy.length).toBeLessThanOrEqual(24);
  });

  it('merges fragmented experience bullets instead of comma-split noise', () => {
    const bullets = normalizeExperienceBullets([
      'Designed and built FIR',
      'CSR',
      'and additional backend microservices from scratch in Java Spring Boot for a large-scale Crime Reporting & Analysis System',
      'Shipped backend fixes and feature work across three state-level deployments',
      'occasional Angular work on operator-facing screens',
      'Optimized SQL queries and debugged production incidents to improve reliability of real-time case-management workflows',
    ]);

    expect(bullets).toHaveLength(3);
    expect(bullets[0]).toContain('FIR');
    expect(bullets[0]).toContain('CSR');
    expect(bullets[0]).toContain('Java Spring Boot');
    expect(bullets[1]).toContain('Shipped backend fixes');
    expect(bullets[1]).toContain('Angular');
    expect(bullets[2]).toMatch(/^Optimized SQL queries/);
  });

  it('groups founder-style product bullets into a few shipped outcomes', () => {
    const bullets = normalizeExperienceBullets([
      'Shipped Botttle',
      'a self-hosted ops platform for freelancers – projects',
      'invoicing',
      'billable time tracking',
      'RBAC client portal',
      'audit logs. Bun + Fastify + React',
      'Docker Compose + Postgres/Redis',
      'Shipped Queriously',
      'a macOS PDF research app for sensitive documents – runs chunking',
      'local embeddings',
      'vector retrieval',
      'and cited Q&A entirely on-device with Tauri/Rust + Python',
    ]);

    expect(bullets.length).toBeLessThanOrEqual(6);
    expect(bullets[0]).toMatch(/^Shipped Botttle/i);
    expect(bullets[0]).toContain('invoicing');
    expect(bullets.some((bullet) => /Queriously/i.test(bullet))).toBe(true);
  });
});
