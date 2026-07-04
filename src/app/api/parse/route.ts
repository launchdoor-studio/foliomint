import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

import { canUseAiFeature, getUserTier } from '@/lib/access';
import { resolvePlatformGroqApiKey } from '@/lib/ai-credentials';
import { getCurrentUser } from '@/lib/auth';
import { buildMockResumeFromText } from '@/lib/dev-mock-ai';
import { isDevAuthBypassed, shouldUseDevMockAi } from '@/lib/dev-mode';
import { ensureDevUser } from '@/lib/dev-user';
import { db } from '@/lib/db';
import { aiUsageEvents, portfolios } from '@/lib/db/schema';
import { ParseError } from '@/lib/errors';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';
import { extractResumeFields } from '@/lib/groq';
import { extractTextFromFile } from '@/lib/resume-parser';

export async function POST(request: Request) {
  try {
    const appUser = await getCurrentUser();

    if (!appUser && !isDevAuthBypassed()) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = appUser?.id ?? 'dev-user';
    const userEmail = appUser?.email ?? 'dev@example.com';

    const user = await ensureDevUser({
      id: userId,
      email: userEmail,
      name: appUser?.name ?? 'Dev User',
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userTier = isPaymentGatingBypassed() ? 'pro' : await getUserTier(userId);
    const isPaid = userTier === 'pro';

    if (!isPaid) {
      const existingPortfolios = await db
        .select({ id: portfolios.id, expiresAt: portfolios.expiresAt })
        .from(portfolios)
        .where(eq(portfolios.userId, userId));

      const hasActivePortfolio = existingPortfolios.some(
        (p) => !p.expiresAt || p.expiresAt > new Date(),
      );
      if (hasActivePortfolio) {
        return NextResponse.json(
          {
            error:
              'Free includes one active portfolio. Upgrade to Pro for multiple portfolios, or wait for expiry before creating another.',
          },
          { status: 403 },
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const apiKey = resolvePlatformGroqApiKey();
    const useMockAi = shouldUseDevMockAi();
    if (!apiKey && !useMockAi) {
      return NextResponse.json(
        {
          error: 'Mint parsing is temporarily unavailable. Please try again later.',
          code: 'AI_UNAVAILABLE',
        },
        { status: 503 },
      );
    }

    if (!(await canUseAiFeature(userId, 'parse'))) {
      return NextResponse.json(
        {
          error:
            'You have reached your Mint parsing limit. Upgrade to Pro for higher limits, or try again later.',
          code: 'AI_PARSE_LIMIT_REACHED',
        },
        { status: 403 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractTextFromFile(buffer, file.type);

    let resumeData;
    try {
      resumeData = useMockAi
        ? buildMockResumeFromText(rawText, appUser?.name ?? user.name ?? undefined)
        : await extractResumeFields(rawText, apiKey!);
    } catch (error) {
      const message =
        error instanceof ParseError
          ? error.message
          : 'Mint could not parse your resume. Please check your file and try again.';
      return NextResponse.json({ error: message, code: 'AI_PARSE_FAILED' }, { status: 422 });
    }

    const portfolioId = nanoid(12);
    const slugBase =
      resumeData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'portfolio';
    const slug = `${slugBase}-${nanoid(6)}`;

    await db.insert(portfolios).values({
      id: portfolioId,
      userId,
      slug,
      title: `${resumeData.name}'s Portfolio`,
      content: resumeData as unknown as Record<string, unknown>,
      groqConsent: true,
      expiresAt: isPaid ? null : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    await db.insert(aiUsageEvents).values({
      id: nanoid(12),
      userId,
      portfolioId,
      kind: 'parse',
      model: useMockAi ? 'dev-mock' : 'llama-3.3-70b-versatile',
      succeeded: true,
    });

    return NextResponse.json({ portfolioId, slug });
  } catch (error) {
    console.error('Parse API error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to process resume. Please try again.' },
      { status: 500 },
    );
  }
}
