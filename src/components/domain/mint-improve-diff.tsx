'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatImprovePreview } from '@/lib/improve-preview';
import type { ResumeData } from '@/types';

export function MintImproveButton({
  portfolioId,
  section,
  targetIndex,
  label = 'Improve with Mint',
  onApply,
}: {
  portfolioId: string;
  section: 'bio' | 'headline' | 'skills' | 'experience' | 'projects';
  targetIndex?: number;
  label?: string;
  onApply: (patch: Partial<ResumeData>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [before, setBefore] = useState<unknown>(null);
  const [after, setAfter] = useState<unknown>(null);
  const [patch, setPatch] = useState<Partial<ResumeData> | null>(null);

  const runImprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ section, targetIndex }),
      });
      const data = (await res.json()) as {
        before?: unknown;
        after?: unknown;
        patch?: Partial<ResumeData>;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Improvement failed');
      setBefore(data.before);
      setAfter(data.after);
      setPatch(data.patch ?? null);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button type="button" variant="outline" size="sm" onClick={() => void runImprove()} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
        {label}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {open && patch && (
        <div className="mt-3 rounded-lg border bg-muted/20 p-3 text-sm">
          <p className="font-medium">Review Mint&apos;s suggestions</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Before</p>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-background p-2 text-xs">
                {formatImprovePreview(section, before)}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">After</p>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-background p-2 text-xs">
                {formatImprovePreview(section, after)}
              </pre>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onApply(patch);
                setOpen(false);
              }}
            >
              Accept
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
