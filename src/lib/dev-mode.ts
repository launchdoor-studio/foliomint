import { resolvePlatformGroqApiKey } from '@/lib/ai-credentials';

/** Full local testing mode — never enable in production. */
export function isLocalDevMode(): boolean {
  return process.env.LOCAL_DEV_MODE === 'true' && process.env.NODE_ENV !== 'production';
}

export function isDevAuthBypassed(): boolean {
  return process.env.NEXTAUTH_DEV_BYPASS === 'true' || isLocalDevMode();
}

export function isPaymentGatingBypassed(): boolean {
  return process.env.BYPASS_PAYMENT_GATING === 'true' || isLocalDevMode();
}

/** Use stub AI responses when Groq is not configured (local dev only). */
export function shouldUseDevMockAi(): boolean {
  return isLocalDevMode() && resolvePlatformGroqApiKey() === null;
}

export const DEV_USER = {
  id: 'dev-user',
  email: 'dev@example.com',
  name: 'Dev User',
} as const;
