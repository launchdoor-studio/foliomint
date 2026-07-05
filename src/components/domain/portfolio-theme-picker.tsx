'use client';

import { Check } from 'lucide-react';

import { TIER_LIMITS, type PlanTier } from '@/lib/tier-limits';
import { cn } from '@/lib/utils';
import type { PortfolioTheme } from '@/types';

const SELECTABLE_THEMES: Array<{
  id: Extract<PortfolioTheme, 'classic' | 'neubrutalism'>;
  name: string;
  description: string;
}> = [
  {
    id: 'neubrutalism',
    name: 'Neubrutalism',
    description: 'Bold borders, chunky offset shadows, and tactile cards with editorial punch. Default.',
  },
  {
    id: 'classic',
    name: 'Classic',
    description:
      'Minimal mono editorial — bordered cards, grayscale palette, square avatar, and clean project grid.',
  },
];

function ThemePreviewMock({ variant }: { variant: 'classic' | 'neubrutalism' }) {
  const neu = variant === 'neubrutalism';
  return (
    <div
      className={cn(
        'pointer-events-none mt-4 overflow-hidden rounded-lg border p-3',
        neu ? 'border-foreground/80 bg-muted/30' : 'border-border/60 bg-background/80',
      )}
      aria-hidden
    >
      <div className={cn('mb-2 h-2 w-1/2', neu ? 'border-2 border-foreground bg-primary' : 'rounded-full bg-[var(--portfolio-accent,#0071e3)]')} />
      <div className={cn('mb-3 h-1.5 w-3/4 rounded-full bg-muted-foreground/25')} />
      <div className="flex gap-2">
        <div
          className={cn(
            'h-6 w-14',
            neu
              ? 'border-2 border-foreground bg-card shadow-[2px_2px_0_0_hsl(var(--foreground))]'
              : 'rounded-full bg-[var(--portfolio-accent,#0071e3)]/90',
          )}
        />
        <div
          className={cn(
            'h-6 w-14',
            neu ? 'border-2 border-foreground bg-muted/50' : 'rounded-full border border-border bg-muted/40',
          )}
        />
      </div>
      <div
        className={cn(
          'mt-3 h-10',
          neu
            ? 'border-4 border-foreground bg-card shadow-[3px_3px_0_0_hsl(var(--foreground))]'
            : 'rounded-xl border border-border/50 bg-card shadow-sm',
        )}
      />
    </div>
  );
}

export function PortfolioThemePicker({
  value,
  tier,
  saving,
  onSelect,
}: {
  value: string;
  tier: PlanTier;
  saving: boolean;
  onSelect: (theme: Extract<PortfolioTheme, 'classic' | 'neubrutalism'>) => void;
}) {
  const allowed = TIER_LIMITS[tier].themes;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SELECTABLE_THEMES.map((theme) => {
        const enabled = allowed.includes(theme.id);
        const selected = value === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            disabled={!enabled || saving}
            onClick={() => onSelect(theme.id)}
            className={cn(
              'relative flex flex-col rounded-xl border-2 p-4 text-left transition-[border-color,box-shadow,transform] duration-150',
              selected
                ? 'border-primary bg-primary/5 shadow-[4px_4px_0_0_hsl(var(--foreground))] dark:shadow-[4px_4px_0_0_hsl(var(--primary))]'
                : 'border-border bg-card/40 hover:border-border/90 hover:bg-card/60',
              !enabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {selected ? (
              <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" aria-hidden />
              </span>
            ) : null}
            <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-foreground">
              {theme.name}
            </span>
            <p className="mt-2 pr-8 text-sm leading-relaxed text-muted-foreground">{theme.description}</p>
            <ThemePreviewMock variant={theme.id} />
            {!enabled ? (
              <p className="mt-2 text-xs font-medium text-muted-foreground">Available on Pro</p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
