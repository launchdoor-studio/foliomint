import { normalizePortfolioAccent } from '../portfolio-accent';
import { getProjectLinks } from '../project-links';
import type { PortfolioContent, PortfolioTheme } from '../types';
import { escapeHtml, normalizeOutboundHref } from '../utils';

export interface ExportOptions {
  theme: PortfolioTheme;
  accentColor?: string | null;
  includeFooter?: boolean;
  title?: string;
}

function linkHtml(label: string, href: string): string {
  const safe = escapeHtml(normalizeOutboundHref(href));
  return `<a href="${safe}" class="profile-link" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function section(title: string, body: string): string {
  if (!body.trim()) return '';
  return `<section class="section"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function renderClassic(content: PortfolioContent, options: ExportOptions): string {
  const accent = normalizePortfolioAccent(options.accentColor);
  const name = escapeHtml(content.name?.trim() || 'Portfolio');
  const bio = content.bio
    ? content.bio
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join('')
    : '';

  const profileLinks: string[] = [];
  if (content.email) profileLinks.push(linkHtml('Email', `mailto:${content.email}`));
  if (content.website) profileLinks.push(linkHtml('Website', content.website));
  if (content.github) profileLinks.push(linkHtml('GitHub', content.github));
  if (content.linkedin) profileLinks.push(linkHtml('LinkedIn', content.linkedin));

  const experience = (content.experience ?? [])
    .map((exp) => {
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
      const bullets = exp.bullets?.length
        ? `<ul>${exp.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
        : '';
      return `<article class="item"><div class="item-head"><h3>${escapeHtml(exp.role)}</h3><span class="meta">${escapeHtml(exp.company)}${dates ? ` · ${escapeHtml(dates)}` : ''}</span></div>${bullets}</article>`;
    })
    .join('');

  const education = (content.education ?? [])
    .map((ed) => {
      const dates = [ed.startDate, ed.endDate].filter(Boolean).join(' – ');
      return `<article class="item"><h3>${escapeHtml(ed.degree)}${ed.field ? ` in ${escapeHtml(ed.field)}` : ''}</h3><p class="meta">${escapeHtml(ed.institution)}${dates ? ` · ${escapeHtml(dates)}` : ''}</p></article>`;
    })
    .join('');

  const projects = (content.projects ?? [])
    .map((p) => {
      const linkButtons = getProjectLinks(p)
        .map(
          (link) =>
            `<a href="${escapeHtml(normalizeOutboundHref(link.url))}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`,
        )
        .join(' ');
      const links = linkButtons ? `<p class="links">${linkButtons}</p>` : '';
      const desc = p.description ? `<p>${escapeHtml(p.description)}</p>` : '';
      const bullets = p.bullets?.length
        ? `<ul>${p.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
        : '';
      const tech =
        p.technologies?.length ?
          `<p class="tags">${p.technologies.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</p>`
        : '';
      return `<article class="item"><h3>${escapeHtml(p.name)}</h3>${desc}${links}${tech}${bullets}</article>`;
    })
    .join('');

  const skills =
    content.skills?.length ?
      `<div class="tags">${content.skills.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join('')}</div>`
    : '';

  const footer = options.includeFooter !== false
    ? `<footer class="site-footer">Built with <a href="https://foliomint.app" target="_blank" rel="noopener">FolioMint</a></footer>`
    : '';

  const pageTitle = escapeHtml(options.title ?? content.name ?? 'Portfolio');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pageTitle}</title>
  <link rel="stylesheet" href="styles.css" />
  <style>:root { --portfolio-accent: ${accent}; }</style>
</head>
<body>
  <div class="page">
    <header class="hero">
      <h1>${name}</h1>
      ${content.location ? `<p class="location">${escapeHtml(content.location)}</p>` : ''}
      ${profileLinks.length ? `<div class="links">${profileLinks.join('')}</div>` : ''}
    </header>
    ${bio ? section('About', bio) : ''}
    ${experience ? section('Experience', experience) : ''}
    ${education ? section('Education', education) : ''}
    ${projects ? section('Projects', projects) : ''}
    ${skills ? section('Skills', skills) : ''}
    ${footer}
  </div>
  <script src="theme.js"></script>
</body>
</html>`;
}

export const CLASSIC_STYLES = `:root {
  --bg: #ffffff;
  --text: #171717;
  --muted: #737373;
  --border: #e5e5e5;
  --pill-bg: #f5f5f5;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0a0a0a;
    --text: #ededed;
    --muted: #a3a3a3;
    --border: #262626;
    --pill-bg: #171717;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
.hero { margin-bottom: 2.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; }
.hero h1 { margin: 0 0 0.35rem; font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; }
.location { color: var(--muted); margin: 0 0 1rem; font-size: 0.875rem; font-family: system-ui, sans-serif; }
.links { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.profile-link {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.8125rem;
  font-family: inherit;
}
.profile-link:hover { color: var(--text); }
.section { margin-bottom: 3rem; }
.section h2 { font-size: 1rem; font-weight: 700; margin: 0 0 1rem; }
.item {
  margin-bottom: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
}
.item h3 { margin: 0 0 0.35rem; font-size: 0.875rem; font-weight: 700; }
.meta { color: var(--muted); font-size: 0.875rem; font-family: system-ui, sans-serif; }
ul { margin: 0.75rem 0 0; padding-left: 1.125rem; font-family: system-ui, sans-serif; }
li { margin-bottom: 0.35rem; color: var(--muted); }
.tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.75rem; }
.tag {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.6875rem;
  background: var(--pill-bg);
  color: var(--muted);
}
.site-footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.75rem;
  text-align: center;
  font-family: system-ui, sans-serif;
}
.site-footer a { color: var(--portfolio-accent); text-decoration: none; }
`;

export const THEME_JS = `(() => {
  const key = 'folio-theme';
  const stored = localStorage.getItem(key);
  if (stored === 'dark') document.documentElement.classList.add('dark');
  if (stored === 'light') document.documentElement.classList.add('light');
})();`;

export function exportClassicSite(
  content: PortfolioContent,
  options: ExportOptions,
): { 'index.html': string; 'styles.css': string; 'theme.js': string } {
  return {
    'index.html': renderClassic(content, options),
    'styles.css': CLASSIC_STYLES,
    'theme.js': THEME_JS,
  };
}

export function exportSiteFiles(
  content: PortfolioContent,
  options: ExportOptions,
): Record<string, string> {
  if (options.theme === 'neubrutalism') {
    return exportClassicSite(content, { ...options, theme: 'classic' });
  }
  return exportClassicSite(content, options);
}
