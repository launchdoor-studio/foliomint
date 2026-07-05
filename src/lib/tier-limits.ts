export type PlanTier = 'free' | 'pro';

export interface TierLimits {
  maxPublishedPortfolios: number;
  /** Pro/trial: parses allowed per rolling 24h */
  maxAiParsesPerDay: number;
  /** Free: parses allowed per rolling 30 days */
  maxAiParsesPerMonth: number;
  maxAiRewritesPerMonth: number;
  maxMintMessagesPerDay: number;
  maxResumeExportsPerMonth: number;
  themes: Array<'classic' | 'neubrutalism' | 'editorial' | 'minimal' | 'terminal'>;
  includeFooter: boolean;
  blog: boolean;
  customDomain: boolean;
  advancedAnalytics: boolean;
  portfolioThemeCustomization: 'basic' | 'advanced';
}

/** Client-safe tier limits — keep free of DB imports for use in client components. */
export const TIER_LIMITS: Record<PlanTier, TierLimits> = {
  free: {
    maxPublishedPortfolios: 1,
    maxAiParsesPerDay: 0,
    maxAiParsesPerMonth: 3,
    maxAiRewritesPerMonth: 3,
    maxMintMessagesPerDay: 10,
    maxResumeExportsPerMonth: 1,
    themes: ['classic', 'minimal', 'neubrutalism'],
    includeFooter: true,
    blog: false,
    customDomain: false,
    advancedAnalytics: false,
    portfolioThemeCustomization: 'basic',
  },
  pro: {
    maxPublishedPortfolios: Number.POSITIVE_INFINITY,
    maxAiParsesPerDay: 20,
    maxAiParsesPerMonth: Number.POSITIVE_INFINITY,
    maxAiRewritesPerMonth: 100,
    maxMintMessagesPerDay: 50,
    maxResumeExportsPerMonth: Number.POSITIVE_INFINITY,
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
