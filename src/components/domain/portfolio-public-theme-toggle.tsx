'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { portfolioClassicThemeToggleClass } from '@/lib/portfolio-classic-ui';
import { cn } from '@/lib/utils';

/** Neubrutalism public pages: match nav pill energy without duplicating full pill styles. */
const neuToggleClass =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-none border-4 border-[var(--portfolio-fg)] bg-[var(--portfolio-surface-elevated)] p-0 text-[var(--portfolio-fg)] shadow-[4px_4px_0_0_var(--portfolio-shadow)] transition-transform hover:translate-x-px hover:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portfolio-fg)] focus-visible:ring-offset-2';

/** Portfolio light/dark toggle — native button so app neubrutalist Button styles never leak in. */
export function PortfolioPublicThemeToggle({
  variant = 'classic',
  className,
}: {
  variant?: 'classic' | 'neu';
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const classic = variant !== 'neu';

  return (
    <button
      type="button"
      className={cn(
        classic ? portfolioClassicThemeToggleClass() : neuToggleClass,
        'relative shrink-0',
        className,
      )}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle light or dark mode"
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}
