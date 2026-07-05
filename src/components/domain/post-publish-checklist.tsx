'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  Check,
  Globe2,
  Link2,
  Sparkles,
  User,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STORAGE_PREFIX = 'foliomint-post-publish-checklist';

export const AFTER_PUBLISH_CHECKLIST_ID = 'after-publish-checklist';

/** Only dismissal is persisted; checklist body opens in a modal so it never pushes the wizard down. */
type ChecklistStored = {
  dismissed: boolean;
};

function storageKey(portfolioId: string) {
  return `${STORAGE_PREFIX}:${portfolioId}`;
}

function parseStored(raw: string | null): ChecklistStored {
  if (!raw) {
    return { dismissed: false };
  }
  try {
    const parsed = JSON.parse(raw) as { dismissed?: boolean; collapsed?: boolean };
    return { dismissed: Boolean(parsed.dismissed) };
  } catch {
    return { dismissed: false };
  }
}

type Item = {
  id: string;
  icon: LucideIcon;
  done: boolean;
  title: string;
  description: string;
  href: string;
  cta: string;
};

type ChecklistContextValue = {
  portfolioId: string;
  publicHandle: string | null;
  tier: 'free' | 'pro';
  liveSitePath: string;
  items: Item[];
  stored: ChecklistStored;
  persist: (next: ChecklistStored) => void;
};

const ChecklistContext = createContext<ChecklistContextValue | null>(null);

function useChecklistContext() {
  const ctx = useContext(ChecklistContext);
  if (!ctx) throw new Error('ChecklistContext missing');
  return ctx;
}

function TipsChecklistModal({
  open,
  onClose,
  titleId,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
}) {
  const { items, liveSitePath } = useChecklistContext();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-[2px]"
        aria-label="Close checklist"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[101] flex max-h-[min(85vh,560px)] w-full max-w-lg flex-col rounded-t-2xl border border-border/80 bg-card shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p id={titleId} className="font-semibold text-foreground">
              After you publish
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional extras for{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{liveSitePath}</code>
              — your editor steps stay the same.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className={cn(
                  'flex flex-col gap-2 border-border/40 px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3',
                  index > 0 && 'border-t',
                )}
              >
                <div className="flex min-w-0 gap-2.5">
                  <span
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                      item.done
                        ? 'border-primary/35 bg-primary/10 text-primary'
                        : 'border-border/80 bg-muted/30 text-muted-foreground',
                    )}
                  >
                    {item.done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5 opacity-80" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight text-foreground">{item.title}</p>
                    <p className="text-xs leading-snug text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Button asChild variant="secondary" size="sm" className="h-8 w-full shrink-0 sm:w-auto">
                  <Link href={item.href} onClick={onClose}>
                    {item.cta}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Slim bar only; full checklist opens in a modal so the wizard is never buried. */
function PublishTipsCard() {
  const { persist, liveSitePath, items } = useChecklistContext();
  const [modalOpen, setModalOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      {/* Same horizontal rail as EditorWizardWorkspace (`editor-workspace`) so the border matches page content width */}
      <div className="mx-auto w-full max-w-7xl shrink-0 scroll-mt-28 px-4 pb-2 pt-4 sm:px-6 md:scroll-mt-32 lg:px-8">
        <section
          id={AFTER_PUBLISH_CHECKLIST_ID}
          aria-label="Published site — optional checklist"
          className="rounded-lg border border-border/50 bg-muted/20 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 sm:px-5 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground sm:text-sm">Site is live</p>
              <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                <code className="rounded bg-muted/80 px-1 py-px font-mono">{liveSitePath}</code>
                <span className="mx-1.5 text-muted-foreground/50">·</span>
                {items.length} optional next steps
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 text-xs sm:text-sm"
              onClick={() => setModalOpen(true)}
            >
              Open checklist
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Hide this reminder"
              onClick={() => persist({ dismissed: true })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        </section>
      </div>

      <TipsChecklistModal open={modalOpen} onClose={() => setModalOpen(false)} titleId={titleId} />
    </>
  );
}

export const SHOW_PUBLISH_TIPS_PARAM = 'showTips';

function RestorePublishTipsLink() {
  const pathname = usePathname();
  const qs = new URLSearchParams({ [SHOW_PUBLISH_TIPS_PARAM]: '1' });
  return (
    <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
      <p className="rounded-lg border border-dashed border-border/70 bg-muted/15 px-3 py-2.5 text-center text-xs text-muted-foreground">
        Publishing tips are hidden.{' '}
        <Link
          href={`${pathname ?? ''}?${qs.toString()}`}
          className="font-medium text-primary underline underline-offset-4 hover:no-underline"
        >
          Show them again
        </Link>
      </p>
    </div>
  );
}

export function PublishedEditorChecklist({
  portfolioId,
  publicHandle,
  tier,
  liveSitePath,
  children,
}: {
  portfolioId: string;
  publicHandle: string | null;
  tier: 'free' | 'pro';
  liveSitePath: string;
  children: ReactNode;
}) {
  const [stored, setStored] = useState<ChecklistStored | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(portfolioId));
      setStored(parseStored(raw));
    } catch {
      setStored({ dismissed: false });
    }
  }, [portfolioId]);

  useEffect(() => {
    if (searchParams.get(SHOW_PUBLISH_TIPS_PARAM) !== '1') return;
    const next: ChecklistStored = { dismissed: false };
    setStored(next);
    try {
      localStorage.setItem(storageKey(portfolioId), JSON.stringify(next));
    } catch {
      // ignore
    }
    const path = pathname ?? `/editor/${portfolioId}`;
    router.replace(path, { scroll: false });
  }, [portfolioId, pathname, router, searchParams]);

  const persist = useCallback(
    (next: ChecklistStored) => {
      setStored(next);
      try {
        localStorage.setItem(storageKey(portfolioId), JSON.stringify(next));
      } catch {
        // ignore quota
      }
    },
    [portfolioId],
  );

  const items: Item[] = useMemo(() => {
    const handleOk = Boolean(publicHandle?.trim());
    const base: Item[] = [
      {
        id: 'handle',
        icon: User,
        done: handleOk,
        title: 'Set a public username',
        description: handleOk
          ? 'Your short URL is active.'
          : 'Shorten your live link in Profile (step 1).',
        href: `/editor/${portfolioId}`,
        cta: handleOk ? 'Review' : 'Set handle',
      },
      {
        id: 'links',
        icon: Link2,
        done: false,
        title: 'Add profile links',
        description: 'GitHub, LinkedIn, and more.',
        href: '/dashboard/integrations',
        cta: 'Integrations',
      },
      {
        id: 'analytics',
        icon: BarChart3,
        done: false,
        title: 'See who visits',
        description: 'Views and referrers.',
        href: '/dashboard/analytics',
        cta: 'Analytics',
      },
    ];
    if (tier === 'pro') {
      base.push(
        {
          id: 'blog',
          icon: BookOpen,
          done: false,
          title: 'Write a blog post',
          description: 'Optional Markdown on /blog.',
          href: `/editor/${portfolioId}/blog`,
          cta: 'Blog',
        },
        {
          id: 'domain',
          icon: Globe2,
          done: false,
          title: 'Custom domain',
          description: 'DNS verification.',
          href: `/editor/${portfolioId}/domain`,
          cta: 'Domain',
        },
      );
    }
    return base;
  }, [portfolioId, publicHandle, tier]);

  if (stored === null) {
    return <>{children}</>;
  }

  if (stored.dismissed) {
    return (
      <>
        <RestorePublishTipsLink />
        {children}
      </>
    );
  }

  const ctx: ChecklistContextValue = {
    portfolioId,
    publicHandle,
    tier,
    liveSitePath,
    items,
    stored,
    persist,
  };

  return (
    <ChecklistContext.Provider value={ctx}>
      <PublishTipsCard />
      {children}
    </ChecklistContext.Provider>
  );
}
