import type { EditorPageState } from '@/types/editor-page';
import type { PortfolioThemeColors } from '@/lib/portfolio-theme-colors';

const LOOK_KEYS = new Set<keyof EditorPageState>([
  'theme',
  'accentColor',
  'themeColors',
]);

export function isLookUpdate(updates?: Partial<EditorPageState>): boolean {
  if (!updates) return false;
  return Object.keys(updates).every((k) => LOOK_KEYS.has(k as keyof EditorPageState));
}

/** Build PATCH body — only include fields being updated when `updates` is set. */
export function buildPortfolioSavePayload(
  next: EditorPageState,
  updates?: Partial<EditorPageState>,
): Record<string, unknown> {
  const partial = updates !== undefined;

  if (!partial) {
    return {
      title: next.title,
      theme: next.theme,
      accentColor: next.accentColor,
      themeColors: next.themeColors,
      isPublished: next.isPublished,
      content: next.content,
      publicHandle: next.publicHandle,
    };
  }

  const payload: Record<string, unknown> = {};
  if ('title' in updates) payload.title = next.title;
  if ('theme' in updates) payload.theme = next.theme;
  if ('accentColor' in updates) payload.accentColor = next.accentColor;
  if ('themeColors' in updates) payload.themeColors = next.themeColors;
  if ('isPublished' in updates) payload.isPublished = next.isPublished;
  if ('content' in updates) payload.content = next.content;
  if ('publicHandle' in updates) payload.publicHandle = next.publicHandle;
  return payload;
}

export type { PortfolioThemeColors };
