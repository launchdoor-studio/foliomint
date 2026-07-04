import { NextResponse } from 'next/server';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import { userHasProAccess } from '@/lib/pro-access';
import { normalizePublicDomain } from '@/lib/slug';

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
  if (!domain) {
    return NextResponse.json({ error: 'Save a custom domain on your portfolio first' }, { status: 400 });
  }

  const normalized = normalizePublicDomain(domain);
  const token = nanoid(32);

  await db
    .update(portfolios)
    .set({
      domainVerificationToken: token,
      customDomainVerified: false,
      customDomain: normalized,
      updatedAt: new Date(),
    })
    .where(eq(portfolios.id, portfolio.id));

  return NextResponse.json({
    domain: normalized,
    txtName: `_foliomint.${normalized}`,
    txtValue: `foliomint-verify=${token}`,
    instructions:
      `Add a TXT record at host _foliomint (full name: _foliomint.${normalized}) with value foliomint-verify=${token}. Then click verify.`,
  });
}
