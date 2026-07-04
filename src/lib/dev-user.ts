import { eq } from 'drizzle-orm';

import { DEV_USER, isDevAuthBypassed } from '@/lib/dev-mode';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function ensureDevUser(
  overrides?: Partial<{ id: string; email: string; name: string | null }>,
) {
  if (!isDevAuthBypassed()) return null;

  const id = overrides?.id ?? DEV_USER.id;
  const email = overrides?.email ?? DEV_USER.email;
  const name = overrides?.name ?? DEV_USER.name;

  let user = await db.select().from(users).where(eq(users.id, id)).get();
  if (user) return user;

  await db.insert(users).values({
    id,
    email,
    name,
    subscriptionStatus: 'active',
  });

  user = await db.select().from(users).where(eq(users.id, id)).get();
  return user ?? null;
}
