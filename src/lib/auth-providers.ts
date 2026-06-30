export type OAuthProviderId = 'github' | 'google' | 'linkedin';

export interface OAuthProviderInfo {
  id: OAuthProviderId;
  label: string;
}

export function getEnabledOAuthProviders(): OAuthProviderInfo[] {
  const providers: OAuthProviderInfo[] = [];

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push({ id: 'github', label: 'GitHub' });
  }

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push({ id: 'google', label: 'Google' });
  }

  if (process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET) {
    providers.push({ id: 'linkedin', label: 'LinkedIn' });
  }

  return providers;
}
