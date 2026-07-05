import { cn } from '@/lib/utils';
import { portfolioFooterRuleClass } from '@/lib/portfolio-public-ui';

export function PortfolioPublicFooter({
  neu,
  label,
  /** Parent already provides the tinted band + top border (classic mono); skip extra mt/pt so the strip is not a huge empty block */
  band = false,
}: {
  neu: boolean;
  label: string;
  band?: boolean;
}) {
  return (
    <footer
      className={
        band
          ? 'flex flex-col items-center gap-2 text-center sm:gap-3'
          : portfolioFooterRuleClass(neu)
      }
    >
      <p className="text-xs text-[var(--portfolio-fg-muted)]">
        Built with{' '}
        <a href="/" className="font-medium text-[var(--portfolio-accent)] hover:underline">
          FolioMint
        </a>
      </p>
      <p className="text-[11px] uppercase tracking-wider text-[var(--portfolio-fg-muted)]">{label}</p>
    </footer>
  );
}
