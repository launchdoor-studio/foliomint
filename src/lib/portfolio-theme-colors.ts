import type { CSSProperties } from 'react';

import { sanitizePortfolioAccentForStorage, normalizePortfolioAccent } from '@/lib/portfolio-accent';

/** User-configurable canvas colors (stored in portfolios.theme_settings.colors). */
export interface PortfolioThemeColors {
  lightBackground: string | null;
  lightForeground: string | null;
  darkBackground: string | null;
  darkForeground: string | null;
}

export type ResolvedPortfolioThemeColors = {
  lightBackground: string;
  lightForeground: string;
  darkBackground: string;
  darkForeground: string;
};

export const DEFAULT_PORTFOLIO_THEME_COLORS: ResolvedPortfolioThemeColors = {
  lightBackground: '#ffffff',
  lightForeground: '#171717',
  darkBackground: '#0a0a0a',
  darkForeground: '#ededed',
};

export const EMPTY_PORTFOLIO_THEME_COLORS: PortfolioThemeColors = {
  lightBackground: null,
  lightForeground: null,
  darkBackground: null,
  darkForeground: null,
};

export type PortfolioThemeSettings = {
  palette?: string;
  fontPair?: string;
  density?: 'compact' | 'comfortable' | 'spacious';
  borderStyle?: 'soft' | 'bold' | 'poster';
  heroStyle?: 'stacked' | 'split' | 'editorial' | 'cards';
  colors?: Partial<PortfolioThemeColors> | null;
};

function sanitizeHex(input: unknown): string | null {
  return sanitizePortfolioAccentForStorage(input);
}

export function sanitizePortfolioThemeColors(
  input: unknown,
): PortfolioThemeColors | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== 'object') return null;

  const raw = input as Record<string, unknown>;
  const keys = [
    'lightBackground',
    'lightForeground',
    'darkBackground',
    'darkForeground',
  ] as const;

  const next: PortfolioThemeColors = { ...EMPTY_PORTFOLIO_THEME_COLORS };
  let anySet = false;

  for (const key of keys) {
    if (!(key in raw)) continue;
    const value = raw[key];
    if (value === null) {
      next[key] = null;
      anySet = true;
      continue;
    }
    const sanitized = sanitizeHex(value);
    if (value !== null && value !== undefined && value !== '' && sanitized === null) {
      return null;
    }
    next[key] = sanitized;
    anySet = true;
  }

  return anySet ? next : null;
}

export function extractPortfolioThemeColors(
  settings: PortfolioThemeSettings | null | undefined,
): PortfolioThemeColors {
  const colors = settings?.colors;
  if (!colors || typeof colors !== 'object') {
    return { ...EMPTY_PORTFOLIO_THEME_COLORS };
  }
  return {
    lightBackground: sanitizeHex(colors.lightBackground),
    lightForeground: sanitizeHex(colors.lightForeground),
    darkBackground: sanitizeHex(colors.darkBackground),
    darkForeground: sanitizeHex(colors.darkForeground),
  };
}

export function resolvePortfolioThemeColors(
  colors: PortfolioThemeColors | null | undefined,
): ResolvedPortfolioThemeColors {
  const c = colors ?? EMPTY_PORTFOLIO_THEME_COLORS;
  return {
    lightBackground: normalizePortfolioAccent(
      c.lightBackground ?? DEFAULT_PORTFOLIO_THEME_COLORS.lightBackground,
    ),
    lightForeground: normalizePortfolioAccent(
      c.lightForeground ?? DEFAULT_PORTFOLIO_THEME_COLORS.lightForeground,
    ),
    darkBackground: normalizePortfolioAccent(
      c.darkBackground ?? DEFAULT_PORTFOLIO_THEME_COLORS.darkBackground,
    ),
    darkForeground: normalizePortfolioAccent(
      c.darkForeground ?? DEFAULT_PORTFOLIO_THEME_COLORS.darkForeground,
    ),
  };
}

export function mergeThemeSettingsColors(
  existing: PortfolioThemeSettings | null | undefined,
  colors: PortfolioThemeColors,
): PortfolioThemeSettings {
  return {
    ...(existing ?? {}),
    colors: { ...colors },
  };
}

/** Inline CSS variables for PortfolioPublicShell. */
export function portfolioThemeColorsStyle(
  colors: PortfolioThemeColors | null | undefined,
  accentColor?: string | null,
): CSSProperties {
  const resolved = resolvePortfolioThemeColors(colors);
  const accent = normalizePortfolioAccent(accentColor);
  return {
    '--portfolio-accent': accent,
    '--portfolio-bg-light': resolved.lightBackground,
    '--portfolio-fg-light': resolved.lightForeground,
    '--portfolio-bg-dark': resolved.darkBackground,
    '--portfolio-fg-dark': resolved.darkForeground,
  } as React.CSSProperties;
}
