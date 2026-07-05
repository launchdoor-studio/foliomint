import { and, count, eq, gte } from 'drizzle-orm';

import { db } from '@/lib/db';
import { aiUsageEvents, users } from '@/lib/db/schema';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';
import {
  getTierLimits,
  TIER_LIMITS,
  type PlanTier,
  type TierLimits,
} from '@/lib/tier-limits';

export type { PlanTier, TierLimits } from '@/lib/tier-limits';
export { getTierLimits, TIER_LIMITS } from '@/lib/tier-limits';

export type SubscriptionStatus = 'free' | 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
export type AiUsageKind = 'parse' | 'rewrite' | 'suggestion' | 'mint_chat' | 'export';

const PAST_DUE_GRACE_MS = 3 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * DAY_MS;

export function tierFromSubscriptionStatus(
  status: SubscriptionStatus | null | undefined,
  dates?: { subscriptionEndsAt?: Date | null; subscriptionRenewsAt?: Date | null },
): PlanTier {
  const now = Date.now();
  if (status === 'active' || status === 'trialing') {
    return 'pro';
  }
  if (status === 'cancelled' && dates?.subscriptionEndsAt && dates.subscriptionEndsAt.getTime() > now) {
    return 'pro';
  }
  if (
    status === 'past_due' &&
    dates?.subscriptionRenewsAt &&
    dates.subscriptionRenewsAt.getTime() + PAST_DUE_GRACE_MS > now
  ) {
    return 'pro';
  }
  return 'free';
}

export async function getUserTier(userId: string): Promise<PlanTier> {
  if (isPaymentGatingBypassed()) return 'pro';

  const row = await db
    .select({
      subscriptionStatus: users.subscriptionStatus,
      subscriptionEndsAt: users.subscriptionEndsAt,
      subscriptionRenewsAt: users.subscriptionRenewsAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  return tierFromSubscriptionStatus(row?.subscriptionStatus as SubscriptionStatus | undefined, {
    subscriptionEndsAt: row?.subscriptionEndsAt,
    subscriptionRenewsAt: row?.subscriptionRenewsAt,
  });
}

export async function userHasProAccess(userId: string): Promise<boolean> {
  return (await getUserTier(userId)) === 'pro';
}

export async function getAiUsageCountSince(userId: string, kind: AiUsageKind, since: Date): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(aiUsageEvents)
    .where(
      and(
        eq(aiUsageEvents.userId, userId),
        eq(aiUsageEvents.kind, kind),
        gte(aiUsageEvents.createdAt, since),
      ),
    );

  return row?.value ?? 0;
}

export async function canUseAiFeature(userId: string, kind: AiUsageKind): Promise<boolean> {
  if (isPaymentGatingBypassed()) return true;

  const tier = await getUserTier(userId);
  const limits = getTierLimits(tier);
  const now = Date.now();

  if (kind === 'parse') {
    if (tier === 'free') {
      const since = new Date(now - MONTH_MS);
      return (await getAiUsageCountSince(userId, 'parse', since)) < limits.maxAiParsesPerMonth;
    }
    const since = new Date(now - DAY_MS);
    return (await getAiUsageCountSince(userId, 'parse', since)) < limits.maxAiParsesPerDay;
  }

  if (kind === 'rewrite' || kind === 'export') {
    const since = new Date(now - MONTH_MS);
    const limit = kind === 'rewrite' ? limits.maxAiRewritesPerMonth : limits.maxResumeExportsPerMonth;
    return (await getAiUsageCountSince(userId, kind, since)) < limit;
  }

  if (kind === 'mint_chat' || kind === 'suggestion') {
    const since = new Date(now - DAY_MS);
    const used = await getAiUsageCountSince(userId, 'mint_chat', since);
    return used < limits.maxMintMessagesPerDay;
  }

  return false;
}

export interface AiUsageRemaining {
  parsesRemaining: number;
  rewritesRemaining: number;
  mintMessagesRemaining: number;
  exportsRemaining: number;
}

export async function getAiUsageRemaining(userId: string, tier: PlanTier): Promise<AiUsageRemaining> {
  if (isPaymentGatingBypassed()) {
    return {
      parsesRemaining: Number.POSITIVE_INFINITY,
      rewritesRemaining: Number.POSITIVE_INFINITY,
      mintMessagesRemaining: Number.POSITIVE_INFINITY,
      exportsRemaining: Number.POSITIVE_INFINITY,
    };
  }

  const limits = getTierLimits(tier);
  const now = Date.now();

  if (tier === 'free') {
    const parseUsed = await getAiUsageCountSince(userId, 'parse', new Date(now - MONTH_MS));
    const rewriteUsed = await getAiUsageCountSince(userId, 'rewrite', new Date(now - MONTH_MS));
    const exportUsed = await getAiUsageCountSince(userId, 'export', new Date(now - MONTH_MS));
    const mintUsed = await getAiUsageCountSince(userId, 'mint_chat', new Date(now - DAY_MS));

    return {
      parsesRemaining: Math.max(0, limits.maxAiParsesPerMonth - parseUsed),
      rewritesRemaining: Math.max(0, limits.maxAiRewritesPerMonth - rewriteUsed),
      mintMessagesRemaining: Math.max(0, limits.maxMintMessagesPerDay - mintUsed),
      exportsRemaining: Math.max(0, limits.maxResumeExportsPerMonth - exportUsed),
    };
  }

  const parseUsed = await getAiUsageCountSince(userId, 'parse', new Date(now - DAY_MS));
  const rewriteUsed = await getAiUsageCountSince(userId, 'rewrite', new Date(now - MONTH_MS));
  const mintUsed = await getAiUsageCountSince(userId, 'mint_chat', new Date(now - DAY_MS));

  return {
    parsesRemaining: Math.max(0, limits.maxAiParsesPerDay - parseUsed),
    rewritesRemaining: Math.max(0, limits.maxAiRewritesPerMonth - rewriteUsed),
    mintMessagesRemaining: Math.max(0, limits.maxMintMessagesPerDay - mintUsed),
    exportsRemaining: Number.POSITIVE_INFINITY,
  };
}
