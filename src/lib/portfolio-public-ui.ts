import {
  portfolioClassicCardClass,
  portfolioClassicChipClass,
  portfolioClassicEyebrowClass,
  portfolioClassicIconButtonClass,
  portfolioClassicNavLinkClass,
  portfolioClassicPrimaryPillClass,
  portfolioClassicSecondaryPillClass,
  portfolioClassicSectionTitleClass,
  portfolioClassicTextLinkClass,
} from '@/lib/portfolio-classic-ui';
import { cn } from '@/lib/utils';

/** Inner page wrapper: follows shell theme (light / dark). */
export function portfolioShellClass(_neu: boolean): string {
  return 'relative min-h-full text-[var(--portfolio-fg)]';
}

/**
 * Main column: same width + horizontal padding on portfolio + blog index.
 * Blog post uses the same outer padding; inner prose width is constrained separately.
 */
export function portfolioContentContainerClass(): string {
  return 'mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-8 sm:pb-24 sm:pt-10 lg:px-12 lg:pb-28 lg:pt-14';
}

/** Narrow column for long-form reading (blog post body). */
export function portfolioReadingColumnClass(): string {
  return 'mx-auto w-full max-w-3xl';
}

/** Top nav / primary actions: Blog, Back to portfolio, All posts — same everywhere. */
export function portfolioNavPillClass(neu: boolean): string {
  return neu
    ? cn(
        'inline-flex items-center justify-center border-4 px-4 py-2 text-sm font-bold no-underline',
        'border-[var(--portfolio-fg)] bg-[var(--portfolio-surface-elevated)] text-[var(--portfolio-fg)]',
        'shadow-[4px_4px_0_0_var(--portfolio-shadow)]',
        'transition-transform hover:translate-x-px hover:translate-y-px',
      )
    : portfolioClassicNavLinkClass();
}

/** Eyebrow label (Portfolio, Writing, …). */
export function portfolioEyebrowClass(neu: boolean): string {
  return neu
    ? cn('text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--portfolio-accent)]')
    : portfolioClassicEyebrowClass();
}

/** Divider under hero / page intro (portfolio hero + blog headers). */
export function portfolioHeaderRuleClass(neu: boolean): string {
  return cn('border-b border-[var(--portfolio-border)] pb-12 sm:pb-16', neu && 'border-[var(--portfolio-border)]');
}

/** Section titles (Skills, Experience, …). */
export function portfolioSectionTitleRowClass(neu: boolean): string {
  return neu
    ? cn(
        'mb-8 flex items-center gap-3 text-[1.35rem] font-semibold uppercase tracking-[0.12em] text-[var(--portfolio-fg)] sm:text-2xl',
      )
    : cn('mb-8 flex items-center gap-3', portfolioClassicSectionTitleClass());
}

export function portfolioSectionAccentClass(neu: boolean): string {
  return neu
    ? cn(
        'block h-4 w-4 shrink-0 rounded-none border-4 border-[var(--portfolio-fg)] bg-[var(--portfolio-accent)]',
        'shadow-[4px_4px_0_0_var(--portfolio-shadow)]',
      )
    : 'hidden';
}

/** Primary content cards (experience, education, projects, awards, blog list items). */
export function portfolioCardClass(neu: boolean): string {
  return neu
    ? cn(
        'rounded-none border-4 border-[var(--portfolio-fg)] bg-[var(--portfolio-surface-elevated)]/95',
        'shadow-[6px_6px_0_0_var(--portfolio-shadow)]',
      )
    : portfolioClassicCardClass();
}

export const PORTFOLIO_CARD_PAD = 'p-6 sm:p-7';

/** Non-interactive skill chips. */
export function portfolioSkillChipClass(neu: boolean): string {
  return neu
    ? cn(
        'rounded-none border-2 border-[var(--portfolio-fg)] bg-[var(--portfolio-surface-elevated)] px-2 py-0.5',
        'text-xs font-bold leading-none text-[var(--portfolio-fg)] shadow-[3px_3px_0_0_var(--portfolio-shadow)]',
      )
    : portfolioClassicChipClass();
}

/** External text links inside cards (e.g. Open project). */
export function portfolioInlineLinkClass(neu: boolean): string {
  return neu
    ? cn(
        'inline-flex items-center border-2 border-[var(--portfolio-fg)] bg-[var(--portfolio-surface-elevated)] px-3 py-1.5',
        'text-xs font-bold text-[var(--portfolio-fg)] shadow-[3px_3px_0_0_var(--portfolio-shadow)] no-underline',
        'transition-transform hover:translate-x-px hover:translate-y-px',
      )
    : portfolioClassicTextLinkClass();
}

/** Icon-only social / profile link buttons in the hero. */
export function portfolioOutboundIconButtonClass(neu: boolean): string {
  return neu
    ? cn(
        'inline-flex h-10 w-10 items-center justify-center border-4 border-[var(--portfolio-fg)]',
        'bg-[var(--portfolio-surface-elevated)] text-[var(--portfolio-fg)] shadow-[4px_4px_0_0_var(--portfolio-shadow)]',
        'no-underline transition-transform hover:translate-x-px hover:translate-y-px',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portfolio-fg)] focus-visible:ring-offset-2',
      )
    : portfolioClassicIconButtonClass();
}

/** Social / outbound link chips (same family as nav pill, slightly tighter). */
export function portfolioOutboundChipClass(neu: boolean): string {
  return neu
    ? cn(
        'inline-flex items-center justify-center border-4 border-[var(--portfolio-fg)]',
        'bg-[var(--portfolio-surface-elevated)] px-4 py-2 text-sm font-bold text-[var(--portfolio-fg)]',
        'shadow-[4px_4px_0_0_var(--portfolio-shadow)] no-underline transition-transform hover:translate-x-px hover:translate-y-px',
      )
    : portfolioClassicSecondaryPillClass();
}

export function portfolioDateTextClass(): string {
  return 'text-xs font-medium tabular-nums text-[var(--portfolio-fg-muted)]';
}

export function portfolioDateBadgeClass(neu: boolean): string {
  return cn(
    portfolioDateTextClass(),
    neu &&
      cn(
        'border-2 border-[var(--portfolio-fg)] bg-[var(--portfolio-surface-elevated)] px-2 py-1 font-bold text-[var(--portfolio-fg)]',
      ),
    !neu && 'font-mono text-[11px]',
  );
}

/** Bullet list marker line. */
export function portfolioBulletLineClass(neu: boolean): string {
  return cn(
    'flex gap-3 text-sm leading-relaxed text-[var(--portfolio-fg-muted)]',
    neu && 'text-[var(--portfolio-fg)]',
  );
}

export function portfolioBulletDotClass(neu: boolean): string {
  return neu
    ? cn(
        'mt-2.5 h-2 w-2 shrink-0 rounded-none border-2 border-[var(--portfolio-fg)] bg-[var(--portfolio-accent)]',
      )
    : 'mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--portfolio-fg-muted)]';
}

export function portfolioFooterRuleClass(neu: boolean): string {
  return cn(
    'mt-16 flex flex-col gap-3 border-t border-[var(--portfolio-border)] pt-8 sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:pt-10',
    neu && 'border-[var(--portfolio-border)]',
  );
}

/** Space between major sections on the page. */
export const PORTFOLIO_SECTION_GAP = 'mt-12 space-y-16 sm:mt-16 sm:space-y-20 lg:mt-20';

/** Muted body copy on public portfolio pages. */
export function portfolioMutedTextClass(): string {
  return 'text-[var(--portfolio-fg-muted)]';
}

/** Primary headings on public portfolio pages. */
export function portfolioHeadingClass(): string {
  return 'text-[var(--portfolio-fg)]';
}
