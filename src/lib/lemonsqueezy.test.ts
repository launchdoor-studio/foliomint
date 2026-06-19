import { describe, expect, it } from 'vitest';

import { mapLemonSubscriptionStatus, verifyLemonSqueezyWebhookSignature } from '@/lib/lemonsqueezy';

describe('mapLemonSubscriptionStatus', () => {
  it('maps active-like statuses', () => {
    expect(mapLemonSubscriptionStatus('active')).toBe('active');
    expect(mapLemonSubscriptionStatus('on_trial')).toBe('trialing');
    expect(mapLemonSubscriptionStatus('cancelled')).toBe('cancelled');
  });

  it('maps expired', () => {
    expect(mapLemonSubscriptionStatus('expired')).toBe('expired');
  });
});

describe('verifyLemonSqueezyWebhookSignature', () => {
  it('rejects bad signature', () => {
    expect(verifyLemonSqueezyWebhookSignature('{}', 'secret', 'deadbeef')).toBe(false);
  });
});
