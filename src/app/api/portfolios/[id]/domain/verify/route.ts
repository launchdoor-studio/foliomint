import { NextResponse } from 'next/server';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { eq } from 'drizzle-orm';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import { verifyFoliomintDomainTxt } from '@/lib/domain-dns';
import { userHasProAccess } from '@/lib/pro-access';

interface Ctx {
  params: { id: string };
}

export async function POST(_request: Request, { params }: Ctx) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, params.id))
    .get();

  if (!portfolio || portfolio.userId !== userId) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  if (!(await userHasProAccess(userId))) {
    return NextResponse.json({ error: 'Custom domains require a Pro subscription' }, { status: 403 });
  }

  const domain = portfolio.customDomain?.trim();
  const token = portfolio.domainVerificationToken?.trim();

  if (!domain || !token) {
    return NextResponse.json({ error: 'Request a verification token first' }, { status: 400 });
  }

  const ok = await verifyFoliomintDomainTxt(domain, token);

  if (!ok) {
    return NextResponse.json({ verified: false, error: 'TXT record not found or token mismatch' }, { status: 400 });
  }

  await db
    .update(portfolios)
    .set({
      customDomainVerified: true,
      domainVerificationToken: null,
      updatedAt: new Date(),
    })
    .where(eq(portfolios.id, portfolio.id));

  return NextResponse.json({ verified: true });
}
