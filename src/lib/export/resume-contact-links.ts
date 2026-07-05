import { normalizeOutboundHref } from '@/lib/utils';

export interface ResumeContactLink {
  label: string;
  href?: string;
}

export function resolveWebsiteHref(raw: string): string {
  return normalizeOutboundHref(raw.trim());
}

export function resolveGithubHref(raw: string): string {
  const s = raw.trim().replace(/^@/, '');
  if (/github\.com/i.test(s)) return normalizeOutboundHref(s);
  return `https://github.com/${s}`;
}

export function resolveLinkedInHref(raw: string): string {
  const s = raw.trim();
  if (/linkedin\.com/i.test(s)) return normalizeOutboundHref(s);
  const slug = s.replace(/^@/, '').replace(/^in\//i, '');
  return `https://www.linkedin.com/in/${slug}`;
}

export function formatWebsiteLabel(raw: string): string {
  const href = resolveWebsiteHref(raw);
  try {
    const host = new URL(href).hostname.replace(/^www\./i, '');
    return host || raw.trim();
  } catch {
    return raw.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
}

export function formatGithubLabel(raw: string): string {
  const s = raw.trim().replace(/^@/, '');
  if (/github\.com/i.test(s)) {
    try {
      const path = new URL(normalizeOutboundHref(s)).pathname.replace(/^\/|\/$/g, '');
      return path || 'GitHub';
    } catch {
      /* fall through */
    }
  }
  return s || 'GitHub';
}

export function formatLinkedInLabel(raw: string): string {
  const s = raw.trim();
  if (/linkedin\.com/i.test(s)) {
    try {
      const path = new URL(normalizeOutboundHref(s)).pathname.replace(/^\/|\/$/g, '');
      const inMatch = path.match(/^in\/([^/]+)/i);
      if (inMatch?.[1]) return inMatch[1];
      return path.split('/').filter(Boolean).pop() || 'LinkedIn';
    } catch {
      /* fall through */
    }
  }
  return s.replace(/^@/, '').replace(/^in\//i, '') || 'LinkedIn';
}

export function buildResumeContactLinks(input: {
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  location?: string | null;
}): ResumeContactLink[] {
  const items: ResumeContactLink[] = [];

  if (input.email?.trim()) {
    const email = input.email.trim();
    items.push({ label: email, href: `mailto:${email}` });
  }
  if (input.website?.trim()) {
    const href = resolveWebsiteHref(input.website);
    if (href) {
      items.push({
        label: formatWebsiteLabel(input.website),
        href,
      });
    }
  }
  if (input.github?.trim()) {
    const href = resolveGithubHref(input.github);
    if (href) {
      items.push({
        label: formatGithubLabel(input.github),
        href,
      });
    }
  }
  if (input.linkedin?.trim()) {
    const href = resolveLinkedInHref(input.linkedin);
    if (href) {
      items.push({
        label: formatLinkedInLabel(input.linkedin),
        href,
      });
    }
  }
  if (input.phone?.trim()) {
    const phone = input.phone.trim();
    items.push({ label: phone, href: `tel:${phone.replace(/\s/g, '')}` });
  }
  if (input.location?.trim()) {
    items.push({ label: input.location.trim() });
  }

  return items;
}
