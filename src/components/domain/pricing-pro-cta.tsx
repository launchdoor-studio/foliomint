'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { CheckoutPlan } from '@/lib/launch-offer';

interface PricingProCtaProps {
  className?: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Button label (default matches marketing pricing page). */
  label?: string;
  /** Path users return to after signing in to complete checkout. */
  signInCallbackUrl?: string;
  /** Lemon Squeezy plan to start checkout for. */
  checkoutPlan?: CheckoutPlan;
}

export function PricingProCta({
  className,
  variant = 'default',
  size = 'lg',
  label = 'Start Pro',
  signInCallbackUrl = '/pricing',
  checkoutPlan = 'pro_monthly',
}: PricingProCtaProps) {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (status !== 'authenticated') {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(signInCallbackUrl)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: checkoutPlan }),
      });
      const data = (await res.json()) as { url?: string; error?: string; hint?: string };
      if (!res.ok) {
        const msg = [data.error, data.hint].filter(Boolean).join('\n\n');
        throw new Error(msg || 'Could not start checkout');
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('No checkout URL returned');
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className={cn('w-full', className)}
      variant={variant}
      size={size}
      onClick={() => void handleClick()}
      disabled={loading || status === 'loading'}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting…
        </>
      ) : (
        label
      )}
    </Button>
  );
}
