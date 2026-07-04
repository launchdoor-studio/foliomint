import Link from 'next/link';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { redirect } from 'next/navigation';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { ArrowLeft, BarChart3 } from 'lucide-react';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { portfolios, viewLogs } from '@/lib/db/schema';
import { userHasProAccess } from '@/lib/access';
import { expireTrialIfNeeded } from '@/lib/signup-trial';
import { Navbar } from '@/components/domain/navbar';
import { portfolioSiteBasePath } from '@/lib/public-handle';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AnalyticsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
}

function getSince(window: string | undefined): Date | null {
  if (!window || window === 'all') return null;
  if (window === '7d') return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (window === '30d') return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const user = await getCurrentUser();
  if (!user && !isDevAuthBypassed()) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard/analytics')}`);
  }

  const userId = user?.id ?? 'dev-user';
  const window = firstString(searchParams?.w) ?? '30d';
  const since = getSince(window);

  if (user) {
    await expireTrialIfNeeded(userId);
  }

  const hasAdvancedAnalytics = await userHasProAccess(userId);

  const userPortfolios = await db
    .select({
      id: portfolios.id,
      title: portfolios.title,
      slug: portfolios.slug,
      publicHandle: portfolios.publicHandle,
      isPublished: portfolios.isPublished,
    })
    .from(portfolios)
    .where(eq(portfolios.userId, userId));

  const baseWhere = since
    ? and(eq(portfolios.userId, userId), gte(viewLogs.viewedAt, since))
    : eq(portfolios.userId, userId);

  const viewCounts = await db
    .select({
      portfolioId: viewLogs.portfolioId,
      n: sql<number>`count(*)`,
    })
    .from(viewLogs)
    .innerJoin(portfolios, eq(viewLogs.portfolioId, portfolios.id))
    .where(baseWhere)
    .groupBy(viewLogs.portfolioId);

  const countByPortfolio = new Map(viewCounts.map((r) => [r.portfolioId, r.n]));

  const totalViews = userPortfolios.reduce(
    (sum, p) => sum + (countByPortfolio.get(p.id) ?? 0),
    0,
  );

  const referrers = hasAdvancedAnalytics
    ? await db
        .select({
          label: sql<string>`coalesce(nullif(${viewLogs.referrer}, ''), 'Direct')`,
          n: sql<number>`count(*)`,
        })
        .from(viewLogs)
        .innerJoin(portfolios, eq(viewLogs.portfolioId, portfolios.id))
        .where(baseWhere)
        .groupBy(sql`coalesce(nullif(${viewLogs.referrer}, ''), 'Direct')`)
        .orderBy(desc(sql<number>`count(*)`))
        .limit(8)
    : [];

  const devices = hasAdvancedAnalytics
    ? await db
        .select({
          label: sql<string>`coalesce(nullif(${viewLogs.device}, ''), 'unknown')`,
          n: sql<number>`count(*)`,
        })
        .from(viewLogs)
        .innerJoin(portfolios, eq(viewLogs.portfolioId, portfolios.id))
        .where(baseWhere)
        .groupBy(sql`coalesce(nullif(${viewLogs.device}, ''), 'unknown')`)
        .orderBy(desc(sql<number>`count(*)`))
    : [];

  const countries = hasAdvancedAnalytics
    ? await db
        .select({
          label: sql<string>`coalesce(nullif(${viewLogs.country}, ''), 'unknown')`,
          n: sql<number>`count(*)`,
        })
        .from(viewLogs)
        .innerJoin(portfolios, eq(viewLogs.portfolioId, portfolios.id))
        .where(baseWhere)
        .groupBy(sql`coalesce(nullif(${viewLogs.country}, ''), 'unknown')`)
        .orderBy(desc(sql<number>`count(*)`))
        .limit(12)
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="mt-1 text-muted-foreground">
                View counts per portfolio (referrer, device, and country when available).
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Window:{' '}
              <span className="font-medium text-foreground">
                {window === 'all' ? 'All time' : window === '7d' ? 'Last 7 days' : 'Last 30 days'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { key: '7d', label: '7d' },
                { key: '30d', label: '30d' },
                { key: 'all', label: 'All' },
              ].map((opt) => (
                <Link
                  key={opt.key}
                  href={`/dashboard/analytics?w=${opt.key}`}
                  className={
                    opt.key === window
                      ? 'rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
                      : 'rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground'
                  }
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardDescription>Views</CardDescription>
                <CardTitle className="text-2xl">{totalViews}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Counts exclude unpublished portfolios and expired free portfolios (public views only).
              </CardContent>
            </Card>

            {hasAdvancedAnalytics ? (
              <>
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Top referrers</CardTitle>
                    <CardDescription>Direct vs links that sent traffic</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {referrers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No views yet.</p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {referrers.map((r) => (
                          <li key={r.label} className="flex items-center justify-between gap-3">
                            <span className="truncate text-muted-foreground">{r.label}</span>
                            <span className="shrink-0 font-medium">{r.n}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Devices</CardTitle>
                    <CardDescription>Derived from user agent</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {devices.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No views yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {devices.map((d) => (
                          <Badge key={d.label} variant="secondary">
                            {d.label}: {d.n}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Advanced analytics</CardTitle>
                  <CardDescription>Unlock referrers, devices, and geography breakdowns.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/pricing" className="text-sm font-medium text-primary underline underline-offset-4">
                    Compare plans
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {hasAdvancedAnalytics && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Countries</CardTitle>
                <CardDescription>
                  Uses edge-provided country header when available (may be unknown locally).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {countries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No views yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {countries.map((c) => (
                      <Badge key={c.label} variant="outline">
                        {c.label}: {c.n}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardDescription>All portfolios</CardDescription>
              <CardTitle className="text-2xl">Views by portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {userPortfolios.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No portfolios yet.{' '}
                  <Link href="/generate" className="text-primary underline">
                    Create one
                  </Link>
                  .
                </p>
              ) : (
                <ul className="divide-y rounded-md border">
                  {userPortfolios.map((p) => {
                    const views = countByPortfolio.get(p.id) ?? 0;
                    return (
                      <li
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                      >
                        <div>
                          <span className="font-medium">{p.title}</span>
                          <Badge variant={p.isPublished ? 'default' : 'outline'} className="ml-2">
                            {p.isPublished ? 'Live' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{views} views</span>
                          {p.isPublished && (
                            <Link
                              href={portfolioSiteBasePath({
                                publicHandle: p.publicHandle ?? null,
                                slug: p.slug,
                              })}
                              target="_blank"
                              className="text-primary hover:underline"
                            >
                              Open
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
