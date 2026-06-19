export type PlanTier = 'free' | 'pro';
export type LicenseTier = PlanTier;

export type BillingStatus = 'free' | 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';

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

export function getTierLimits(tier: PlanTier): TierLimits {
  return TIER_LIMITS[tier];
}

export function planTierFromBillingStatus(status: BillingStatus): PlanTier {
  return status === 'active' || status === 'trialing' ? 'pro' : 'free';
}

export function hasFeature(tier: PlanTier, feature: keyof Pick<TierLimits, 'blog' | 'customDomain' | 'advancedAnalytics'>): boolean {
  return TIER_LIMITS[tier][feature];
}

export function defaultBillingStatus(): BillingStatus {
  return 'free';
}
