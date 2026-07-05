'use client';

import { ChevronRight } from 'lucide-react';

import { FloatingAssistantPanel } from '@/components/domain/floating-assistant-panel';
import { MintAvatar } from '@/components/domain/mint/mint-avatar';
import { useMintOptional } from '@/components/domain/mint/mint-provider';
import { Button } from '@/components/ui/button';
import { reconcilePortfolioGaps } from '@/lib/mint/portfolio-gap-reconciliation';
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
  const gapStatus = reconcilePortfolioGaps(content);

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
        <div className="rounded-lg border-2 border-foreground/15 bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested tagline
          </p>
          <p className="mt-1 text-sm">{suggestions.heroTagline}</p>
        </div>
      )}

      {gapStatus.openGaps.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gaps to fill
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
            {gapStatus.openGaps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {gapStatus.resolvedGaps.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Already in your portfolio
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground/80">
            {gapStatus.resolvedGaps.map((item) => (
              <li key={item} className="line-through decoration-muted-foreground/50">
                {item}
              </li>
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
      className={cn('h-9 shrink-0 gap-1.5 px-2.5', className)}
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="resume-health-panel"
      title={open ? 'Hide Mint resume health panel' : 'Show Mint resume health panel'}
    >
      <MintAvatar pose="guide" size={28} />
      <span className="hidden sm:inline">Resume health</span>
      <span className={cn('tabular-nums text-xs font-semibold', scoreTone(health.score))}>
        {health.score}
      </span>
    </Button>
  );
}

export function ResumeHealthDock({
  open,
  onOpenChange,
  content,
  health,
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
    close();
    mint.openMint();
    void mint.sendMessage('What should I fix first in my resume health checklist?');
  };

  return (
    <FloatingAssistantPanel
      id="resume-health-panel"
      open={open}
      onClose={close}
      backdropLabel="Close resume health panel"
      zIndexClass="z-[48]"
      header={
        <>
          <MintAvatar pose="guide" size={56} />
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
    </FloatingAssistantPanel>
  );
}
