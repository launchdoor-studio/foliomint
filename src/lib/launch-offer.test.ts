import { describe, expect, it } from 'vitest';

import { getLaunchOfferDaysLeft, isLaunchOfferActive } from '@/lib/launch-offer';

describe('launch-offer', () => {
  it('is active before promo end', () => {
    expect(isLaunchOfferActive(new Date('2026-07-15T12:00:00.000Z'))).toBe(true);
  });

  it('is inactive after promo end', () => {
    expect(isLaunchOfferActive(new Date('2027-01-01T00:00:00.000Z'))).toBe(false);
  });

  it('returns days left during promo', () => {
    const days = getLaunchOfferDaysLeft(new Date('2026-07-04T00:00:00.000Z'));
    expect(days).toBeGreaterThan(0);
    expect(days).toBeLessThanOrEqual(32);
  });
});
