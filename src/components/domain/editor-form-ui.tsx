'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** Shared control look: high-contrast border, monospace (editor “worksheet” style). */
export const editorMonoControlClass = cn(
  'min-w-0 w-full rounded-lg border-2 border-border bg-background px-3.5 py-3 font-mono text-sm leading-relaxed',
  'text-foreground placeholder:text-muted-foreground/70',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'dark:border-white/[0.14] dark:bg-[hsl(200_14%_10%)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]',
);

/** Vertical stack inside repeat cards (roles, schools, projects, …). */
export const editorRepeatBodyClass = 'flex flex-col gap-5 sm:gap-6';

/** Row container: use with `EditorFormCell` around each field (avoids stray whitespace flex items from JSX). */
export const editorFormRow2 = 'flex flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-x-5';

export const editorFormRow2Md = 'flex flex-col gap-5 md:flex-row md:items-stretch md:gap-x-5';

export const editorFormRow3 = 'flex flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-x-4';

/** Equal-width column: `flex-1 basis-0 min-w-0` for stable halves/thirds next to siblings. */
export function EditorFormCell({ bp = 'sm', children }: { bp?: 'sm' | 'md'; children: ReactNode }) {
  return (
    <div
      className={cn(
        'min-w-0',
        bp === 'sm' && 'sm:flex-1 sm:basis-0',
        bp === 'md' && 'md:flex-1 md:basis-0',
      )}
    >
      {children}
    </div>
  );
}

export function EditorFormPanel({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border-2 border-border bg-card/40 p-6 shadow-sm sm:p-8',
        'dark:border-white/[0.12] dark:bg-[hsl(200_14%_11%)] dark:shadow-none',
      )}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5 dark:border-white/10">
        <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground">{title}</h2>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function EditorField({
  id,
  label,
  hint,
  uniformLabelStack,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  /** When fields sit side-by-side, reserve a fixed hint band so inputs align even if only some columns have hint text. */
  uniformLabelStack?: boolean;
  children: ReactNode;
}) {
  const hintParagraph = hint ? (
    <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
  ) : null;

  if (uniformLabelStack) {
    return (
      <div className="min-w-0 space-y-1.5">
        <div className="space-y-0.5">
          <label htmlFor={id} className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground">
            {label}
          </label>
          {/* ~2 lines at 11px; tight enough to avoid empty “wells” when a sibling has no hint */}
          <div className="min-h-[2.125rem]">{hintParagraph}</div>
        </div>
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-2">
      <div className="space-y-0.5">
        <label htmlFor={id} className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground">
          {label}
        </label>
        {hintParagraph}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function EditorSensitiveContactNotice() {
  return (
    <p
      id="editor-contact-privacy-notice"
      className="rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground dark:border-white/10"
    >
      We recommend adding an email.{' '}
      <span className="font-semibold text-foreground">Phone numbers are more sensitive:</span> anything
      you save here becomes part of your portfolio and may be sent to Mint (AI) when you parse a resume,
      chat, or run improvements — as described in our{' '}
      <Link href="/privacy" className="text-foreground underline underline-offset-2 hover:text-primary">
        privacy policy
      </Link>
      . That is why many people leave phone blank and rely on email or LinkedIn instead — only add a
      number if you are comfortable sharing it with AI processing.
    </p>
  );
}

export function EditorSkillsField({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (skills.includes(t)) {
      setDraft('');
      return;
    }
    onChange([...skills, t]);
    setDraft('');
  };

  const remove = (index: number) => onChange(skills.filter((_, idx) => idx !== index));

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
        Add skills one at a time. Each appears as a removable tag—no guessing after you fill the form.
      </p>
      <div className="flex min-h-[2.75rem] flex-wrap gap-2.5 rounded-lg border-2 border-dashed border-border/80 bg-muted/20 p-3 dark:border-white/10 dark:bg-black/20">
        {skills.length === 0 ? (
          <span className="self-center font-mono text-xs text-muted-foreground">No skills yet.</span>
        ) : (
          skills.map((s, i) => (
            <span
              key={`skill-chip-${i}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs font-medium dark:border-white/12"
            >
              {s}
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${s}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          id="editor-skill-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Type a skill, press Enter"
          className={cn(editorMonoControlClass, 'h-11 sm:max-w-md')}
        />
        <Button type="button" variant="outline" size="sm" className="h-11 font-mono text-xs uppercase" onClick={add}>
          Add skill
        </Button>
      </div>
    </div>
  );
}
