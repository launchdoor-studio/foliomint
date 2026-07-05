import type { ReactNode } from 'react';
import { GeistMono } from 'geist/font/mono';

import {
  portfolioThemeColorsStyle,
  type PortfolioThemeColors,
} from '@/lib/portfolio-theme-colors';
import { cn } from '@/lib/utils';
import type { PortfolioTheme } from '@/types';

export function PortfolioPublicShell({
  accentColor,
  themeColors,
  theme = 'neubrutalism',
  children,
  embed,
}: {
  accentColor?: string | null;
  themeColors?: PortfolioThemeColors | null;
  theme?: PortfolioTheme | string;
  children: ReactNode;
  embed?: boolean;
}) {
  const neu = theme === 'neubrutalism';

  return (
    <div
      className={cn(
        GeistMono.className,
        'portfolio-public-canvas antialiased [color-scheme:light] dark:[color-scheme:dark]',
        !neu && 'portfolio-surface',
        embed ? 'min-h-[min(520px,60vh)] overflow-hidden rounded-md' : 'min-h-screen',
      )}
      style={portfolioThemeColorsStyle(themeColors, accentColor)}
    >
      {children}
    </div>
  );
}
