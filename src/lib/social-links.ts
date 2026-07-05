import { sanitizeOutboundUrl } from '@/lib/safe-url';

export interface SocialLink {
  label: string;
  href: string;
}

const PLATFORM_LABEL: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'X',
  bluesky: 'Bluesky',
  youtube: 'YouTube',
  discord: 'Discord',
  website: 'Website',
  mastodon: 'Mastodon',
  dribbble: 'Dribbble',
  behance: 'Behance',
};

export function integrationToSocialLink(
  platform: string,
  username: string | null,
  data: Record<string, unknown> | null | undefined,
): SocialLink | null {
  const d = data ?? {};
  const explicit = typeof d.url === 'string' ? d.url.trim() : '';
  if (explicit) {
    const href = sanitizeOutboundUrl(explicit);
    if (!href) return null;
    return { label: PLATFORM_LABEL[platform] ?? capitalize(platform), href };
  }
  if (!username?.trim()) return null;
  const u = username.trim();
  const hrefByPlatform: Record<string, string> = {
    github: `https://github.com/${u}`,
    linkedin: `https://www.linkedin.com/in/${u}`,
    twitter: `https://twitter.com/${u}`,
    bluesky: u.startsWith('http') ? u : `https://bsky.app/profile/${u}`,
    youtube: `https://www.youtube.com/@${u}`,
    discord: u.startsWith('http') ? u : `https://discord.com/users/${u}`,
    mastodon: u.startsWith('http') ? u : '',
    dribbble: `https://dribbble.com/${u}`,
    behance: `https://www.behance.net/${u}`,
    website: u.startsWith('http') ? u : `https://${u}`,
  };
  const href = hrefByPlatform[platform];
  if (!href) return null;
  const safeHref = sanitizeOutboundUrl(href);
  if (!safeHref) return null;
  return { label: PLATFORM_LABEL[platform] ?? capitalize(platform), href: safeHref };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const INTEGRATION_PLATFORMS = [
  'github',
  'linkedin',
  'twitter',
  'bluesky',
  'youtube',
  'website',
  'mastodon',
  'dribbble',
  'behance',
  'discord',
] as const;

export type IntegrationPlatform = (typeof INTEGRATION_PLATFORMS)[number];
