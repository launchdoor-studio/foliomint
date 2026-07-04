import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Plus,
  ExternalLink,
  BarChart3,
  Settings,
  Globe,
  Pencil,
  LayoutDashboard,
  Eye,
  FolderKanban,
  Link2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { portfolioSiteBasePath } from '@/lib/public-handle';
import { TrialBanner } from '@/components/domain/trial-banner';
import { cn } from '@/lib/utils';

type PortfolioRow = {
  id: string;
  title: string;
  slug: string;
  publicHandle: string | null;
  theme: string | null;
  isPublished: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type PlanVariant = 'free' | 'pro' | 'pro_issue' | 'preview';

interface DashboardOverviewProps {
  checkout?: string;
  totalViews: number;
  portfolioCount: number;
  publishedCount: number;
  integrationCount: number;
  portfolios: PortfolioRow[];
  plan: {
    name: string;
    detail: string;
    variant: PlanVariant;
  };
  showUpgradeCta: boolean;
  trialDaysLeft?: number | null;
}

const portfolioActionButtonClass =
  'min-w-[5.5rem] border-border/80 bg-card shadow-[2px_2px_0_0_hsl(var(--primary))] ' +
  'hover:bg-accent hover:text-accent-foreground dark:border-white/15 dark:bg-card ' +
  'dark:hover:bg-accent dark:hover:text-accent-foreground';

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
      <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{hint}</p>
    </div>
  );
}

export function DashboardOverview({
  checkout,
  totalViews,
  portfolioCount,
  publishedCount,
  integrationCount,
  portfolios,
  plan,
  showUpgradeCta,
  trialDaysLeft,
}: DashboardOverviewProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {typeof trialDaysLeft === 'number' && trialDaysLeft > 0 && (
        <TrialBanner daysLeft={trialDaysLeft} />
      )}
      {checkout === 'dev-bypass' && process.env.NODE_ENV !== 'production' && (
        <p className="mb-8 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          This environment uses relaxed limits for local testing. Use a paid plan when you ship to users.
        </p>
      )}
      {checkout === 'success' && (
        <p className="mb-8 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          Thanks for subscribing. If your plan does not update immediately, wait a few seconds for the webhook,
          then refresh.
        </p>
      )}

      {/* Page header */}
      <div className="flex flex-col gap-6 border-b border-border/70 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Create and publish portfolios, track visitors, and connect your profiles in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {showUpgradeCta && (
            <Button asChild variant="outline" size="default" className="border-primary/30">
              <Link href="/upgrade">Upgrade to Pro</Link>
            </Button>
          )}
          <Button asChild size="default" className="shadow-sm">
            <Link href="/generate">
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              New portfolio
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total views"
          value={totalViews.toLocaleString()}
          hint="All time across published sites"
          icon={Eye}
        />
        <StatCard
          label="Portfolios"
          value={portfolioCount.toLocaleString()}
          hint={
            publishedCount === 0
              ? 'None published yet'
              : publishedCount === portfolioCount
                ? 'All published'
                : `${publishedCount} published, ${portfolioCount - publishedCount} draft`
          }
          icon={FolderKanban}
        />
        <StatCard
          label="Integrations"
          value={integrationCount.toLocaleString()}
          hint={integrationCount > 0 ? 'Connected to your profile' : 'Add links on the Integrations page'}
          icon={Link2}
        />
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md',
            plan.variant === 'pro' || plan.variant === 'preview'
              ? 'border-primary/35 bg-gradient-to-br from-primary/[0.07] to-transparent'
              : 'border-border/80 bg-card',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Plan</p>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{plan.name}</p>
            {plan.variant === 'preview' && (
              <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wide">
                Local
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{plan.detail}</p>
        </div>
      </div>

      {/* Portfolios */}
      <section className="mt-12 lg:mt-14">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Your portfolios</h2>
          {portfolios.length > 0 &&
            (plan.variant === 'pro' || plan.variant === 'preview' || plan.variant === 'pro_issue' ? (
              <Link
                href="/generate"
                className="text-sm font-medium text-primary hover:underline"
              >
                Add another
              </Link>
            ) : (
              <Link href="/pricing" className="text-sm font-medium text-primary hover:underline">
                Need another portfolio?
              </Link>
            ))}
        </div>

        <div className="mt-5">
          {portfolios.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FolderKanban className="h-6 w-6" aria-hidden />
              </div>
              <p className="mt-4 text-base font-medium text-foreground">No portfolios yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Upload a resume to generate your first portfolio, then refine it in the editor.
              </p>
              <Button asChild className="mt-6" size="sm">
                <Link href="/generate">Create portfolio</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
              {portfolios.map((portfolio) => {
                const livePath = portfolioSiteBasePath({
                  publicHandle: portfolio.publicHandle ?? null,
                  slug: portfolio.slug,
                });
                return (
                  <li
                    key={portfolio.id}
                    className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 dark:hover:bg-accent/25"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-foreground">{portfolio.title}</h3>
                        <Badge
                          variant={portfolio.isPublished ? 'default' : 'secondary'}
                          className="font-normal"
                        >
                          {portfolio.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Updated{' '}
                        {portfolio.updatedAt
                          ? new Date(portfolio.updatedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </p>
                      {portfolio.isPublished && (
                        <p className="mt-1 truncate font-mono text-xs text-muted-foreground/90">{livePath}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      <Button asChild variant="outline" size="sm" className={portfolioActionButtonClass}>
                        <Link href={`/editor/${portfolio.id}`}>
                          <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Edit content
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className={portfolioActionButtonClass}>
                        <Link href={`/dashboard/portfolios/${portfolio.id}/manage`}>
                          <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Manage portfolio
                        </Link>
                      </Button>
                      {portfolio.isPublished && (
                        <Button asChild variant="outline" size="sm" className={portfolioActionButtonClass}>
                          <Link href={livePath} target="_blank" rel="noopener noreferrer">
                            <Globe className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                            View live
                          </Link>
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Shortcuts */}
      <section className="mt-12 lg:mt-14">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Shortcuts</h2>
        <p className="mt-1 text-sm text-muted-foreground">Jump to tools and account settings.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            {
              href: '/dashboard/analytics',
              title: 'Analytics',
              description: 'Traffic, referrers, and devices',
              icon: BarChart3,
            },
            {
              href: '/dashboard/integrations',
              title: 'Integrations',
              description: 'Social and profile links',
              icon: ExternalLink,
            },
            {
              href: '/dashboard/settings',
              title: 'Settings',
              description: 'Account and billing',
              icon: Settings,
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <item.icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
