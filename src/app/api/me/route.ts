import { NextResponse } from 'next/server';
import { getTierLimits, getUserTier } from '@/lib/access';
import { getAiKeyStatus, resolveDevGroqApiKey } from '@/lib/ai-credentials';
import { getCurrentUser } from '@/lib/auth';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appUser = await getCurrentUser();
  if (!appUser && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const aiStatus = await getAiKeyStatus(userId);
  const aiConfigured = aiStatus.configured || resolveDevGroqApiKey() !== null;

  if (isPaymentGatingBypassed()) {
    const tier = 'pro' as const;
    return NextResponse.json({
      tier,
      limits: getTierLimits(tier),
      email: appUser?.email ?? 'dev@example.com',
      aiConfigured,
      aiProvider: aiStatus.provider,
      aiKeyHint: aiStatus.hint,
    });
  }

  const tier = await getUserTier(userId);

  return NextResponse.json({
    tier,
    limits: getTierLimits(tier),
    email: appUser?.email ?? null,
    aiConfigured,
    aiProvider: aiStatus.provider,
    aiKeyHint: aiStatus.hint,
  });
}
