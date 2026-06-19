const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Default accent when none is stored (emerald). */
export const DEFAULT_PORTFOLIO_ACCENT = '#34d399';

export function normalizePortfolioAccent(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return DEFAULT_PORTFOLIO_ACCENT;
  const t = input.trim();
  if (!HEX.test(t)) return DEFAULT_PORTFOLIO_ACCENT;
  if (t.length === 4) {
    const r = t[1];
    const g = t[2];
    const b = t[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return t.toLowerCase();
}

export function sanitizePortfolioAccentForStorage(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== 'string') return null;
  const t = input.trim();
  if (t === '') return null;
  if (!HEX.test(t)) return null;
  return normalizePortfolioAccent(t);
}
