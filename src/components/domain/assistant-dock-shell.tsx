'use client';

import { useEffect, type ReactNode } from 'react';

import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  ASSISTANT_DOCK_WIDTH,
  assistantDockSurfaceClass,
  assistantDockTopClass,
} from '@/lib/assistant-dock';
import { cn } from '@/lib/utils';

export function AssistantDockShell({
  id,
  open,
  onClose,
  chrome,
  edgeTab,
  header,
  footer,
  children,
  mobileBackdropLabel,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  chrome: 'app' | 'editor';
  edgeTab?: ReactNode;
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  mobileBackdropLabel: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          aria-label={mobileBackdropLabel}
          onClick={onClose}
        />
      )}

      {!open && edgeTab}

      <aside
        id={id}
        aria-hidden={!open}
        className={cn(
          'fixed bottom-0 right-0 z-40 flex flex-col border-l shadow-2xl transition-transform duration-300 ease-out',
          assistantDockSurfaceClass,
          assistantDockTopClass(chrome),
          'max-lg:max-h-[min(72vh,640px)] max-lg:rounded-t-2xl max-lg:border-l-0 max-lg:border-t lg:rounded-none',
          open ? 'translate-x-0 translate-y-0' : 'translate-x-full max-lg:translate-y-full',
        )}
        style={{ width: ASSISTANT_DOCK_WIDTH }}
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-foreground/10 px-4 py-3 dark:border-white/10">
          {header}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-foreground/10 px-4 py-3 dark:border-white/10">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

export function AssistantDockHideButton({ onClose }: { onClose: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Hide panel">
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}
