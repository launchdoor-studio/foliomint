import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import LinkedIn from 'next-auth/providers/linkedin';

import { getEnabledOAuthProviders } from '@/lib/auth-providers';

process.env.AUTH_URL ||= process.env.NEXTAUTH_URL;
process.env.AUTH_SECRET ||= process.env.NEXTAUTH_SECRET;

const providers: NextAuthConfig['providers'] = [];

for (const provider of getEnabledOAuthProviders()) {
  if (provider.id === 'github') {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      }),
    );
  }

  if (provider.id === 'google') {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    );
  }

  if (provider.id === 'linkedin') {
    providers.push(
      LinkedIn({
        clientId: process.env.AUTH_LINKEDIN_ID,
        clientSecret: process.env.AUTH_LINKEDIN_SECRET,
        authorization: { params: { scope: 'openid profile email' } },
      }),
    );
  }
}

export const authConfig = {
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === 'development' ? 'dev-secret-do-not-use-in-prod' : undefined),
  session: {
    strategy: 'jwt',
  },
  providers,
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  callbacks: {
    authorized({ auth }) {
      if (process.env.NEXTAUTH_DEV_BYPASS === 'true') {
        return true;
      }
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/generate';
    },
  },
} satisfies NextAuthConfig;
