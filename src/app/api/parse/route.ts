import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

import { canUseAiFeature, getUserTier } from '@/lib/access';
import { resolveParsingApiKey } from '@/lib/ai-credentials';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiUsageEvents, portfolios, users } from '@/lib/db/schema';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';
import { extractResumeFields } from '@/lib/groq';
import { extractTextFromFile, buildFallbackResumeData } from '@/lib/resume-parser';

export async function POST(request: Request) {
  try {
    const appUser = await getCurrentUser();

    if (!appUser && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = appUser?.id ?? 'dev-user';
    const userEmail = appUser?.email ?? 'dev@example.com';

    let user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      if (process.env.NEXTAUTH_DEV_BYPASS === 'true') {
        await db.insert(users).values({
          id: userId,
          email: userEmail,
          name: appUser?.name ?? 'Dev User',
        });

        user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .get();
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
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
    const consent = formData.get('consent') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const apiKey = consent ? await resolveParsingApiKey(userId) : null;

    if (consent && !(await canUseAiFeature(userId, 'parse'))) {
      return NextResponse.json(
        {
          error:
            "You have reached today's AI parsing limit. You can still create or edit your portfolio manually, or upgrade for higher limits.",
          code: 'AI_PARSE_LIMIT_REACHED',
        },
        { status: 403 },
      );
    }

    if (consent && !apiKey) {
      return NextResponse.json(
        {
          error:
            'AI parsing requires your own Groq API key. Add one in Settings before uploading with AI enabled.',
          code: 'AI_KEY_REQUIRED',
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractTextFromFile(buffer, file.type);

    let resumeData;
    let aiParseSucceeded = false;
    if (consent && apiKey) {
      try {
        resumeData = await extractResumeFields(rawText, apiKey);
        aiParseSucceeded = true;
      } catch {
        resumeData = buildFallbackResumeData(rawText);
      }
    } else {
      resumeData = buildFallbackResumeData(rawText);
    }

    const portfolioId = nanoid(12);
    const slug = `${resumeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${nanoid(6)}`;

    await db.insert(portfolios).values({
      id: portfolioId,
      userId,
      slug,
      title: `${resumeData.name}'s Portfolio`,
      content: resumeData as unknown as Record<string, unknown>,
      groqConsent: consent,
      expiresAt:
        isPaid ? null : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    if (consent) {
      await db.insert(aiUsageEvents).values({
        id: nanoid(12),
        userId,
        portfolioId,
        kind: 'parse',
        model: apiKey ? 'groq/compound-mini' : null,
        succeeded: aiParseSucceeded,
      });
    }

    return NextResponse.json({ portfolioId, slug });
  } catch (error) {
    console.error('Parse API error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to process resume. Please try again.' },
      { status: 500 },
    );
  }
}
