import { and, count, eq, gte } from 'drizzle-orm';

import { db } from '@/lib/db';
import { aiUsageEvents, users } from '@/lib/db/schema';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';

export type PlanTier = 'free' | 'pro';
export type SubscriptionStatus = 'free' | 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
export type AiUsageKind = 'parse' | 'rewrite' | 'suggestion';

export interface TierLimits {
  maxPublishedPortfolios: number;
  maxAiParsesPerDay: number;
  maxAiSuggestionsPerMonth: number;
  themes: Array<'classic' | 'neubrutalism' | 'editorial' | 'minimal' | 'terminal'>;
  includeFooter: boolean;
  blog: boolean;
  customDomain: boolean;
  advancedAnalytics: boolean;
  portfolioThemeCustomization: 'basic' | 'advanced';
}

export const TIER_LIMITS: Record<PlanTier, TierLimits> = {
  free: {
    maxPublishedPortfolios: 1,
    maxAiParsesPerDay: 3,
    maxAiSuggestionsPerMonth: 10,
    themes: ['classic', 'minimal', 'neubrutalism'],
    includeFooter: true,
    blog: false,
    customDomain: false,
    advancedAnalytics: false,
    portfolioThemeCustomization: 'basic',
  },
  pro: {
    maxPublishedPortfolios: Number.POSITIVE_INFINITY,
    maxAiParsesPerDay: 50,
    maxAiSuggestionsPerMonth: 500,
    themes: ['classic', 'neubrutalism', 'editorial', 'minimal', 'terminal'],
    includeFooter: false,
    blog: true,
    customDomain: true,
    advancedAnalytics: true,
    portfolioThemeCustomization: 'advanced',
  },
};

const PAST_DUE_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

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

export function getTierLimits(tier: PlanTier): TierLimits {
  return TIER_LIMITS[tier];
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
    const startOfDay = new Date(now - 24 * 60 * 60 * 1000);
    return (await getAiUsageCountSince(userId, 'parse', startOfDay)) < limits.maxAiParsesPerDay;
  }

  const startOfMonth = new Date(now - 30 * 24 * 60 * 60 * 1000);
  return (await getAiUsageCountSince(userId, kind, startOfMonth)) < limits.maxAiSuggestionsPerMonth;
}
