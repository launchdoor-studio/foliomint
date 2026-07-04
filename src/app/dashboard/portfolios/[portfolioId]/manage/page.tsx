'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Globe2,
  LayoutDashboard,
  Loader2,
  Pencil,
  ExternalLink,
  Trash2,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/domain/navbar';
import { portfolioSiteBasePath } from '@/lib/public-handle';
import { SHOW_PUBLISH_TIPS_PARAM } from '@/components/domain/post-publish-checklist';

export default function PortfolioManagePage() {
  const params = useParams<{ portfolioId: string }>();
  const router = useRouter();
  const id = typeof params.portfolioId === 'string' ? params.portfolioId : params.portfolioId?.[0];
  const [title, setTitle] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [publicHandle, setPublicHandle] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [tier, setTier] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const [pr, me] = await Promise.all([
          fetch(`/api/portfolios/${id}`, { credentials: 'include' }),
          fetch('/api/me', { credentials: 'include' }),
        ]);
        const meJson = (await me.json()) as { tier?: string };
        setTier(meJson.tier === 'pro' ? 'pro' : 'free');
        if (!pr.ok) {
          if (pr.status === 401) {
            router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/dashboard/portfolios/${id}/manage`)}`);
            return;
          }
          throw new Error('Failed to load portfolio');
        }
        const data = (await pr.json()) as {
          title: string;
          slug: string;
          publicHandle?: string | null;
          isPublished: boolean;
        };
        setTitle(data.title);
        setSlug(data.slug);
        setPublicHandle(data.publicHandle ?? null);
        setIsPublished(data.isPublished);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (!id) return null;

  const livePath = portfolioSiteBasePath({ publicHandle, slug });

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Portfolio management
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title ?? 'Portfolio'}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Edit your site content, publishing, blog, and domain from here. This area is separate from the
            step-by-step content editor so you always know whether you&apos;re writing copy or configuring how the
            site goes live.
          </p>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {isPublished && (
          <p className="mt-6 rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Closed the optional &quot;publishing tips&quot; banner in the editor?{' '}
            <Link
              href={`/editor/${id}?${SHOW_PUBLISH_TIPS_PARAM}=1`}
              className="font-medium text-primary underline underline-offset-4 hover:no-underline"
            >
              Show tips again
            </Link>
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Pencil className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-lg">Edit content</CardTitle>
              <CardDescription>Profile, experience, projects, and appearance in the guided editor.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/editor/${id}`}>Open content editor</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LayoutDashboard className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-lg">View live site</CardTitle>
              <CardDescription>
                {isPublished
                  ? 'Open your public portfolio in a new tab.'
                  : 'Publish from the content editor when you are ready.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPublished ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={livePath} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open {livePath}
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link href={`/editor/${id}`}>Go to editor to publish</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Download className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-lg">Resume PDF</CardTitle>
              <CardDescription>
                Download a resume that matches your current portfolio content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={`/api/portfolios/${id}/export/resume`} download>
                  Download resume PDF
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-lg">Blog</CardTitle>
              <CardDescription>
                {tier === 'pro'
                  ? 'Create and edit Markdown posts on your public site.'
                  : 'Pro includes blog publishing on your portfolio.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tier === 'pro' ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={`/editor/${id}/blog`}>Open blog</Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/pricing?from=${encodeURIComponent(`/dashboard/portfolios/${id}/manage`)}&intent=blog`}>
                      Upgrade to unlock blog
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">See plan details before entering the blog workspace.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe2 className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle className="text-lg">Custom domain</CardTitle>
              <CardDescription>
                {tier === 'pro'
                  ? 'Connect a domain you own with DNS verification.'
                  : 'Connect your own domain on Pro.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tier === 'pro' ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={`/editor/${id}/domain`}>Domain settings</Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/pricing?from=${encodeURIComponent(`/dashboard/portfolios/${id}/manage`)}&intent=domain`}>
                      Upgrade to unlock domain
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Review what is included before opening domain configuration.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Public URL preview: <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{livePath}</code>
          {!publicHandle && (
            <span className="ml-2">
              Set a short handle in the editor&apos;s Profile step to replace the long slug in links.
            </span>
          )}
        </p>

        <Card className="mt-10 border-destructive/40 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" aria-hidden />
            </div>
            <CardTitle className="text-lg text-destructive">Delete portfolio</CardTitle>
            <CardDescription>
              Permanently remove this portfolio, its blog posts, and analytics history. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              disabled={deleting}
              onClick={() => {
                if (
                  !window.confirm(
                    `Delete “${title ?? 'this portfolio'}”? This permanently removes the site and all blog posts.`,
                  )
                ) {
                  return;
                }
                setDeleteError(null);
                setDeleting(true);
                void (async () => {
                  try {
                    const res = await fetch(`/api/portfolios/${id}`, { method: 'DELETE', credentials: 'include' });
                    if (res.status === 401) {
                      router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/dashboard/portfolios/${id}/manage`)}`);
                      return;
                    }
                    if (!res.ok) {
                      const body = (await res.json().catch(() => null)) as { error?: string } | null;
                      throw new Error(body?.error ?? 'Could not delete portfolio');
                    }
                    router.push('/dashboard');
                    router.refresh();
                  } catch (e) {
                    setDeleteError(e instanceof Error ? e.message : 'Delete failed');
                  } finally {
                    setDeleting(false);
                  }
                })();
              }}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete portfolio
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
