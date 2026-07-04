'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';

import { EDITOR_WIZARD_STEPS } from '@/lib/editor-wizard-steps';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'foliomint-404-best-ms';
const CHIP_SIZE = 88;

type ChipState = {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  collected: boolean;
};

function randomVelocity() {
  const speed = 0.55 + Math.random() * 0.45;
  const angle = Math.random() * Math.PI * 2;
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

function spawnChips(width: number, height: number): ChipState[] {
  const pad = 12;
  return EDITOR_WIZARD_STEPS.map((step) => {
    const { vx, vy } = randomVelocity();
    return {
      id: step.id,
      label: step.title,
      x: pad + Math.random() * Math.max(1, width - CHIP_SIZE - pad * 2),
      y: pad + Math.random() * Math.max(1, height - CHIP_SIZE - pad * 2),
      vx,
      vy,
      collected: false,
    };
  });
}

function formatSeconds(ms: number) {
  return (ms / 1000).toFixed(1);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

export function ProofScrambleGame() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [chips, setChips] = useState<ChipState[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [bestMs, setBestMs] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const collectedCount = chips.filter((chip) => chip.collected).length;
  const total = EDITOR_WIZARD_STEPS.length;
  const won = chips.length > 0 && collectedCount === total;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = Number.parseInt(raw, 10);
        if (Number.isFinite(parsed)) setBestMs(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const initGame = useCallback(() => {
    const rect = arenaRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 320;
    const height = rect?.height ?? 280;
    setChips(spawnChips(width, height));
    setStartedAt(Date.now());
    setElapsedMs(null);
    setIsNewBest(false);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => initGame());
    return () => cancelAnimationFrame(frame);
  }, [initGame]);

  useEffect(() => {
    if (reducedMotion || won || chips.length === 0) return;

    let frame = 0;
    const tick = () => {
      const rect = arenaRef.current?.getBoundingClientRect();
      if (!rect) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const maxX = rect.width - CHIP_SIZE;
      const maxY = rect.height - CHIP_SIZE;

      setChips((prev) =>
        prev.map((chip) => {
          if (chip.collected) return chip;

          let { x, y, vx, vy } = chip;
          x += vx;
          y += vy;

          if (x <= 0) {
            x = 0;
            vx = Math.abs(vx);
          } else if (x >= maxX) {
            x = maxX;
            vx = -Math.abs(vx);
          }

          if (y <= 0) {
            y = 0;
            vy = Math.abs(vy);
          } else if (y >= maxY) {
            y = maxY;
            vy = -Math.abs(vy);
          }

          return { ...chip, x, y, vx, vy };
        }),
      );

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [chips.length, reducedMotion, won]);

  useEffect(() => {
    if (!won || !startedAt) return;

    const ms = Date.now() - startedAt;
    setElapsedMs(ms);

    setBestMs((prev) => {
      const newBest = prev === null || ms < prev;
      setIsNewBest(newBest);
      if (newBest) {
        try {
          localStorage.setItem(STORAGE_KEY, String(ms));
        } catch {
          /* ignore */
        }
        return ms;
      }
      return prev;
    });
  }, [won, startedAt]);

  const collectChip = (id: string) => {
    if (won) return;
    setChips((prev) =>
      prev.map((chip) => (chip.id === id ? { ...chip, collected: true } : chip)),
    );
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Mini-game · Proof scramble
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {reducedMotion
              ? 'Tap each wizard section to remint this broken page.'
              : 'Catch every bouncing section before it escapes the editor.'}
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-wider">
          <span className="rounded-md border-2 border-foreground bg-card px-2.5 py-1 shadow-[3px_3px_0_0_hsl(var(--foreground))] dark:shadow-[3px_3px_0_0_hsl(var(--primary))]">
            {collectedCount}/{total}
          </span>
          {bestMs !== null && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" aria-hidden />
              {formatSeconds(bestMs)}s
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {EDITOR_WIZARD_STEPS.map((step) => {
          const done = chips.find((chip) => chip.id === step.id)?.collected;
          return (
            <span
              key={step.id}
              className={cn(
                'rounded-full border-2 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors',
                done
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/80 bg-muted/40 text-muted-foreground',
              )}
            >
              {step.title}
            </span>
          );
        })}
      </div>

      <div
        ref={arenaRef}
        className={cn(
          'relative h-[min(52vw,280px)] min-h-[220px] overflow-hidden rounded-xl border-4 border-foreground bg-card/80',
          'shadow-[8px_8px_0_0_hsl(var(--foreground))] dark:shadow-[8px_8px_0_0_hsl(var(--primary))]',
        )}
        aria-label="Proof scramble game arena"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          aria-hidden
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {reducedMotion ? (
          <div className="grid h-full grid-cols-2 gap-3 p-4 sm:grid-cols-3">
            {chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                disabled={chip.collected}
                onClick={() => collectChip(chip.id)}
                className={cn(
                  'rounded-lg border-2 border-foreground px-2 py-3 text-xs font-bold shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-transform',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'dark:shadow-[4px_4px_0_0_hsl(var(--primary))]',
                  chip.collected
                    ? 'translate-x-0.5 translate-y-0.5 bg-primary text-primary-foreground shadow-none'
                    : 'bg-background hover:-translate-x-0.5 hover:-translate-y-0.5',
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        ) : (
          chips.map((chip) =>
            chip.collected ? null : (
              <button
                key={chip.id}
                type="button"
                onClick={() => collectChip(chip.id)}
                className={cn(
                  'absolute left-0 top-0 flex h-[88px] w-[88px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-foreground',
                  'bg-background px-1 text-center text-[11px] font-bold leading-tight',
                  'shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-shadow will-change-transform',
                  'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'dark:shadow-[4px_4px_0_0_hsl(var(--primary))]',
                )}
                style={{ transform: `translate3d(${chip.x}px, ${chip.y}px, 0)` }}
                aria-label={`Collect ${chip.label} section`}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                {chip.label}
              </button>
            ),
          )
        )}

        <AnimatePresence>
          {won && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 p-6 text-center backdrop-blur-sm"
            >
              <p className="font-display text-2xl font-bold tracking-tight">Proof reminted!</p>
              <p className="text-sm text-muted-foreground">
                {elapsedMs !== null
                  ? `You rebuilt the page in ${formatSeconds(elapsedMs)}s.`
                  : 'Every section back in place.'}
                {isNewBest ? ' New personal best.' : ''}
              </p>
              <button
                type="button"
                onClick={initGame}
                className="mt-2 font-mono text-xs font-bold uppercase tracking-wider text-primary underline-offset-4 hover:underline"
              >
                Play again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
