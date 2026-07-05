/** Shared width for Mint + resume health side panels */
export const ASSISTANT_DOCK_WIDTH = '22rem';

export const assistantDockMarginClass = 'lg:mr-[22rem]';

/** Matches navbar: sticky top-0 h-16 */
export const NAVBAR_HEIGHT_CLASS = '4rem';

export function assistantDockTopClass(chrome: 'app' | 'editor'): string {
  if (chrome === 'editor') {
    return 'lg:top-[calc(4rem+var(--editor-toolbar-height,3.5rem))]';
  }
  return 'lg:top-16';
}

/** Visual chrome aligned with navbar + editor toolbar */
export const assistantDockSurfaceClass =
  'border-foreground/15 bg-background/95 backdrop-blur-lg';

export const assistantDockEdgeTabClass =
  'rounded-l-xl border border-r-0 border-border bg-background/95 shadow-lg backdrop-blur-lg transition-colors hover:bg-muted';
