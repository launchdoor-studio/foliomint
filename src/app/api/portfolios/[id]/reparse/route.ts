import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { canUseAiFeature } from '@/lib/access';
import { recordAiUsage } from '@/lib/ai-usage';
import { resolvePlatformGroqApiKey } from '@/lib/ai-credentials';
import { getCurrentUser } from '@/lib/auth';
import { buildMockResumeFromText } from '@/lib/dev-mock-ai';
import { isDevAuthBypassed, shouldUseDevMockAi } from '@/lib/dev-mode';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import { ParseError } from '@/lib/errors';
import { extractResumeFields } from '@/lib/groq';
import { extractTextFromFile } from '@/lib/resume-parser';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';
  const portfolioId = params.id;

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, portfolioId))
    .get();

  if (!portfolio || portfolio.userId !== userId) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
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
      { error: 'Mint parsing is temporarily unavailable. Please try again later.', code: 'AI_UNAVAILABLE' },
      { status: 503 },
    );
  }

  if (!(await canUseAiFeature(userId, 'parse'))) {
    return NextResponse.json(
      {
        error: 'You have reached your Mint parsing limit. Upgrade to Pro for higher limits, or try again later.',
        code: 'AI_PARSE_LIMIT_REACHED',
      },
      { status: 403 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractTextFromFile(buffer, file.type);

    const resumeData = useMockAi
      ? buildMockResumeFromText(rawText, appUser?.name ?? undefined)
      : await extractResumeFields(rawText, apiKey!);

    await db
      .update(portfolios)
      .set({
        content: resumeData as unknown as Record<string, unknown>,
        groqConsent: true,
        updatedAt: new Date(),
      })
      .where(eq(portfolios.id, portfolioId));

    await recordAiUsage({
      userId,
      portfolioId,
      kind: 'parse',
      model: useMockAi ? 'dev-mock' : 'llama-3.3-70b-versatile',
    });

    return NextResponse.json({ portfolioId, content: resumeData });
  } catch (error) {
    const message =
      error instanceof ParseError
        ? error.message
        : 'Mint could not parse your resume. Please check your file and try again.';
    return NextResponse.json({ error: message, code: 'AI_PARSE_FAILED' }, { status: 422 });
  }
}
