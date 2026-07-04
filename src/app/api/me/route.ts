import { NextResponse } from 'next/server';
import { isDevAuthBypassed } from '@/lib/dev-mode';

import {
  getAiUsageRemaining,
  getTierLimits,
  getUserTier,
} from '@/lib/access';
import { isPlatformAiAvailable } from '@/lib/ai-credentials';
import { getCurrentUser } from '@/lib/auth';
import { expireTrialIfNeeded, getTrialDaysLeft } from '@/lib/signup-trial';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  if (appUser) {
    await expireTrialIfNeeded(userId);
  }

  if (isPaymentGatingBypassed()) {
    const tier = 'pro' as const;
    const limits = getTierLimits(tier);
    const usage = await getAiUsageRemaining(userId, tier);
    return NextResponse.json({
      tier,
      limits,
      usage,
      email: appUser?.email ?? 'dev@example.com',
      aiAvailable: isPlatformAiAvailable(),
      trialDaysLeft: null,
    });
  }

  const tier = await getUserTier(userId);
  const limits = getTierLimits(tier);
  const usage = await getAiUsageRemaining(userId, tier);
  const trialDaysLeft = await getTrialDaysLeft(userId);

  return NextResponse.json({
    tier,
    limits,
    usage,
    email: appUser?.email ?? null,
    aiAvailable: isPlatformAiAvailable(),
    trialDaysLeft,
  });
}
