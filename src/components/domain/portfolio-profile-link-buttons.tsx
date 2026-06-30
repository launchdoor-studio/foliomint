import { ProfileLinkIcon } from '@/lib/profile-link-icons';
import { portfolioOutboundIconButtonClass } from '@/lib/portfolio-public-ui';
import type { SocialLink } from '@/lib/social-links';
import { cn, normalizeOutboundHref } from '@/lib/utils';

export function PortfolioProfileLinkButtons({
  links,
  neu,
  className,
  iconClassName,
}: {
  links: SocialLink[];
  neu: boolean;
  className?: string;
  iconClassName?: string;
}) {
  if (links.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {links.map((link, i) => (
        <a
          key={`${link.label}-${link.href}-${i}`}
          href={normalizeOutboundHref(link.href)}
          target={link.href.startsWith('mailto:') ? undefined : '_blank'}
          rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
          className={portfolioOutboundIconButtonClass(neu)}
          aria-label={link.label}
          title={link.label}
        >
          <ProfileLinkIcon link={link} className={cn('h-4 w-4 shrink-0', iconClassName)} />
        </a>
      ))}
    </div>
  );
}
