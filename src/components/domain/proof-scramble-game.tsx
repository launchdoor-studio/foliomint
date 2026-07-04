'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Skull, Star, Trophy, Zap } from 'lucide-react';

import { EDITOR_WIZARD_STEPS } from '@/lib/editor-wizard-steps';
import { cn } from '@/lib/utils';

const BEST_TIME_KEY = 'foliomint-404-best-ms';
const BEST_SCORE_KEY = 'foliomint-404-best-score';
const CHIP_SIZE = 76;
const DECOY_COUNT = 4;
const COMBO_WINDOW_MS = 2200;
const BASE_SPEED = 0.62;
const SPEED_RAMP = 1.07;
const WRONG_ORDER_PENALTY_MS = 2500;
const DECOY_PENALTY_MS = 1800;

const DECOY_LABELS = ['/dev/null', '404', '???', 'void'] as const;

const SHORT_STEP_LABELS: Record<string, string> = {
  profile: 'Profile',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
  more: 'Awards',
};

type EntityKind = 'section' | 'decoy';

type Entity = {
  id: string;
  kind: EntityKind;
  label: string;
  stepIndex?: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Popup = {
  id: number;
  text: string;
  x: number;
  y: number;
  tone: 'good' | 'bad';
};

type Phase = 'countdown' | 'playing' | 'won';

function randomVelocity(multiplier = 1) {
  const speed = BASE_SPEED * multiplier * (0.85 + Math.random() * 0.35);
  const angle = Math.random() * Math.PI * 2;
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

function randomPoint(width: number, height: number) {
  const pad = 10;
  return {
    x: pad + Math.random() * Math.max(1, width - CHIP_SIZE - pad * 2),
    y: pad + Math.random() * Math.max(1, height - CHIP_SIZE - pad * 2),
  };
}

function spawnEntities(width: number, height: number): Entity[] {
  const sections = EDITOR_WIZARD_STEPS.map((step, stepIndex) => {
    const { vx, vy } = randomVelocity();
    const { x, y } = randomPoint(width, height);
    return {
      id: `section-${step.id}`,
      kind: 'section' as const,
      label: SHORT_STEP_LABELS[step.id] ?? step.title,
      stepIndex,
      x,
      y,
      vx,
      vy,
    };
  });

  const decoys = DECOY_LABELS.map((label, i) => {
    const { vx, vy } = randomVelocity(1.15);
    const { x, y } = randomPoint(width, height);
    return {
      id: `decoy-${i}`,
      kind: 'decoy' as const,
      label,
      x,
      y,
      vx,
      vy,
    };
  });

  return [...sections, ...decoys];
}

function formatSeconds(ms: number) {
  return (ms / 1000).toFixed(1);
}

function starCount(score: number, decoyHits: number, wrongOrderHits: number, maxCombo: number) {
  if (decoyHits === 0 && wrongOrderHits === 0 && maxCombo >= 4) return 3;
  if (decoyHits <= 1 && wrongOrderHits <= 1) return 2;
  return 1;
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
  const popupIdRef = useRef(0);
  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [nextStepIndex, setNextStepIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [penaltyMs, setPenaltyMs] = useState(0);
  const [decoyHits, setDecoyHits] = useState(0);
  const [wrongOrderHits, setWrongOrderHits] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [lastCatchAt, setLastCatchAt] = useState<number | null>(null);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [shake, setShake] = useState(false);
  const [bestMs, setBestMs] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [isNewBestTime, setIsNewBestTime] = useState(false);
  const [isNewBestScore, setIsNewBestScore] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [clockTick, setClockTick] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const totalSteps = EDITOR_WIZARD_STEPS.length;
  const won = nextStepIndex >= totalSteps;
  const targetStep = EDITOR_WIZARD_STEPS[nextStepIndex];
  const displayMs = useMemo(
    () =>
      startedAt && phase === 'playing'
        ? Date.now() - startedAt + penaltyMs
        : elapsedMs ?? 0,
    [startedAt, phase, penaltyMs, elapsedMs, clockTick],
  );

  useEffect(() => {
    try {
      const timeRaw = localStorage.getItem(BEST_TIME_KEY);
      const scoreRaw = localStorage.getItem(BEST_SCORE_KEY);
      if (timeRaw) {
        const parsed = Number.parseInt(timeRaw, 10);
        if (Number.isFinite(parsed)) setBestMs(parsed);
      }
      if (scoreRaw) {
        const parsed = Number.parseInt(scoreRaw, 10);
        if (Number.isFinite(parsed)) setBestScore(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => setClockTick((t) => t + 1), 100);
    return () => window.clearInterval(id);
  }, [phase]);

  const addPopup = useCallback((text: string, x: number, y: number, tone: Popup['tone']) => {
    const id = ++popupIdRef.current;
    setPopups((prev) => [...prev, { id, text, x, y, tone }]);
    window.setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 900);
  }, []);

  const bumpShake = useCallback(() => {
    setShake(true);
    window.setTimeout(() => setShake(false), 320);
  }, []);

  const initGame = useCallback(() => {
    const rect = arenaRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 320;
    const height = rect?.height ?? 300;
    setEntities(spawnEntities(width, height));
    setPhase('countdown');
    setCountdown(3);
    setNextStepIndex(0);
    setCombo(0);
    setMaxCombo(0);
    setScore(0);
    setPenaltyMs(0);
    setDecoyHits(0);
    setWrongOrderHits(0);
    setSpeedMultiplier(1);
    setStartedAt(null);
    setLastCatchAt(null);
    setPopups([]);
    setElapsedMs(null);
    setIsNewBestTime(false);
    setIsNewBestScore(false);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => initGame());
    return () => cancelAnimationFrame(frame);
  }, [initGame]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('playing');
      setStartedAt(Date.now());
      return;
    }
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => window.clearTimeout(timer);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'playing' || won || reducedMotion || entities.length === 0) return;

    let frame = 0;
    const tick = () => {
      const rect = arenaRef.current?.getBoundingClientRect();
      if (!rect) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const maxX = rect.width - CHIP_SIZE;
      const maxY = rect.height - CHIP_SIZE;

      setEntities((prev) =>
        prev.map((entity) => {
          let { x, y, vx, vy } = entity;
          x += vx * speedMultiplier;
          y += vy * speedMultiplier;

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

          return { ...entity, x, y, vx, vy };
        }),
      );

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [entities.length, phase, reducedMotion, speedMultiplier, won]);

  useEffect(() => {
    if (!won || !startedAt) return;

    const ms = Date.now() - startedAt + penaltyMs;
    setElapsedMs(ms);
    setPhase('won');

    setBestMs((prev) => {
      const newBest = prev === null || ms < prev;
      setIsNewBestTime(newBest);
      if (newBest) {
        try {
          localStorage.setItem(BEST_TIME_KEY, String(ms));
        } catch {
          /* ignore */
        }
        return ms;
      }
      return prev;
    });

    setBestScore((prev) => {
      const newBest = prev === null || score > prev;
      setIsNewBestScore(newBest);
      if (newBest) {
        try {
          localStorage.setItem(BEST_SCORE_KEY, String(score));
        } catch {
          /* ignore */
        }
        return score;
      }
      return prev;
    });
  }, [won, startedAt, penaltyMs, score]);

  const nudgeEntity = (id: string) => {
    setEntities((prev) =>
      prev.map((entity) => {
        if (entity.id !== id) return entity;
        const kick = randomVelocity(1.6);
        return { ...entity, ...kick };
      }),
    );
  };

  const respawnDecoy = (id: string) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 320;
    const height = rect?.height ?? 300;
    const point = randomPoint(width, height);
    const vel = randomVelocity(1.25);
    setEntities((prev) =>
      prev.map((entity) =>
        entity.id === id ? { ...entity, ...point, ...vel } : entity,
      ),
    );
  };

  const handleEntityClick = (entity: Entity) => {
    if (phase !== 'playing' || won) return;

    if (entity.kind === 'decoy') {
      setCombo(0);
      setDecoyHits((n) => n + 1);
      setPenaltyMs((p) => p + DECOY_PENALTY_MS);
      addPopup('-404 trap!', entity.x + CHIP_SIZE / 2, entity.y, 'bad');
      bumpShake();
      respawnDecoy(entity.id);
      return;
    }

    if (entity.stepIndex !== nextStepIndex) {
      setCombo(0);
      setWrongOrderHits((n) => n + 1);
      setPenaltyMs((p) => p + WRONG_ORDER_PENALTY_MS);
      addPopup('Wrong order!', entity.x + CHIP_SIZE / 2, entity.y, 'bad');
      bumpShake();
      nudgeEntity(entity.id);
      return;
    }

    const now = Date.now();
    const nextCombo =
      lastCatchAt && now - lastCatchAt <= COMBO_WINDOW_MS ? combo + 1 : 1;
    const points = 100 * nextCombo;

    setCombo(nextCombo);
    setMaxCombo((m) => Math.max(m, nextCombo));
    setScore((s) => s + points);
    setLastCatchAt(now);
    setNextStepIndex((i) => i + 1);
    setSpeedMultiplier((m) => m * SPEED_RAMP);
    addPopup(`+${points}${nextCombo > 1 ? ` x${nextCombo}` : ''}`, entity.x + CHIP_SIZE / 2, entity.y, 'good');
    setEntities((prev) => prev.filter((e) => e.id !== entity.id));
  };

  const stars = starCount(score, decoyHits, wrongOrderHits, maxCombo);
  const sectionEntities = entities.filter((e) => e.kind === 'section');
  const decoyEntities = entities.filter((e) => e.kind === 'decoy');

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Mini-game · Proof scramble
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {reducedMotion
              ? 'Collect wizard steps in order (1→6). Avoid red 404 traps.'
              : 'Catch sections in editor order. Speed rises every hit — dodge 404 traps.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
          <span className="rounded-md border-2 border-foreground bg-card px-2.5 py-1 shadow-[3px_3px_0_0_hsl(var(--foreground))] dark:shadow-[3px_3px_0_0_hsl(var(--primary))]">
            {nextStepIndex}/{totalSteps}
          </span>
          <span className="flex items-center gap-1 rounded-md border-2 border-primary/40 bg-primary/10 px-2.5 py-1 text-primary">
            <Zap className="h-3.5 w-3.5" aria-hidden />
            {score}
          </span>
          {combo > 1 && (
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <Flame className="h-3.5 w-3.5" aria-hidden />x{combo}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {EDITOR_WIZARD_STEPS.map((step, i) => {
          const done = i < nextStepIndex;
          const active = i === nextStepIndex && phase === 'playing';
          return (
            <span
              key={step.id}
              className={cn(
                'rounded-full border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all',
                done && 'border-primary bg-primary text-primary-foreground',
                active && 'animate-pulse border-foreground bg-accent text-foreground ring-2 ring-primary/40',
                !done && !active && 'border-border/80 bg-muted/40 text-muted-foreground',
              )}
            >
              {i + 1}. {SHORT_STEP_LABELS[step.id]}
            </span>
          );
        })}
      </div>

      {phase === 'playing' && targetStep && (
        <p className="mb-2 text-center font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
          Next: {SHORT_STEP_LABELS[targetStep.id]} · {formatSeconds(displayMs)}s
          {penaltyMs > 0 && (
            <span className="text-destructive"> (+{formatSeconds(penaltyMs)} penalties)</span>
          )}
        </p>
      )}

      <div
        ref={arenaRef}
        className={cn(
          'relative h-[min(58vw,320px)] min-h-[260px] overflow-hidden rounded-xl border-4 border-foreground bg-card/80',
          'shadow-[8px_8px_0_0_hsl(var(--foreground))] dark:shadow-[8px_8px_0_0_hsl(var(--primary))]',
          shake && 'animate-shake',
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

        {phase === 'countdown' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/85 backdrop-blur-sm">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Remint in
            </p>
            <p className="font-display text-6xl font-bold text-primary">
              {countdown > 0 ? countdown : 'Go!'}
            </p>
          </div>
        )}

        {reducedMotion ? (
          <div className="grid h-full grid-cols-2 gap-2 p-3 sm:grid-cols-3">
            {sectionEntities.map((entity) => (
              <button
                key={entity.id}
                type="button"
                disabled={phase !== 'playing'}
                onClick={() => handleEntityClick(entity)}
                className={cn(
                  'rounded-lg border-2 border-foreground px-2 py-2 text-xs font-bold shadow-[3px_3px_0_0_hsl(var(--foreground))]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  entity.stepIndex === nextStepIndex && phase === 'playing'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent',
                )}
              >
                {entity.label}
              </button>
            ))}
            {decoyEntities.map((entity) => (
              <button
                key={entity.id}
                type="button"
                disabled={phase !== 'playing'}
                onClick={() => handleEntityClick(entity)}
                className="rounded-lg border-2 border-destructive bg-destructive/10 px-2 py-2 text-xs font-bold text-destructive shadow-[3px_3px_0_0_hsl(var(--destructive))]"
              >
                {entity.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            {sectionEntities.map((entity) => {
              const isTarget = entity.stepIndex === nextStepIndex && phase === 'playing';
              return (
                <button
                  key={entity.id}
                  type="button"
                  disabled={phase !== 'playing'}
                  onClick={() => handleEntityClick(entity)}
                  className={cn(
                    'absolute left-0 top-0 flex h-[76px] w-[76px] flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-1',
                    'text-center text-[10px] font-bold leading-tight will-change-transform',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isTarget
                      ? 'z-10 border-primary bg-primary text-primary-foreground shadow-[5px_5px_0_0_hsl(var(--foreground))] ring-2 ring-primary/50 dark:shadow-[5px_5px_0_0_hsl(var(--secondary))]'
                      : 'border-foreground bg-background text-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] dark:shadow-[3px_3px_0_0_hsl(var(--primary))]',
                  )}
                  style={{ transform: `translate3d(${entity.x}px, ${entity.y}px, 0)` }}
                  aria-label={`Section ${entity.label}${isTarget ? ', collect now' : ''}`}
                >
                  <span className="font-mono text-[9px] opacity-80">
                    {(entity.stepIndex ?? 0) + 1}
                  </span>
                  {entity.label}
                </button>
              );
            })}
            {decoyEntities.map((entity) => (
              <button
                key={entity.id}
                type="button"
                disabled={phase !== 'playing'}
                onClick={() => handleEntityClick(entity)}
                className={cn(
                  'absolute left-0 top-0 flex h-[76px] w-[76px] items-center justify-center rounded-lg border-2 border-destructive',
                  'bg-destructive/15 font-mono text-xs font-black text-destructive',
                  'shadow-[3px_3px_0_0_hsl(var(--destructive))] will-change-transform',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive',
                )}
                style={{ transform: `translate3d(${entity.x}px, ${entity.y}px, 0)` }}
                aria-label={`Trap ${entity.label}, avoid`}
              >
                <Skull className="mb-0.5 h-3.5 w-3.5" aria-hidden />
                {entity.label}
              </button>
            ))}
          </>
        )}

        {popups.map((popup) => (
          <span
            key={popup.id}
            className={cn(
              'pointer-events-none absolute z-30 -translate-x-1/2 font-mono text-xs font-black uppercase tracking-wide animate-float-up',
              popup.tone === 'good' ? 'text-primary' : 'text-destructive',
            )}
            style={{ left: popup.x, top: popup.y }}
          >
            {popup.text}
          </span>
        ))}

        <AnimatePresence>
          {phase === 'won' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/92 p-6 text-center backdrop-blur-sm"
            >
              <div className="flex gap-1" aria-label={`${stars} out of 3 stars`}>
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      'h-6 w-6',
                      n <= stars
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground/30',
                    )}
                    aria-hidden
                  />
                ))}
              </div>
              <p className="font-display text-2xl font-bold tracking-tight">Proof reminted!</p>
              <p className="text-sm text-muted-foreground">
                Score <strong className="text-foreground">{score}</strong>
                {elapsedMs !== null && (
                  <>
                    {' '}
                    · {formatSeconds(elapsedMs)}s
                  </>
                )}
                {maxCombo > 1 && <> · best combo x{maxCombo}</>}
              </p>
              {(isNewBestScore || isNewBestTime) && (
                <p className="flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  <Trophy className="h-3.5 w-3.5" aria-hidden />
                  {isNewBestScore && isNewBestTime
                    ? 'New best score & time!'
                    : isNewBestScore
                      ? 'New best score!'
                      : 'New best time!'}
                </p>
              )}
              <button
                type="button"
                onClick={initGame}
                className="mt-1 font-mono text-xs font-bold uppercase tracking-wider text-primary underline-offset-4 hover:underline"
              >
                Play again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(bestScore !== null || bestMs !== null) && (
        <p className="mt-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Personal best
          {bestScore !== null && <> · {bestScore} pts</>}
          {bestMs !== null && <> · {formatSeconds(bestMs)}s</>}
        </p>
      )}
    </div>
  );
}
