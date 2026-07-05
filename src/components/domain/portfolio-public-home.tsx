import { headers } from 'next/headers';
import { and, eq, sql } from 'drizzle-orm';

import { PortfolioContentView } from '@/components/domain/portfolio-content-view';
import { db } from '@/lib/db';
import { blogPosts, integrations } from '@/lib/db/schema';
import type { PublicPortfolioRow } from '@/lib/portfolio-public';
import { integrationToSocialLink } from '@/lib/social-links';
import { logPortfolioView, parseViewHeaders } from '@/lib/view-log';
import type { PortfolioContent } from '@/types';

/**
 * Renders the published portfolio home (logging view + content shell).
 * `siteBasePath` is `/u/{handle}` or `/{legacySlug}` for blog / outbound links.
 */
export async function PortfolioPublicHome({
  portfolio,
  siteBasePath,
  displaySlug,
  skipViewLog = false,
}: {
  portfolio: PublicPortfolioRow;
  siteBasePath: string;
  displaySlug: string;
  /** Skip analytics logging (e.g. owner draft preview). */
  skipViewLog?: boolean;
}) {
  const headerList = headers();
  if (!skipViewLog) {
    await logPortfolioView(
      portfolio.id,
      parseViewHeaders((name) => headerList.get(name)),
    );
  }

  const content = portfolio.content as unknown as PortfolioContent;

  const integrationRows = await db
    .select()
    .from(integrations)
    .where(eq(integrations.userId, portfolio.userId));

  const socialLinks = integrationRows
    .map((r) => integrationToSocialLink(r.platform, r.username, r.data as Record<string, unknown> | null))
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const blogCountRow = await db
    .select({ c: sql<number>`count(*)` })
    .from(blogPosts)
    .where(and(eq(blogPosts.portfolioId, portfolio.id), eq(blogPosts.isPublished, true)))
    .get();

  const showBlog = (blogCountRow?.c ?? 0) > 0;

  return (
    <PortfolioContentView
      content={content}
      slug={displaySlug}
      siteBasePath={siteBasePath}
      theme={portfolio.theme}
      showBlogLink={showBlog}
      socialLinks={socialLinks}
    />
  );
}
