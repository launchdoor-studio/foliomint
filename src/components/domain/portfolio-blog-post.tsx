import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { PortfolioPublicFooter } from '@/components/domain/portfolio-public-footer';
import { PortfolioPublicThemeToggle } from '@/components/domain/portfolio-public-theme-toggle';
import { blogPosts } from '@/lib/db/schema';
import type { PublicPortfolioRow } from '@/lib/portfolio-public';
import {
  portfolioContentContainerClass,
  portfolioEyebrowClass,
  portfolioHeaderRuleClass,
  portfolioNavPillClass,
  portfolioReadingColumnClass,
} from '@/lib/portfolio-public-ui';
import { cn } from '@/lib/utils';

type BlogPostRow = typeof blogPosts.$inferSelect;

export function PortfolioBlogPost({
  portfolio,
  post,
  siteBasePath,
}: {
  portfolio: PublicPortfolioRow;
  post: BlogPostRow;
  siteBasePath: string;
}) {
  const neu = portfolio.theme === 'neubrutalism';

  return (
    <article className={cn('portfolio-surface', portfolioContentContainerClass())}>
      <div className={portfolioReadingColumnClass()}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`${siteBasePath}/blog`} className={portfolioNavPillClass(neu)}>
            ← All posts
          </Link>
          <PortfolioPublicThemeToggle variant={neu ? 'neu' : 'classic'} />
        </div>

        <header className={cn('mt-10 sm:mt-12', portfolioHeaderRuleClass(neu))}>
          <p className={portfolioEyebrowClass(neu)}>Post</p>
          <h1
            className={cn(
              'mt-3 text-[clamp(1.5rem,3vw+0.5rem,2.75rem)] font-semibold leading-tight tracking-tight text-[var(--portfolio-fg)]',
              neu && 'uppercase',
            )}
          >
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="mt-4 text-sm font-medium tabular-nums text-[var(--portfolio-fg-muted)]">
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                dateStyle: 'long',
              })}
            </p>
          )}
        </header>

        <div
          className={cn(
            'prose prose-neutral mt-10 max-w-none dark:prose-invert sm:prose-lg sm:mt-12',
            'prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100',
            'prose-p:text-zinc-700 dark:prose-p:text-zinc-300',
            'prose-li:text-zinc-700 dark:prose-li:text-zinc-300',
            'prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100',
            'prose-a:font-semibold prose-a:text-[var(--portfolio-accent)] prose-a:no-underline hover:prose-a:underline',
            neu && 'prose-headings:uppercase',
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <PortfolioPublicFooter neu={neu} label="Blog" />
      </div>
    </article>
  );
}
