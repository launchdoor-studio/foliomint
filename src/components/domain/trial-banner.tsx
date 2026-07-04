'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  if (daysLeft <= 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm">
          <span className="font-semibold">Pro trial active</span> — {daysLeft} day
          {daysLeft === 1 ? '' : 's'} left. Enjoy blog, custom domain, higher Mint limits, and resume
          export.
        </p>
      </div>
      <Link href="/upgrade" className="text-sm font-medium text-primary hover:underline">
        View plans
      </Link>
    </div>
  );
}
