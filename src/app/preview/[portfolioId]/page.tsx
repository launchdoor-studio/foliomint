import Link from 'next/link';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { PortfolioPublicHome } from '@/components/domain/portfolio-public-home';
import { PortfolioPublicShell } from '@/components/domain/portfolio-public-shell';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import {
  extractPortfolioThemeColors,
  type PortfolioThemeSettings,
} from '@/lib/portfolio-theme-colors';
import { portfolioSiteBasePath } from '@/lib/public-handle';

interface Props {
  params: { portfolioId: string };
}

export default async function PortfolioPreviewPage({ params }: Props) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/preview/${params.portfolioId}`)}`);
  }

  const userId = appUser?.id ?? 'dev-user';

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, params.portfolioId))
    .get();

  if (!portfolio || portfolio.userId !== userId) {
    notFound();
  }

  const siteBasePath = portfolioSiteBasePath(portfolio);
  const displaySlug = portfolio.publicHandle ?? portfolio.slug;
  const livePath = portfolio.isPublished ? siteBasePath : null;

  return (
    <div className="min-h-screen">
      {!portfolio.isPublished && (
        <div className="border-b-2 border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-950 dark:text-amber-200">
          Draft preview — only you can see this.{' '}
          <Link
            href={`/editor/${portfolio.id}`}
            className="font-semibold underline underline-offset-2 hover:no-underline"
          >
            Publish from the editor
          </Link>{' '}
          to share your live link.
        </div>
      )}
      {portfolio.isPublished && livePath && (
        <div className="border-b border-border/60 bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">
          Published preview. Public URL:{' '}
          <Link href={livePath} className="font-mono font-medium text-primary underline underline-offset-2">
            {livePath}
          </Link>
        </div>
      )}
      <PortfolioPublicShell
        accentColor={portfolio.accentColor}
        themeColors={extractPortfolioThemeColors(
          portfolio.themeSettings as PortfolioThemeSettings | null,
        )}
      >
        <PortfolioPublicHome
          portfolio={portfolio}
          siteBasePath={siteBasePath}
          displaySlug={displaySlug}
          skipViewLog={!portfolio.isPublished}
        />
      </PortfolioPublicShell>
    </div>
  );
}
