'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

const classicToggleClass =
  'inline-flex h-10 w-10 min-h-0 min-w-0 shrink-0 items-center justify-center rounded-none border border-[var(--portfolio-border)] bg-[var(--portfolio-surface-elevated)] p-0 leading-none text-[var(--portfolio-fg)] shadow-none hover:bg-[color-mix(in_srgb,var(--portfolio-fg)_8%,var(--portfolio-bg))] focus-visible:ring-0 focus-visible:ring-offset-0';

/** Neubrutalism public pages: match nav pill energy without duplicating full pill styles. */
const neuToggleClass =
  '!rounded-none border-4 border-[var(--portfolio-fg)] bg-[var(--portfolio-surface-elevated)] text-[var(--portfolio-fg)] shadow-[4px_4px_0_0_var(--portfolio-shadow)] hover:bg-[color-mix(in_srgb,var(--portfolio-fg)_6%,var(--portfolio-bg))]';

export function PortfolioPublicThemeToggle({
  variant = 'classic',
  className,
}: {
  variant?: 'classic' | 'neu';
  className?: string;
}) {
  return (
    <ThemeToggle
      className={cn(variant === 'neu' ? neuToggleClass : classicToggleClass, 'shrink-0', className)}
    />
  );
}
