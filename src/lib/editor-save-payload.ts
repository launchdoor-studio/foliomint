import type { EditorPageState } from '@/types/editor-page';

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
      isPublished: next.isPublished,
      content: next.content,
      publicHandle: next.publicHandle,
    };
  }

  const payload: Record<string, unknown> = {};
  if ('title' in updates) payload.title = next.title;
  if ('theme' in updates) payload.theme = next.theme;
  if ('accentColor' in updates) payload.accentColor = next.accentColor;
  if ('isPublished' in updates) payload.isPublished = next.isPublished;
  if ('content' in updates) payload.content = next.content;
  if ('publicHandle' in updates) payload.publicHandle = next.publicHandle;
  return payload;
}
