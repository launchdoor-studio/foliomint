'use client';

import { useEffect, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Neubrutalist floating panel — matches Mint assistant positioning (bottom-right, above launcher). */
export const floatingPanelChromeClass =
  'rounded-2xl border-2 border-foreground bg-background/95 shadow-[8px_8px_0_0_hsl(var(--foreground))] backdrop-blur-lg dark:shadow-[8px_8px_0_0_hsl(var(--primary))]';

export function FloatingAssistantPanel({
  id,
  open,
  onClose,
  header,
  footer,
  children,
  backdropLabel = 'Close panel',
  widthClass = 'w-full max-w-md',
  heightClass = 'h-[min(560px,calc(100vh-7rem))]',
  zIndexClass = 'z-50',
  panelClassName,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  backdropLabel?: string;
  widthClass?: string;
  heightClass?: string;
  zIndexClass?: string;
  panelClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 flex items-end justify-end p-4 pb-24 sm:p-6 sm:pb-28',
        zIndexClass,
      )}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/30 lg:bg-black/15"
        aria-label={backdropLabel}
        onClick={onClose}
      />
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative flex flex-col overflow-hidden',
          floatingPanelChromeClass,
          widthClass,
          heightClass,
          panelClassName,
        )}
      >
        <header className="flex shrink-0 items-center gap-3 border-b-2 border-foreground/15 px-4 py-3">
          {header}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {footer && (
          <footer className="shrink-0 border-t-2 border-foreground/15 px-4 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
