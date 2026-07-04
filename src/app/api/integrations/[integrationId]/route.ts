import { NextResponse } from 'next/server';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { eq } from 'drizzle-orm';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
interface Ctx {
  params: { integrationId: string };
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const row = await db
    .select()
    .from(integrations)
    .where(eq(integrations.id, params.integrationId))
    .get();

  if (!row || row.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.delete(integrations).where(eq(integrations.id, params.integrationId));
  return NextResponse.json({ ok: true });
}
