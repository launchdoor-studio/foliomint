import { NextResponse } from 'next/server';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { INTEGRATION_PLATFORMS } from '@/lib/social-links';
import { userHasProAccess } from '@/lib/pro-access';

const bodySchema = z.object({
  platform: z
    .string()
    .refine((p) => (INTEGRATION_PLATFORMS as readonly string[]).includes(p), 'Invalid platform'),
  username: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

export async function GET() {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const rows = await db
    .select()
    .from(integrations)
    .where(eq(integrations.userId, userId));

  return NextResponse.json({ integrations: rows });
}

export async function POST(request: Request) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  if (!(await userHasProAccess(userId))) {
    return NextResponse.json({ error: 'Integrations require a Pro subscription' }, { status: 403 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const url = body.url === '' ? undefined : body.url;
  const data: Record<string, unknown> = {};
  if (url) data.url = url;

  const existing = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.platform, body.platform)))
    .get();

  const now = new Date();

  if (existing) {
    await db
      .update(integrations)
      .set({
        username: body.username ?? null,
        data: Object.keys(data).length ? data : null,
        updatedAt: now,
      })
      .where(eq(integrations.id, existing.id));
    const updated = await db.select().from(integrations).where(eq(integrations.id, existing.id)).get();
    return NextResponse.json({ integration: updated });
  }

  const id = nanoid(12);
  await db.insert(integrations).values({
    id,
    userId,
    platform: body.platform,
    username: body.username ?? null,
    data: Object.keys(data).length ? data : null,
    updatedAt: now,
  });

  const row = await db.select().from(integrations).where(eq(integrations.id, id)).get();
  return NextResponse.json({ integration: row }, { status: 201 });
}
