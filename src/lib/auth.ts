import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

import { authConfig } from '@/lib/auth.config';
import { db } from '@/lib/db';
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from '@/lib/db/schema';
import { grantSignupTrialIfEligible } from '@/lib/signup-trial';
import { DEV_USER, isDevAuthBypassed } from '@/lib/dev-mode';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  events: {
    async createUser({ user }) {
      if (user.id) {
        await grantSignupTrialIfEligible(user.id);
      }
    },
  },
});

export interface AppUser {
  id: string;
  email: string;
  name?: string | null;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  if (isDevAuthBypassed()) {
    return {
      id: DEV_USER.id,
      email: DEV_USER.email,
      name: DEV_USER.name,
    };
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
