import { NextResponse } from 'next/server';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { and, count, eq } from 'drizzle-orm';

import { getTierLimits, getUserTier } from '@/lib/access';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import { sendPortfolioPublishedEmail } from '@/lib/email';
import { portfolioSiteBasePath, validatePublicHandleForSave } from '@/lib/public-handle';
import { normalizePublicDomain } from '@/lib/slug';
import { sanitizePortfolioAccentForStorage } from '@/lib/portfolio-accent';
import {
  extractPortfolioThemeColors,
  mergeThemeSettingsColors,
  sanitizePortfolioThemeColors,
  type PortfolioThemeColors,
  type PortfolioThemeSettings,
} from '@/lib/portfolio-theme-colors';
import { parseAndSanitizePortfolioContent } from '@/lib/portfolio-content-sanitize';
import type { PortfolioContent, PortfolioTheme } from '@/types';

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, params.id))
    .get();

  if (!portfolio || portfolio.userId !== userId) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: portfolio.id,
    slug: portfolio.slug,
    publicHandle: portfolio.publicHandle ?? null,
    title: portfolio.title,
    theme: portfolio.theme,
    accentColor: portfolio.accentColor,
    themeColors: extractPortfolioThemeColors(
      portfolio.themeSettings as PortfolioThemeSettings | null,
    ),
    isPublished: portfolio.isPublished,
    groqConsent: portfolio.groqConsent,
    content: portfolio.content as unknown as PortfolioContent,
    customDomain: portfolio.customDomain,
    customDomainVerified: portfolio.customDomainVerified ?? false,
    pendingDomainVerification: !!(
      portfolio.domainVerificationToken && portfolio.customDomainVerified !== true
    ),
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
  });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const existing = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, params.id))
    .get();

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  let resolvedPublicHandle = existing.publicHandle ?? null;

  const body = (await req.json()) as Partial<{
    title: string;
    theme: PortfolioTheme;
    accentColor: string | null;
    isPublished: boolean;
    content: PortfolioContent;
    customDomain: string | null;
    /** Clean public username for `/u/{handle}`; omit or null to clear. */
    publicHandle: string | null;
    themeColors?: PortfolioThemeColors;
  }>;

  if (body.theme !== undefined) {
    const tier = await getUserTier(userId);
    const allowedThemes = getTierLimits(tier).themes;
    if (!(allowedThemes as readonly string[]).includes(body.theme)) {
      return NextResponse.json({ error: 'That theme requires a Pro subscription' }, { status: 403 });
    }
  }

  const set: {
    title?: string;
    theme?: PortfolioTheme;
    accentColor?: string | null;
    isPublished?: boolean;
    status?: 'draft' | 'published' | 'unpublished' | 'archived';
    publishedAt?: Date | null;
    unpublishedAt?: Date | null;
    content?: Record<string, unknown>;
    customDomain?: string | null;
    customDomainVerified?: boolean;
    domainVerificationToken?: string | null;
    publicHandle?: string | null;
    themeSettings?: PortfolioThemeSettings;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (body.title !== undefined) {
    set.title = body.title;
  }

  if (body.theme !== undefined) {
    set.theme = body.theme;
  }

  if (body.accentColor !== undefined) {
    const next = sanitizePortfolioAccentForStorage(body.accentColor);
    const hadMeaningfulInput =
      body.accentColor !== null &&
      !(typeof body.accentColor === 'string' && body.accentColor.trim() === '');
    if (hadMeaningfulInput && next === null) {
      return NextResponse.json({ error: 'Invalid accent color (use #RGB or #RRGGBB)' }, { status: 400 });
    }
    set.accentColor = next;
  }

  if (body.themeColors !== undefined) {
    const sanitized = sanitizePortfolioThemeColors(body.themeColors);
    if (sanitized === null && body.themeColors !== null) {
      return NextResponse.json(
        { error: 'Invalid theme color (use #RGB or #RRGGBB for each field)' },
        { status: 400 },
      );
    }
    set.themeSettings = mergeThemeSettingsColors(
      existing.themeSettings as PortfolioThemeSettings | null,
      sanitized ?? extractPortfolioThemeColors(null),
    );
  }

  if (typeof body.isPublished === 'boolean') {
    if (body.isPublished && !existing.isPublished) {
      const tier = await getUserTier(userId);
      const limits = getTierLimits(tier);
      if (Number.isFinite(limits.maxPublishedPortfolios)) {
        const [publishedRow] = await db
          .select({ value: count() })
          .from(portfolios)
          .where(and(eq(portfolios.userId, userId), eq(portfolios.isPublished, true)));
        const publishedCount = publishedRow?.value ?? 0;
        if (publishedCount >= limits.maxPublishedPortfolios) {
          return NextResponse.json(
            {
              error:
                'Free includes one published portfolio at a time. Unpublish your other portfolio or upgrade to Pro.',
            },
            { status: 403 },
          );
        }
      }
      set.isPublished = true;
      set.status = 'published';
      set.publishedAt = new Date();
    } else if (!body.isPublished && existing.isPublished) {
      set.isPublished = false;
      set.status = 'unpublished';
      set.unpublishedAt = new Date();
    } else {
      set.isPublished = body.isPublished;
    }
  }

  if (body.content !== undefined) {
    const contentResult = parseAndSanitizePortfolioContent(body.content);
    if (!contentResult.ok) {
      return NextResponse.json({ error: contentResult.error }, { status: 400 });
    }
    set.content = contentResult.content as unknown as Record<string, unknown>;
  }

  if (body.customDomain !== undefined) {
    const next =
      body.customDomain === null || body.customDomain.trim() === ''
        ? null
        : normalizePublicDomain(body.customDomain);
    const prev = existing.customDomain?.trim().length
      ? normalizePublicDomain(existing.customDomain)
      : null;

    if (next !== prev) {
      const tier = await getUserTier(userId);
      if (next && !getTierLimits(tier).customDomain) {
        return NextResponse.json({ error: 'Custom domains require a Pro subscription' }, { status: 403 });
      }
      set.customDomain = next;
      set.customDomainVerified = false;
      set.domainVerificationToken = null;
    }
  }

  if (body.publicHandle !== undefined) {
    const v = validatePublicHandleForSave(body.publicHandle);
    if (!v.ok) {
      return NextResponse.json({ error: v.error }, { status: 400 });
    }
    const nextHandle = v.handle === '' ? null : v.handle;
    if (nextHandle) {
      const taken = await db
        .select({ id: portfolios.id })
        .from(portfolios)
        .where(eq(portfolios.publicHandle, nextHandle))
        .get();
      if (taken && taken.id !== existing.id) {
        return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 });
      }
    }
    set.publicHandle = nextHandle;
    resolvedPublicHandle = nextHandle;
  }

  try {
    await db.update(portfolios).set(set).where(eq(portfolios.id, params.id));
  } catch (error) {
    console.error('Portfolio update failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to save portfolio. Please try again.' }, { status: 500 });
  }

  const publishEmail = appUser?.email;
  if (
    body.isPublished === true &&
    !existing.isPublished &&
    publishEmail &&
    typeof publishEmail === 'string'
  ) {
    await sendPortfolioPublishedEmail(
      publishEmail,
      existing.title,
      portfolioSiteBasePath({ publicHandle: resolvedPublicHandle, slug: existing.slug }),
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const existing = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, params.id))
    .get();

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  await db.delete(portfolios).where(eq(portfolios.id, params.id));

  return NextResponse.json({ ok: true });
}
