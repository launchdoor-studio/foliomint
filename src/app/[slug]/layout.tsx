import type { ReactNode } from 'react';
import { eq } from 'drizzle-orm';

import { PortfolioPublicShell } from '@/components/domain/portfolio-public-shell';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import {
  extractPortfolioThemeColors,
  type PortfolioThemeSettings,
} from '@/lib/portfolio-theme-colors';

export default async function PublicPortfolioSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  const row = await db
    .select({
      accentColor: portfolios.accentColor,
      themeSettings: portfolios.themeSettings,
      theme: portfolios.theme,
    })
    .from(portfolios)
    .where(eq(portfolios.slug, params.slug))
    .get();

  return (
    <PortfolioPublicShell
      accentColor={row?.accentColor ?? null}
      themeColors={extractPortfolioThemeColors(row?.themeSettings as PortfolioThemeSettings | null)}
      theme={row?.theme ?? 'neubrutalism'}
    >
      {children}
    </PortfolioPublicShell>
  );
}
