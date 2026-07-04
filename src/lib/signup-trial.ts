import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

const DEFAULT_PROMO_END = '2026-09-04T23:59:59.999Z';
const DEFAULT_TRIAL_DAYS = 14;

export function getSignupTrialPromoEndDate(): Date {
  const raw = process.env.SIGNUP_TRIAL_PROMO_END?.trim() || DEFAULT_PROMO_END;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? new Date(DEFAULT_PROMO_END) : date;
}

export function getSignupTrialDays(): number {
  const parsed = Number(process.env.SIGNUP_TRIAL_DAYS ?? DEFAULT_TRIAL_DAYS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TRIAL_DAYS;
}

export function isWithinSignupTrialPromo(now = new Date()): boolean {
  return now.getTime() <= getSignupTrialPromoEndDate().getTime();
}

export async function grantSignupTrialIfEligible(userId: string): Promise<void> {
  if (!isWithinSignupTrialPromo()) return;

  const row = await db
    .select({
      subscriptionStatus: users.subscriptionStatus,
      lemonSqueezySubscriptionId: users.lemonSqueezySubscriptionId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!row) return;
  if (row.lemonSqueezySubscriptionId) return;
  if (row.subscriptionStatus === 'active') return;

  const trialEndsAt = new Date(Date.now() + getSignupTrialDays() * 24 * 60 * 60 * 1000);

  await db
    .update(users)
    .set({
      subscriptionStatus: 'trialing',
      trialEndsAt,
    })
    .where(eq(users.id, userId));
}

export async function expireTrialIfNeeded(userId: string): Promise<void> {
  const row = await db
    .select({
      subscriptionStatus: users.subscriptionStatus,
      trialEndsAt: users.trialEndsAt,
      lemonSqueezySubscriptionId: users.lemonSqueezySubscriptionId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!row || row.subscriptionStatus !== 'trialing') return;
  if (!row.trialEndsAt || row.trialEndsAt.getTime() > Date.now()) return;

  await db
    .update(users)
    .set({ subscriptionStatus: 'free' })
    .where(eq(users.id, userId));
}

export async function getTrialDaysLeft(userId: string): Promise<number | null> {
  const row = await db
    .select({
      subscriptionStatus: users.subscriptionStatus,
      trialEndsAt: users.trialEndsAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!row || row.subscriptionStatus !== 'trialing' || !row.trialEndsAt) return null;

  const msLeft = row.trialEndsAt.getTime() - Date.now();
  if (msLeft <= 0) return 0;

  return Math.ceil(msLeft / (24 * 60 * 60 * 1000));
}
