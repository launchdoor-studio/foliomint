import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import type { PortfolioThemeSettings } from '@/lib/portfolio-theme-colors';

type SubscriptionStatus = 'free' | 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
type PortfolioStatus = 'draft' | 'published' | 'unpublished' | 'archived';
type PortfolioTheme = 'classic' | 'neubrutalism' | 'editorial' | 'minimal' | 'terminal';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  image: text('image'),
  subscriptionStatus: text('subscription_status').$type<SubscriptionStatus>().default('free').notNull(),
  lemonSqueezyCustomerId: text('lemon_squeezy_customer_id'),
  lemonSqueezySubscriptionId: text('lemon_squeezy_subscription_id'),
  lemonSqueezyVariantId: text('lemon_squeezy_variant_id'),
  subscriptionRenewsAt: integer('subscription_renews_at', { mode: 'timestamp' }),
  subscriptionEndsAt: integer('subscription_ends_at', { mode: 'timestamp' }),
  trialEndsAt: integer('trial_ends_at', { mode: 'timestamp' }),
  onboardingCompletedAt: integer('onboarding_completed_at', { mode: 'timestamp' }),
  preferences: text('preferences', { mode: 'json' })
    .$type<{
      theme: 'light' | 'dark' | 'system';
      defaultPortfolioTheme?: PortfolioTheme;
      defaultPortfolioAccent?: string;
    }>()
    .default({ theme: 'system', defaultPortfolioTheme: 'neubrutalism' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const accounts = sqliteTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

export const sessions = sqliteTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const portfolios = sqliteTable(
  'portfolios',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    slug: text('slug').unique().notNull(),
    /** Optional clean public path segment: site is /u/{publicHandle} when set (unique among non-null rows). */
    publicHandle: text('public_handle'),
    title: text('title').notNull(),
    status: text('status').$type<PortfolioStatus>().default('draft').notNull(),
    content: text('content', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
    theme: text('theme').$type<PortfolioTheme>().default('neubrutalism').notNull(),
    themeSettings: text('theme_settings', { mode: 'json' })
      .$type<PortfolioThemeSettings>()
      .default({ palette: 'mint-orange', density: 'comfortable', borderStyle: 'bold', heroStyle: 'cards' }),
    /** Hex accent for public portfolio (links, chips, markers). Default applied in UI when null. */
    accentColor: text('accent_color'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    isPublished: integer('is_published', { mode: 'boolean' }).default(false).notNull(),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    unpublishedAt: integer('unpublished_at', { mode: 'timestamp' }),
    groqConsent: integer('groq_consent', { mode: 'boolean' }).default(false).notNull(),
    customDomain: text('custom_domain'),
    domainVerificationToken: text('domain_verification_token'),
    /** Null for rows created before this column existed; treat as false in app code. */
    customDomainVerified: integer('custom_domain_verified', { mode: 'boolean' }),
    customDomainRequestedAt: integer('custom_domain_requested_at', { mode: 'timestamp' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    publicHandleUnq: uniqueIndex('portfolios_public_handle_unq').on(t.publicHandle),
  }),
);

export const integrations = sqliteTable(
  'integrations',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(),
    username: text('username'),
    accessToken: text('access_token'),
    data: text('data', { mode: 'json' }).$type<Record<string, unknown>>(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    userPlatformUnq: uniqueIndex('integrations_user_platform_unq').on(t.userId, t.platform),
  }),
);

export const uploadAttempts = sqliteTable('upload_attempts', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  lastAttempt: integer('last_attempt', { mode: 'timestamp' }).notNull(),
  count24h: integer('count_24h').default(0).notNull(),
});

export const aiUsageEvents = sqliteTable(
  'ai_usage_events',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    portfolioId: text('portfolio_id').references(() => portfolios.id, { onDelete: 'set null' }),
    kind: text('kind').$type<'parse' | 'rewrite' | 'suggestion' | 'mint_chat' | 'export'>().notNull(),
    provider: text('provider').notNull().default('groq'),
    model: text('model'),
    inputTokens: integer('input_tokens').default(0).notNull(),
    outputTokens: integer('output_tokens').default(0).notNull(),
    succeeded: integer('succeeded', { mode: 'boolean' }).default(true).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    userKindCreatedAtIdx: index('ai_usage_events_user_kind_created_at_idx').on(t.userId, t.kind, t.createdAt),
  }),
);

export const paymentWebhookEvents = sqliteTable('payment_webhook_events', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull().default('lemonsqueezy'),
  eventName: text('event_name').notNull(),
  processedAt: integer('processed_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** BYOK: one AI provider credential per user (encrypted at rest). */
export const userAiCredentials = sqliteTable('user_ai_credentials', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull().default('groq'),
  encryptedKey: text('encrypted_key').notNull(),
  keyHint: text('key_hint').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const viewLogs = sqliteTable('view_logs', {
  id: text('id').primaryKey(),
  portfolioId: text('portfolio_id')
    .notNull()
    .references(() => portfolios.id, { onDelete: 'cascade' }),
  viewedAt: integer('viewed_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  country: text('country'),
  device: text('device'),
});

export const blogPosts = sqliteTable(
  'blog_posts',
  {
    id: text('id').primaryKey(),
    portfolioId: text('portfolio_id')
      .notNull()
      .references(() => portfolios.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    content: text('content').notNull(),
    excerpt: text('excerpt'),
    isPublished: integer('is_published', { mode: 'boolean' }).default(false).notNull(),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    portfolioSlugUnq: uniqueIndex('blog_posts_portfolio_slug_unq').on(t.portfolioId, t.slug),
  }),
);
