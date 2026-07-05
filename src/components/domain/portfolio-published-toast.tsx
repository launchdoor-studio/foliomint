'use client';

import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { MintAvatar } from '@/components/domain/mint/mint-avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Full-width CTA, no cramped Sonner action slot or extra success glyph. */
export function showPortfolioPublishedToast(livePath: string) {
  toast.custom(
    (id) => (
      <div
        className={cn(
          'pointer-events-auto w-[min(100%,22rem)] max-w-[calc(100vw-2rem)]',
          'rounded-xl border border-border bg-popover p-4 text-left text-popover-foreground shadow-xl',
          'ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
        )}
      >
        <div className="flex items-start gap-3">
          <MintAvatar pose="celebrate" size={64} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug tracking-tight text-foreground">
              Portfolio published
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Your site is live. Open it in a new tab to see exactly what visitors see.
            </p>
          </div>
        </div>
        <Button asChild className="mt-4 h-10 w-full shadow-sm" size="default">
          <a
            href={livePath}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => toast.dismiss(id)}
          >
            <span className="flex w-full items-center justify-center gap-2">
              View live site
              <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            </span>
          </a>
        </Button>
      </div>
    ),
    {
      id: 'portfolio-published',
      duration: 12_000,
      /** Outer <li> stays visually neutral; all chrome is in the JSX below. */
      unstyled: true,
    },
  );
}
