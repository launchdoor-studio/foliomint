import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

/** Classic editorial stack: mono headings + sans body (MaskedSyntax-style). */
export const PORTFOLIO_CLASSIC_BODY_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

export function portfolioClassicPageWrapClass(narrowLayout?: boolean): string {
  return cn(
    'mx-auto max-w-2xl px-5 pb-20 sm:px-6',
    narrowLayout ? 'pb-12 pt-2' : 'pb-24 pt-6 sm:pt-10',
  );
}

/** Top bar — brand left, nav + theme right, hairline divider. */
export function portfolioClassicHeaderClass(): string {
  return cn(
    'mb-10 flex items-center justify-between gap-4 border-b border-[var(--portfolio-border)] pb-4',
  );
}

export function portfolioClassicBrandClass(): string {
  return 'min-w-0 truncate font-mono text-sm font-bold text-[var(--portfolio-fg)]';
}

export function portfolioClassicNavLinkClass(): string {
  return cn(
    'font-mono text-sm text-[var(--portfolio-fg-muted)] no-underline transition-colors hover:text-[var(--portfolio-fg)]',
  );
}

/** Minimal theme toggle — thin border, no shadow. */
export function portfolioClassicThemeToggleClass(): string {
  return cn(
    'inline-flex size-8 shrink-0 items-center justify-center rounded-md',
    'border border-[var(--portfolio-border)] bg-transparent p-0',
    'text-[var(--portfolio-fg-muted)] transition-colors hover:text-[var(--portfolio-fg)]',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--portfolio-border)]',
  );
}

/** Square avatar with slight rounding (reference style). */
export function portfolioClassicAvatarClass(size: 'sm' | 'md' = 'md'): string {
  return cn(
    size === 'sm' ? 'size-12' : 'size-14 sm:size-16',
    'shrink-0 rounded-md border border-[var(--portfolio-border)] object-cover',
  );
}

export function portfolioClassicHeroNameClass(): string {
  return 'font-mono text-2xl font-bold tracking-tight text-[var(--portfolio-fg)] sm:text-[1.75rem]';
}

export function portfolioClassicHeroSubtitleClass(): string {
  return 'text-[15px] text-[var(--portfolio-fg-muted)]';
}

export function portfolioClassicBodyClass(): string {
  return 'text-[15px] leading-[1.75] text-[var(--portfolio-fg-muted)] [font-family:var(--classic-body-font)]';
}

/** Headline / pull-quote with accent rail. */
export function portfolioClassicCalloutClass(): string {
  return cn(
    'border-l-2 border-[var(--portfolio-accent)] pl-4',
    'text-[15px] leading-[1.75] text-[var(--portfolio-fg-muted)] [font-family:var(--classic-body-font)]',
  );
}

export function portfolioClassicSectionHeadingClass(): string {
  return 'font-mono text-base font-bold text-[var(--portfolio-fg)] sm:text-lg';
}

export function portfolioClassicSectionDescClass(): string {
  return 'mt-1.5 text-sm leading-relaxed text-[var(--portfolio-fg-muted)] [font-family:var(--classic-body-font)]';
}

/** Bordered project / content card. */
export function portfolioClassicCardClass(): string {
  return cn(
    'flex h-full flex-col rounded-lg border border-[var(--portfolio-border)] bg-[var(--portfolio-bg)] p-5',
    'transition-colors hover:border-[color-mix(in_srgb,var(--portfolio-fg)_22%,var(--portfolio-border))]',
  );
}

export function portfolioClassicCardTitleClass(): string {
  return 'font-mono text-sm font-bold text-[var(--portfolio-fg)]';
}

export function portfolioClassicTagClass(): string {
  return cn(
    'inline-flex rounded-full bg-[color-mix(in_srgb,var(--portfolio-fg)_7%,var(--portfolio-bg))]',
    'px-2.5 py-0.5 font-mono text-[11px] leading-none text-[var(--portfolio-fg-muted)]',
  );
}

export function portfolioClassicTextLinkClass(): string {
  return cn(
    'mt-auto inline-flex items-center gap-1 pt-4 font-mono text-xs text-[var(--portfolio-fg-muted)]',
    'no-underline transition-colors hover:text-[var(--portfolio-fg)]',
  );
}

/** Social / profile icon — monochrome, no border. */
export function portfolioClassicIconButtonClass(): string {
  return cn(
    'inline-flex size-8 items-center justify-center rounded-md',
    'text-[var(--portfolio-fg-muted)] no-underline transition-colors hover:text-[var(--portfolio-fg)]',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--portfolio-border)]',
  );
}

/** Legacy aliases used by portfolio-public-ui blog surfaces. */
export function portfolioClassicPrimaryPillClass(): string {
  return portfolioClassicNavLinkClass();
}

export function portfolioClassicSecondaryPillClass(): string {
  return cn(
    'inline-flex items-center justify-center rounded-md border border-[var(--portfolio-border)]',
    'px-4 py-2 font-mono text-xs text-[var(--portfolio-fg)] no-underline',
    'transition-colors hover:border-[color-mix(in_srgb,var(--portfolio-fg)_30%,var(--portfolio-border))]',
  );
}

export function portfolioClassicEyebrowClass(): string {
  return 'font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--portfolio-fg-muted)]';
}

export function portfolioClassicSectionTitleClass(): string {
  return portfolioClassicSectionHeadingClass();
}

export function portfolioClassicChipClass(): string {
  return portfolioClassicTagClass();
}

export function portfolioClassicBulletClass(): string {
  return cn(
    'flex gap-3 text-[15px] leading-[1.7] text-[var(--portfolio-fg-muted)] [font-family:var(--classic-body-font)]',
  );
}

export function portfolioClassicBulletDotClass(): string {
  return 'mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[var(--portfolio-fg-muted)]';
}

/** @deprecated Classic uses square avatars. */
export function portfolioClassicAvatarFrameClass(size: 'sm' | 'md' | 'lg' = 'md'): string {
  return portfolioClassicAvatarClass(size === 'lg' ? 'md' : size === 'sm' ? 'sm' : 'md');
}

export function portfolioClassicSurfaceClass(): string {
  return portfolioClassicCardClass();
}

export function portfolioClassicSkillCellClass(): string {
  return portfolioClassicTagClass();
}

export function portfolioClassicAwardRowClass(): string {
  return 'border-b border-[var(--portfolio-border)] py-3 last:border-b-0 [font-family:var(--classic-body-font)] text-[15px] text-[var(--portfolio-fg-muted)]';
}

export function portfolioClassicListPrimaryClass(): string {
  return 'font-mono text-[13px] font-semibold text-[var(--portfolio-fg)]';
}

export function portfolioClassicListSecondaryClass(): string {
  return 'text-[14px] leading-relaxed text-[var(--portfolio-fg-muted)] [font-family:var(--classic-body-font)]';
}

export function portfolioClassicNavBarClass(): string {
  return portfolioClassicHeaderClass();
}

export function portfolioClassicHeroTitleClass(): string {
  return portfolioClassicHeroNameClass();
}

export function portfolioClassicHeroSubheadClass(): string {
  return portfolioClassicHeroSubtitleClass();
}

/** Inline style hook for sans body copy inside mono shell. */
export function portfolioClassicBodyFontStyle(): CSSProperties {
  return { ['--classic-body-font' as string]: PORTFOLIO_CLASSIC_BODY_FONT };
}
