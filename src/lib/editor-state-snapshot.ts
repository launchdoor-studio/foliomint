import type { EditorPageState } from '@/types/editor-page';

/**
 * Stable JSON snapshot for dirty detection (matches persisted PATCH fields).
 *
 * Save model (UX-501): users explicitly Save or Publish the full portfolio; the theme
 * dropdown saves immediately so visitors see the right style. Dirty detection compares
 * the current editor state to the last successful PATCH snapshot—see editor toolbar status.
 */
export function serializeEditorPageState(s: EditorPageState): string {
  return JSON.stringify({
    slug: s.slug,
    publicHandle: s.publicHandle,
    title: s.title,
    theme: s.theme,
    accentColor: s.accentColor,
    themeColors: s.themeColors,
    isPublished: s.isPublished,
    content: s.content,
  });
}
