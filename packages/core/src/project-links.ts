import type { Project, ProjectLink } from './types';

function normalizeHrefKey(href: string): string {
  return href.trim().replace(/\/$/, '').toLowerCase();
}

export function inferProjectLinkLabel(url: string): string {
  const raw = url.trim().toLowerCase();
  let host = '';
  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
    host = new URL(withScheme).hostname.toLowerCase();
  } catch {
    return 'Link';
  }

  if (host === 'github.com' || host.endsWith('.github.com')) return 'GitHub';
  if (host === 'gitlab.com' || host.endsWith('.gitlab.com')) return 'GitLab';
  if (host === 'apps.apple.com' || host === 'itunes.apple.com') return 'App Store';
  if (host === 'play.google.com') return 'Play Store';
  if (host.includes('apps.microsoft.com') || host === 'microsoft.com') return 'Microsoft Store';
  if (host === 'npmjs.com' || host.endsWith('.npmjs.com')) return 'npm';
  if (host === 'pypi.org') return 'PyPI';
  if (host === 'crates.io') return 'crates.io';
  if (raw.includes('demo') || host.startsWith('demo.')) return 'Demo';
  return 'Website';
}

export function normalizeProjectLink(value: unknown): ProjectLink | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const url =
    typeof record.url === 'string'
      ? record.url.trim()
      : typeof record.href === 'string'
        ? record.href.trim()
        : '';
  if (!url) return null;

  const labelRaw =
    typeof record.label === 'string'
      ? record.label.trim()
      : typeof record.type === 'string'
        ? record.type.trim()
        : '';
  const label = labelRaw || inferProjectLinkLabel(url);
  return { label, url };
}

export function normalizeProjectLinks(value: unknown, legacyUrl?: string | null): ProjectLink[] {
  const links: ProjectLink[] = [];
  if (Array.isArray(value)) {
    for (const item of value) {
      const link = normalizeProjectLink(item);
      if (link) links.push(link);
    }
  }

  const legacy = legacyUrl?.trim();
  if (legacy) {
    links.push({ label: inferProjectLinkLabel(legacy), url: legacy });
  }

  const seen = new Set<string>();
  return links.filter((link) => {
    const key = normalizeHrefKey(link.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getProjectLinks(project: Pick<Project, 'url' | 'links'>): ProjectLink[] {
  return normalizeProjectLinks(project.links, project.url);
}
