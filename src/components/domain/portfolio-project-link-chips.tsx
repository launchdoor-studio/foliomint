import { ProfileLinkIcon } from '@/lib/profile-link-icons';
import { getProjectLinks } from '@/lib/project-links';
import { portfolioInlineLinkClass } from '@/lib/portfolio-public-ui';
import type { Project } from '@/types';
import { cn, normalizeOutboundHref } from '@/lib/utils';

export function PortfolioProjectLinkChips({
  project,
  neu,
  className,
}: {
  project: Pick<Project, 'url' | 'links'>;
  neu: boolean;
  className?: string;
}) {
  const links = getProjectLinks(project);
  if (links.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {links.map((link, i) => {
        const href = normalizeOutboundHref(link.url);
        if (!href) return null;
        return (
          <a
            key={`${link.label}-${link.url}-${i}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={cn(portfolioInlineLinkClass(neu), 'inline-flex items-center gap-1.5')}
          >
            <ProfileLinkIcon link={{ label: link.label, href: link.url }} className="h-3.5 w-3.5 shrink-0" />
            <span>{link.label}</span>
          </a>
        );
      })}
    </div>
  );
}
