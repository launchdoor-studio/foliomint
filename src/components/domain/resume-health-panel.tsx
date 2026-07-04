'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { AssistantDockShell } from '@/components/domain/assistant-dock-shell';
import { MintAvatar } from '@/components/domain/mint/mint-avatar';
import { useMintOptional } from '@/components/domain/mint/mint-provider';
import { Button } from '@/components/ui/button';
import {
  assistantDockEdgeTabClass,
  assistantDockMarginClass,
} from '@/lib/assistant-dock';
import type { ResumeHealthResult } from '@/lib/resume-health';
import type { ResumeData } from '@/types';
import { cn } from '@/lib/utils';

export function ResumeHealthPanelContent({
  content,
  health,
  className,
}: {
  content: ResumeData;
  health: ResumeHealthResult;
  className?: string;
}) {
  const suggestions = content.portfolioSuggestions;

  return (
    <div className={cn('space-y-4', className)}>
      <ul className="space-y-2">
        {health.checks.map((check) => (
          <li key={check.id} className="flex items-start gap-2 text-sm">
            <span className={check.passed ? 'text-green-600' : 'text-amber-600'}>
              {check.passed ? '✓' : '○'}
            </span>
            <span>
              {check.label}
              {!check.passed && check.hint && (
                <span className="block text-xs text-muted-foreground">{check.hint}</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {suggestions?.heroTagline && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested tagline
          </p>
          <p className="mt-1 text-sm">{suggestions.heroTagline}</p>
        </div>
      )}

      {suggestions?.missingFields && suggestions.missingFields.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gaps to fill
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
            {suggestions.missingFields.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestions?.recommendedSectionOrder && suggestions.recommendedSectionOrder.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Recommended section order: {suggestions.recommendedSectionOrder.join(' → ')}
        </p>
      )}
    </div>
  );
}

export function scoreTone(score: number): string {
  if (score >= 75) return 'text-emerald-700 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-700 dark:text-amber-400';
  return 'text-rose-700 dark:text-rose-400';
}

export function ResumeHealthToolbarToggle({
  open,
  onToggle,
  health,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  health: ResumeHealthResult;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={open ? 'secondary' : 'outline'}
      size="sm"
      className={cn('h-8 shrink-0 gap-1.5 px-2.5', className)}
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="resume-health-dock"
      title={open ? 'Hide Mint resume health panel' : 'Show Mint resume health panel'}
    >
      <MintAvatar pose="guide" size={18} />
      <span className="hidden sm:inline">Resume health</span>
      <span className={cn('tabular-nums text-xs font-semibold', scoreTone(health.score))}>
        {health.score}
      </span>
    </Button>
  );
}

export { assistantDockMarginClass as resumeHealthDockMarginClass };

export function ResumeHealthDock({
  open,
  onOpenChange,
  content,
  health,
  chrome = 'editor',
  edgeTabOffset = 'center',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ResumeData;
  health: ResumeHealthResult;
  chrome?: 'app' | 'editor';
  edgeTabOffset?: 'center' | 'upper';
}) {
  const close = () => onOpenChange(false);
  const mint = useMintOptional();
  const openItems = health.checks.filter((check) => !check.passed);

  const askMintForHelp = () => {
    if (!mint) return;
    mint.openMint();
    void mint.sendMessage('What should I fix first in my resume health checklist?');
  };

  const edgeTabPosition =
    edgeTabOffset === 'upper'
      ? 'top-1/2 -translate-y-[calc(50%+2.75rem)]'
      : 'top-1/2 -translate-y-1/2';

  const showEdgeTab = !open;

  return (
    <AssistantDockShell
      id="resume-health-dock"
      open={open}
      onClose={close}
      chrome={chrome}
      mobileBackdropLabel="Minimize resume health panel"
      edgeTab={
        showEdgeTab ? (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className={cn(
            'fixed right-0 z-40 flex -translate-y-1/2 flex-col items-center gap-1 px-2 py-3',
            edgeTabPosition,
            assistantDockEdgeTabClass,
          )}
          aria-label={`Open resume health panel. Score ${health.score} out of 100.`}
          aria-expanded={false}
          aria-controls="resume-health-dock"
        >
          <MintAvatar pose="guide" size={24} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground [writing-mode:vertical-rl] rotate-180">
            Health
          </span>
          <span className={cn('text-xs font-bold tabular-nums', scoreTone(health.score))}>
            {health.score}
          </span>
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        ) : null
      }
      header={
        <>
          <MintAvatar pose="guide" size={36} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight">Resume health</p>
            <p className={cn('text-xs tabular-nums', scoreTone(health.score))}>
              {health.score}/100 — {health.label}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1 px-2 text-xs"
            onClick={close}
            aria-label="Hide resume health panel"
          >
            <ChevronRight className="h-4 w-4" />
            Hide
          </Button>
        </>
      }
      footer={
        <div className="space-y-2">
          {openItems.length > 0 && mint && (
            <Button type="button" size="sm" className="w-full" onClick={askMintForHelp}>
              Ask Mint what to fix first
            </Button>
          )}
          <Button type="button" variant="secondary" size="sm" className="w-full" onClick={close}>
            Back to editor
          </Button>
        </div>
      }
    >
      <p className="mb-3 text-sm text-muted-foreground">
        Mint reviewed your parsed resume. Each open item below maps to a wizard step — save as you
        go, and ask Mint if you want help prioritizing or wording bullets.
      </p>
      <ResumeHealthPanelContent content={content} health={health} />
    </AssistantDockShell>
  );
}
