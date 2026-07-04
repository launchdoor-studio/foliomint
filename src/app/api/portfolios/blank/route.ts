import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

import { getUserTier } from '@/lib/access';
import { getCurrentUser } from '@/lib/auth';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { ensureDevUser } from '@/lib/dev-user';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import { isPaymentGatingBypassed } from '@/lib/feature-flags';
import { createBlankPortfolioContent } from '@/lib/portfolio-content';

export async function POST() {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';
  const userEmail = appUser?.email ?? 'dev@example.com';

  const user = await ensureDevUser({
    id: userId,
    email: userEmail,
    name: appUser?.name ?? 'Dev User',
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const tier = isPaymentGatingBypassed() ? 'pro' : await getUserTier(userId);
  if (tier !== 'pro') {
    const existingPortfolios = await db
      .select({ id: portfolios.id, expiresAt: portfolios.expiresAt })
      .from(portfolios)
      .where(eq(portfolios.userId, userId));

    const hasActivePortfolio = existingPortfolios.some((p) => !p.expiresAt || p.expiresAt > new Date());
    if (hasActivePortfolio) {
      return NextResponse.json(
        {
          error:
            'Free includes one active portfolio. Upgrade to Pro for multiple portfolios, or wait for expiry before creating another.',
        },
        { status: 403 },
      );
    }
  }

  const portfolioId = nanoid(12);
  const name = appUser?.name ?? user?.name ?? 'Your Name';
  const slug = `portfolio-${nanoid(8)}`;
  const now = new Date();

  await db.insert(portfolios).values({
    id: portfolioId,
    userId,
    slug,
    title: `${name}'s Portfolio`,
    content: createBlankPortfolioContent(name) as unknown as Record<string, unknown>,
    theme: 'neubrutalism',
    status: 'draft',
    expiresAt: tier === 'pro' ? null : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ portfolioId, slug });
}
