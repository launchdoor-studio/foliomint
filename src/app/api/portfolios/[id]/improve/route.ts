import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { canUseAiFeature } from '@/lib/access';
import { resolvePlatformGroqApiKey } from '@/lib/ai-credentials';
import { getCurrentUser } from '@/lib/auth';
import { mockImproveResumeSection } from '@/lib/dev-mock-ai';
import { isDevAuthBypassed, shouldUseDevMockAi } from '@/lib/dev-mode';
import { db } from '@/lib/db';
import { aiUsageEvents, portfolios } from '@/lib/db/schema';
import { ParseError } from '@/lib/errors';
import { improveResumeSection } from '@/lib/groq-improve';
import { resumeDataSchema, type ResumeData } from '@/types';

const bodySchema = z.object({
  section: z.enum(['bio', 'headline', 'skills', 'experience', 'projects', 'education']),
  targetIndex: z.number().int().min(0).optional(),
  instruction: z.string().max(500).optional(),
});

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

  if (!(await canUseAiFeature(userId, 'rewrite'))) {
    return NextResponse.json(
      { error: 'You have reached your Mint improvement limit for this period.', code: 'AI_REWRITE_LIMIT' },
      { status: 403 },
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const apiKey = resolvePlatformGroqApiKey();
  const useMockAi = shouldUseDevMockAi();
  if (!apiKey && !useMockAi) {
    return NextResponse.json({ error: 'Mint is temporarily unavailable.' }, { status: 503 });
  }

  const parsed = resumeDataSchema.safeParse(portfolio.content);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid portfolio content' }, { status: 400 });
  }

  try {
    const result = useMockAi
      ? mockImproveResumeSection({
          section: body.section,
          content: parsed.data,
          targetIndex: body.targetIndex,
          instruction: body.instruction,
        })
      : await improveResumeSection(apiKey!, {
          section: body.section,
          content: parsed.data,
          targetIndex: body.targetIndex,
          instruction: body.instruction,
        });

    await db.insert(aiUsageEvents).values({
      id: nanoid(12),
      userId,
      portfolioId,
      kind: 'rewrite',
      model: useMockAi ? 'dev-mock' : 'llama-3.3-70b-versatile',
      succeeded: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof ParseError ? error.message : 'Improvement failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
