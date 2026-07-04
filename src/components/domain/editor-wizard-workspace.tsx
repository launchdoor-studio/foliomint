'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EDITOR_WIZARD_STEP_COUNT, EDITOR_WIZARD_STEPS } from '@/lib/editor-wizard-steps';
import { cn } from '@/lib/utils';

export { EDITOR_WIZARD_STEP_COUNT, EDITOR_WIZARD_STEPS } from '@/lib/editor-wizard-steps';

export function EditorWizardWorkspace({
  stepIndex,
  onStepIndexChange,
  children,
  preview,
  footerError,
  onSavePortfolio,
  savePending,
}: {
  stepIndex: number;
  onStepIndexChange: (next: number) => void;
  children: ReactNode;
  preview: ReactNode;
  footerError?: string | null;
  onSavePortfolio: () => void;
  savePending: boolean;
}) {
  const total = EDITOR_WIZARD_STEP_COUNT;
  const safeIndex = Math.min(Math.max(0, stepIndex), total - 1);
  const meta = EDITOR_WIZARD_STEPS[safeIndex];

  const goPrev = () => onStepIndexChange(Math.max(0, safeIndex - 1));
  const goNext = () => onStepIndexChange(Math.min(total - 1, safeIndex + 1));

  const progress = ((safeIndex + 1) / total) * 100;

  return (
    <div className="editor-workspace mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Full-width step chrome so the two-column row below aligns form + preview tops */}
      <header className="mb-8 space-y-5">
        <div className="space-y-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {EDITOR_WIZARD_STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                title={s.title}
                onClick={() => onStepIndexChange(i)}
                className={cn(
                  'min-h-9 min-w-9 rounded-full border px-2.5 text-xs font-semibold transition-all',
                  i === safeIndex
                    ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : i < safeIndex
                      ? 'border-primary/35 bg-primary/8 text-primary hover:bg-primary/12'
                      : 'border-border/80 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50',
                )}
                aria-current={i === safeIndex ? 'step' : undefined}
                aria-label={`${s.title}, step ${i + 1} of ${total}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Step {safeIndex + 1} of {total}
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {meta.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{meta.description}</p>
        </div>
      </header>

      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-x-12 lg:gap-y-0">
        <div className="order-1 flex min-w-0 flex-col gap-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={safeIndex}
              role="tabpanel"
              id={`editor-wizard-panel-${safeIndex}`}
              aria-label={meta.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0"
            >
              {children}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-4 border-t border-border/60 pt-6 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goPrev}
                disabled={safeIndex === 0}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              {safeIndex < total - 1 ? (
                <Button type="button" size="sm" onClick={goNext} className="gap-1.5">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={onSavePortfolio}
                  disabled={savePending}
                  className="gap-1.5"
                >
                  {savePending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save portfolio
                    </>
                  )}
                </Button>
              )}
            </div>
            {footerError ? <p className="text-sm text-destructive">{footerError}</p> : null}
          </div>
        </div>

        <div className="order-2 min-w-0 self-start lg:sticky lg:top-32">{preview}</div>
      </div>
    </div>
  );
}
