import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';

import { PortfolioPublicFooter } from '@/components/domain/portfolio-public-footer';
import { PortfolioPublicThemeToggle } from '@/components/domain/portfolio-public-theme-toggle';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import type { PublicPortfolioRow } from '@/lib/portfolio-public';
import {
  PORTFOLIO_CARD_PAD,
  portfolioCardClass,
  portfolioContentContainerClass,
  portfolioDateTextClass,
  portfolioEyebrowClass,
  portfolioHeaderRuleClass,
  portfolioNavPillClass,
  portfolioSectionAccentClass,
} from '@/lib/portfolio-public-ui';
import { cn } from '@/lib/utils';

export async function PortfolioBlogIndex({
  portfolio,
  siteBasePath,
}: {
  portfolio: PublicPortfolioRow;
  siteBasePath: string;
}) {
  const neu = portfolio.theme === 'neubrutalism';

  const posts = await db
    .select({
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .where(and(eq(blogPosts.portfolioId, portfolio.id), eq(blogPosts.isPublished, true)))
    .orderBy(desc(blogPosts.publishedAt));

  const card = portfolioCardClass(neu);

  return (
    <div className={cn('portfolio-surface', portfolioContentContainerClass())}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={siteBasePath} className={portfolioNavPillClass(neu)}>
          ← Back to portfolio
        </Link>
        <PortfolioPublicThemeToggle variant={neu ? 'neu' : 'classic'} />
      </div>

      <header className={cn('mt-10 sm:mt-12', portfolioHeaderRuleClass(neu))}>
        <p className={portfolioEyebrowClass(neu)}>Writing</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className={portfolioSectionAccentClass(neu)} aria-hidden />
          <h1
            className={cn(
              'text-[clamp(1.75rem,3vw+0.5rem,3rem)] font-semibold tracking-tight text-[var(--portfolio-fg)]',
              neu && 'uppercase tracking-wider',
            )}
          >
            Blog
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-[var(--portfolio-fg-muted)] sm:text-lg">
          {portfolio.title}
        </p>
      </header>

      <ul className="mt-10 space-y-5 sm:mt-12">
        {posts.length === 0 ? (
          <li className="text-sm text-[var(--portfolio-fg-muted)]">No posts yet.</li>
        ) : (
          posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`${siteBasePath}/blog/${p.slug}`}
                className={cn('group block', card, PORTFOLIO_CARD_PAD)}
              >
                <h2 className="text-lg font-semibold text-[var(--portfolio-fg)] transition-colors group-hover:text-[var(--portfolio-accent)]">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="mt-2 text-sm leading-relaxed text-[var(--portfolio-fg-muted)]">{p.excerpt}</p>
                )}
                {p.publishedAt && (
                  <p className={cn('mt-3', portfolioDateTextClass())}>
                    {new Date(p.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </Link>
            </li>
          ))
        )}
      </ul>

      <PortfolioPublicFooter neu={neu} label="Blog" />
    </div>
  );
}
