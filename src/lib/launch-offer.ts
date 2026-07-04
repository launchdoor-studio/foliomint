/** Launch promo: $25 for one year of Pro — purchasable until this date (ISO 8601). */
const DEFAULT_LAUNCH_OFFER_END = '2026-08-04T23:59:59.999Z';

export function getLaunchOfferEndDate(): Date {
  const raw = process.env.LAUNCH_OFFER_END?.trim() || DEFAULT_LAUNCH_OFFER_END;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? new Date(DEFAULT_LAUNCH_OFFER_END) : date;
}

export function isLaunchOfferActive(now = new Date()): boolean {
  return now.getTime() <= getLaunchOfferEndDate().getTime();
}

export function getLaunchOfferDaysLeft(now = new Date()): number {
  const msLeft = getLaunchOfferEndDate().getTime() - now.getTime();
  if (msLeft <= 0) return 0;
  return Math.ceil(msLeft / (24 * 60 * 60 * 1000));
}

export type CheckoutPlan = 'pro_monthly' | 'launch_year';

export function resolveCheckoutVariantId(plan: CheckoutPlan): string | null {
  if (plan === 'launch_year') {
    if (!isLaunchOfferActive()) return null;
    return process.env.LEMONSQUEEZY_LAUNCH_VARIANT_ID?.trim() || null;
  }
  return process.env.LEMONSQUEEZY_VARIANT_ID?.trim() || null;
}
