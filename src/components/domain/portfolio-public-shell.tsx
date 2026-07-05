import type { ReactNode } from 'react';
import { GeistMono } from 'geist/font/mono';

import {
  portfolioThemeColorsStyle,
  type PortfolioThemeColors,
} from '@/lib/portfolio-theme-colors';
import { cn } from '@/lib/utils';

export function PortfolioPublicShell({
  accentColor,
  themeColors,
  children,
  embed,
}: {
  accentColor?: string | null;
  themeColors?: PortfolioThemeColors | null;
  children: ReactNode;
  /** Nested preview: no full viewport height, rounded to sit inside editor card. */
  embed?: boolean;
}) {
  return (
    <div
      className={cn(
        GeistMono.className,
        'portfolio-public-canvas antialiased [color-scheme:light] dark:[color-scheme:dark]',
        embed ? 'min-h-[min(520px,60vh)] overflow-hidden rounded-md' : 'min-h-screen',
      )}
      style={portfolioThemeColorsStyle(themeColors, accentColor)}
    >
      {children}
    </div>
  );
}
