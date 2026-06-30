import type { SocialLink } from '@/lib/social-links';
import type { PortfolioContent } from '@/types';

function normalizeHref(href: string): string {
  return href.trim().replace(/\/$/, '').toLowerCase();
}

/** Profile + integration links for the portfolio hero. */
export function buildPortfolioProfileLinks(
  content: PortfolioContent,
  socialLinks: SocialLink[] = [],
): SocialLink[] {
  const links: SocialLink[] = [];
  if (content.email) links.push({ label: 'Email', href: `mailto:${content.email}` });
  if (content.website) links.push({ label: 'Website', href: content.website });
  if (content.github) links.push({ label: 'GitHub', href: content.github });
  if (content.linkedin) links.push({ label: 'LinkedIn', href: content.linkedin });
  links.push(...socialLinks);

  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.label.toLowerCase()}::${normalizeHref(link.href)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const ACTIVE_PORTFOLIO_THEME = 'neubrutalism' as const;
