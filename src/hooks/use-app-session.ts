'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export type AppSessionUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export type AppSession = {
  isSignedIn: boolean;
  isLoading: boolean;
  user: AppSessionUser | null;
  /** True when LOCAL_DEV_MODE / NEXTAUTH_DEV_BYPASS grants server-side access without OAuth. */
  isDevBypass: boolean;
  tier: 'free' | 'pro' | null;
  /** False when payment gating is bypassed or the user already has Pro. */
  showUpgradeCta: boolean;
};

type MeResponse = {
  email?: string | null;
  devBypass?: boolean;
  paymentBypass?: boolean;
  tier?: 'free' | 'pro';
};

/**
 * Unified auth for UI: NextAuth session plus dev-bypass identity from /api/me.
 * Server routes already honor dev bypass via getCurrentUser(); this keeps the navbar in sync.
 */
export function useAppSession(): AppSession {
  const { data: session, status } = useSession();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [meChecked, setMeChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/me', { credentials: 'include' })
      .then(async (res) => (res.ok ? ((await res.json()) as MeResponse) : null))
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .finally(() => {
        if (!cancelled) setMeChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const oauthUser =
    status === 'authenticated' && session?.user?.email ? session.user : null;

  const tier = me?.tier ?? null;
  const showUpgradeCta = tier === 'free' && me?.paymentBypass !== true;

  if (oauthUser) {
    return {
      isSignedIn: true,
      isLoading: !meChecked,
      isDevBypass: false,
      tier,
      showUpgradeCta,
      user: {
        id: oauthUser.id ?? '',
        name: oauthUser.name ?? null,
        email: oauthUser.email ?? '',
        image: oauthUser.image ?? null,
      },
    };
  }

  if (status === 'loading' || !meChecked) {
    return {
      isSignedIn: false,
      isLoading: true,
      user: null,
      isDevBypass: false,
      tier: null,
      showUpgradeCta: false,
    };
  }

  if (me?.email) {
    return {
      isSignedIn: true,
      isLoading: false,
      isDevBypass: me.devBypass === true,
      tier,
      showUpgradeCta,
      user: {
        id: 'dev-user',
        name: 'Dev User',
        email: me.email,
        image: null,
      },
    };
  }

  return {
    isSignedIn: false,
    isLoading: false,
    user: null,
    isDevBypass: false,
    tier: null,
    showUpgradeCta: false,
  };
}
