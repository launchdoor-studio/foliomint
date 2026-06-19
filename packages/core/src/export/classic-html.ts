import { normalizePortfolioAccent } from '../portfolio-accent';
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
      const url = p.url ? `<p><a href="${escapeHtml(normalizeOutboundHref(p.url))}" target="_blank" rel="noopener">${escapeHtml(p.url)}</a></p>` : '';
      const desc = p.description ? `<p>${escapeHtml(p.description)}</p>` : '';
      const bullets = p.bullets?.length
        ? `<ul>${p.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
        : '';
      const tech =
        p.technologies?.length ?
          `<p class="tags">${p.technologies.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</p>`
        : '';
      return `<article class="item"><h3>${escapeHtml(p.name)}</h3>${desc}${url}${tech}${bullets}</article>`;
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
  --bg: #fafafa;
  --text: #27272a;
  --muted: #71717a;
  --border: #e4e4e7;
  --card: #ffffff;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #09090b;
    --text: #e4e4e7;
    --muted: #a1a1aa;
    --border: #3f3f46;
    --card: #18181b;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}
.page { max-width: 48rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
.hero { border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; margin-bottom: 2rem; }
.hero h1 { margin: 0 0 0.5rem; font-size: 2rem; letter-spacing: -0.02em; }
.location { color: var(--muted); margin: 0 0 1rem; }
.links { display: flex; flex-wrap: wrap; gap: 0.75rem 1rem; }
.profile-link { color: var(--portfolio-accent); text-decoration: none; font-weight: 600; font-size: 0.875rem; }
.profile-link:hover { text-decoration: underline; }
.section { margin-bottom: 2.5rem; }
.section h2 { font-size: 1.125rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin: 0 0 1rem; }
.item { margin-bottom: 1.25rem; }
.item h3 { margin: 0 0 0.25rem; font-size: 1rem; }
.meta { color: var(--muted); font-size: 0.875rem; }
ul { margin: 0.5rem 0 0; padding-left: 1.25rem; }
.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 0.8125rem;
  background: var(--card);
}
.site-footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.8125rem;
  text-align: center;
}
.site-footer a { color: var(--portfolio-accent); }
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
