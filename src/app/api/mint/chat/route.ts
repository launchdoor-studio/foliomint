import { NextResponse } from 'next/server';
import { z } from 'zod';

import { canUseAiFeature, getUserTier } from '@/lib/access';
import { recordAiUsage } from '@/lib/ai-usage';
import { resolvePlatformGroqApiKey } from '@/lib/ai-credentials';
import { getCurrentUser } from '@/lib/auth';
import { mockMintReply } from '@/lib/dev-mock-ai';
import { isDevAuthBypassed, shouldUseDevMockAi } from '@/lib/dev-mode';
import { ensureDevUser } from '@/lib/dev-user';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';
import { chatWithMint } from '@/lib/mint/chat';
import { findCuratedMintAnswer, type MintContext } from '@/lib/mint/help-knowledge';
import { expireTrialIfNeeded, getTrialDaysLeft } from '@/lib/signup-trial';

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  context: z
    .object({
      pathname: z.string(),
      editorStep: z.string().optional(),
      portfolioId: z.string().optional(),
      hasPortfolio: z.boolean().optional(),
      isPublished: z.boolean().optional(),
      resumeHealth: z
        .object({
          score: z.number(),
          label: z.string(),
          openItems: z.array(
            z.object({
              id: z.string(),
              label: z.string(),
              hint: z.string().optional(),
              editorStep: z.string(),
            }),
          ),
          missingFields: z.array(z.string()),
          suggestedTagline: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(20)
    .optional(),
});

export async function POST(request: Request) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  if (isDevAuthBypassed()) {
    await ensureDevUser({ id: userId });
  }

  if (appUser) {
    await expireTrialIfNeeded(userId);
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!(await canUseAiFeature(userId, 'mint_chat'))) {
    return NextResponse.json(
      {
        error: "You've reached today's Mint message limit. Try again tomorrow or upgrade to Pro.",
        code: 'MINT_LIMIT_REACHED',
      },
      { status: 403 },
    );
  }

  const tier = isPaymentGatingBypassed() ? 'pro' : await getUserTier(userId);
  const trialDaysLeft = appUser ? await getTrialDaysLeft(userId) : null;

  const mintContext: MintContext = {
    pathname: body.context?.pathname ?? '/',
    editorStep: body.context?.editorStep,
    portfolioId: body.context?.portfolioId,
    tier,
    trialDaysLeft,
    hasPortfolio: body.context?.hasPortfolio,
    isPublished: body.context?.isPublished,
    resumeHealth: body.context?.resumeHealth,
  };

  const curated = findCuratedMintAnswer(body.message, mintContext);
  if (curated) {
    await recordAiUsage({
      userId,
      kind: 'mint_chat',
      model: 'curated',
    });
    return NextResponse.json({ reply: curated, source: 'curated' });
  }

  const apiKey = resolvePlatformGroqApiKey();
  const useMockAi = shouldUseDevMockAi();
  if (!apiKey && !useMockAi) {
    return NextResponse.json(
      { error: 'Mint is temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }

  const history = body.history ?? [];
  const messages = [...history, { role: 'user' as const, content: body.message }];

  try {
    const reply = useMockAi
      ? mockMintReply(body.message, mintContext)
      : await chatWithMint(apiKey!, mintContext, messages);
    await recordAiUsage({
      userId,
      kind: 'mint_chat',
      model: useMockAi ? 'dev-mock' : 'llama-3.3-70b-versatile',
    });
    return NextResponse.json({ reply, source: useMockAi ? 'dev-mock' : 'groq' });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Mint could not respond.',
      },
      { status: 502 },
    );
  }
}
