import { sanitizeOutboundUrl } from '@/lib/safe-url';
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
  const website = content.website ? sanitizeOutboundUrl(content.website) : null;
  if (website) links.push({ label: 'Website', href: website });
  const github = content.github ? sanitizeOutboundUrl(content.github) : null;
  if (github) links.push({ label: 'GitHub', href: github });
  const linkedin = content.linkedin ? sanitizeOutboundUrl(content.linkedin) : null;
  if (linkedin) links.push({ label: 'LinkedIn', href: linkedin });
  links.push(...socialLinks);

  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.label.toLowerCase()}::${normalizeHref(link.href)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const DEFAULT_PORTFOLIO_THEME = 'neubrutalism' as const;

/** @deprecated Use DEFAULT_PORTFOLIO_THEME */
export const ACTIVE_PORTFOLIO_THEME = DEFAULT_PORTFOLIO_THEME;
