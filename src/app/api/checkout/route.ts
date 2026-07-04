import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';
import { type CheckoutPlan, isLaunchOfferActive, resolveCheckoutVariantId } from '@/lib/launch-offer';
import { createLemonSqueezyCheckout } from '@/lib/lemonsqueezy';

export async function POST(request: Request) {
  if (isPaymentGatingBypassed()) {
    return NextResponse.json({ url: '/dashboard?checkout=dev-bypass' });
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim();

  let plan: CheckoutPlan = 'pro_monthly';
  try {
    const body = (await request.json()) as { plan?: string };
    if (body.plan === 'launch_year') plan = 'launch_year';
  } catch {
    /* empty body → monthly */
  }

  if (plan === 'launch_year' && !isLaunchOfferActive()) {
    return NextResponse.json(
      { error: 'The launch offer has ended. Choose Pro monthly instead.' },
      { status: 410 },
    );
  }

  const variantId = resolveCheckoutVariantId(plan);

  if (!apiKey || !storeId || !variantId) {
    return NextResponse.json(
      {
        error: 'Checkout is not available right now. Please try again later.',
        ...(process.env.NODE_ENV !== 'production' && {
          hint:
            plan === 'launch_year'
              ? 'Set LEMONSQUEEZY_LAUNCH_VARIANT_ID for the launch offer, or use payment bypass for local dev.'
              : 'Configure Lemon Squeezy in your environment, or use payment bypass only for local development.',
        }),
      },
      { status: 503 },
    );
  }

  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const userId = appUser?.id ?? 'dev-user';
  const email = appUser?.email ?? 'dev@example.com';

  const result = await createLemonSqueezyCheckout({
    apiKey,
    storeId,
    variantId,
    userId,
    email,
    name: appUser?.name,
    baseUrl,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ url: result.url });
}
