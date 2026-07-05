'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GripHorizontal } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'foliomint-editor-preview-height';
const MIN_HEIGHT = 260;
const DEFAULT_HEIGHT = 480;
const ABSOLUTE_MAX_HEIGHT = 900;

function clampHeight(value: number, maxHeight: number) {
  return Math.min(Math.max(value, MIN_HEIGHT), maxHeight);
}

function readStoredHeight(): number | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function EditorLivePreviewPanel({
  stepKey,
  themeLabel,
  cardClassName,
  titleClassName,
  children,
}: {
  stepKey: string | number;
  themeLabel: string;
  cardClassName?: string;
  titleClassName?: string;
  children: ReactNode;
}) {
  const [maxHeight, setMaxHeight] = useState(ABSOLUTE_MAX_HEIGHT);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const syncMaxHeight = useCallback(() => {
    const nextMax = Math.min(ABSOLUTE_MAX_HEIGHT, window.innerHeight - 128);
    setMaxHeight(nextMax);
    setHeight((current) => clampHeight(current, nextMax));
  }, []);

  useEffect(() => {
    syncMaxHeight();
    const stored = readStoredHeight();
    if (stored !== null) {
      setHeight(clampHeight(stored, Math.min(ABSOLUTE_MAX_HEIGHT, window.innerHeight - 128)));
    }
    window.addEventListener('resize', syncMaxHeight);
    return () => window.removeEventListener('resize', syncMaxHeight);
  }, [syncMaxHeight]);

  const persistHeight = useCallback((next: number) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* ignore */
    }
  }, []);

  const onResizePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    dragRef.current = { startY: event.clientY, startHeight: height };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onResizePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    const delta = event.clientY - dragRef.current.startY;
    const next = clampHeight(dragRef.current.startHeight + delta, maxHeight);
    setHeight(next);
  };

  const finishResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setHeight((current) => {
      persistHeight(current);
      return current;
    });
  };

  return (
    <Card
      className={cn('flex flex-col overflow-hidden', cardClassName)}
      style={{ height: `${height}px` }}
    >
      <CardHeader className="shrink-0 space-y-1 border-b border-border/60 bg-background/80 pb-4">
        <CardTitle className={titleClassName}>Live preview</CardTitle>
        <p className="font-sans text-xs text-muted-foreground">
          Updates as you type. Theme: {themeLabel} — drag the handle below to resize.
        </p>
      </CardHeader>

      <CardContent className="relative min-h-0 flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepKey}
            initial={{ opacity: 0.72, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.5, y: -4 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </CardContent>

      <button
        type="button"
        aria-label="Drag to resize live preview height"
        className="flex h-4 shrink-0 cursor-ns-resize items-center justify-center border-t border-border/60 bg-muted/30 touch-none hover:bg-muted/60"
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={finishResize}
        onPointerCancel={finishResize}
      >
        <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      </button>
    </Card>
  );
}
