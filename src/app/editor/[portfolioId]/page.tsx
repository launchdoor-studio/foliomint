'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Save, Eye, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { toastAfterPortfolioSave } from '@/lib/editor-save-toast';
import { serializeEditorPageState } from '@/lib/editor-state-snapshot';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditorLivePreview } from '@/components/domain/editor-live-preview';
import { EditorStepPanels } from '@/components/domain/editor-step-panels';
import { EditorWizardWorkspace } from '@/components/domain/editor-wizard-workspace';
import {
  PublishedEditorChecklist,
} from '@/components/domain/post-publish-checklist';
import { editorMonoControlClass } from '@/components/domain/editor-form-ui';
import { Navbar } from '@/components/domain/navbar';
import { portfolioSiteBasePath } from '@/lib/public-handle';
import { cn } from '@/lib/utils';
import type { EditorPageState } from '@/types/editor-page';
import type { PortfolioContent } from '@/types';

const PORTFOLIO_THEME_LABELS: Record<string, string> = {
  classic: 'Classic mono',
  minimal: 'Minimal',
  neubrutalism: 'Neubrutalism',
  editorial: 'Editorial',
  terminal: 'Terminal',
};

export default function EditorPage() {
  const params = useParams<{ portfolioId: string }>();
  const router = useRouter();
  const [state, setState] = useState<EditorPageState | null>(null);
  const [tier, setTier] = useState<'free' | 'pro'>('pro');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const saveBaselineRef = useRef<string | null>(null);

  useEffect(() => {
    const rawId = params.portfolioId;
    const id = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/portfolios/${id}`, { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/editor/${id}`)}`);
            return;
          }
          throw new Error('Failed to load portfolio');
        }
        const data = await res.json();
        const loaded: EditorPageState = {
          id: data.id,
          slug: data.slug,
          publicHandle: data.publicHandle ?? null,
          title: data.title,
          theme: data.theme,
          accentColor: data.accentColor ?? null,
          isPublished: data.isPublished,
          content: data.content,
        };
        setState(loaded);
        saveBaselineRef.current = serializeEditorPageState(loaded);
        const me = await fetch('/api/me', { credentials: 'include' }).then((r) => r.json() as Promise<{ tier?: string }>);
        setTier(me.tier === 'pro' ? 'pro' : 'free');
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params.portfolioId, router]);

  const handleSave = async (updates?: Partial<EditorPageState>) => {
    if (!state) return;
    const prevPublished = state.isPublished;
    setSaving(true);
    try {
      const next = { ...state, ...updates };
      const res = await fetch(`/api/portfolios/${state.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: next.title,
          theme: next.theme,
          accentColor: next.accentColor,
          isPublished: next.isPublished,
          content: next.content,
          publicHandle: next.publicHandle,
        }),
      });
      if (!res.ok) throw new Error('Failed to save portfolio');
      setState(next);
      saveBaselineRef.current = serializeEditorPageState(next);
      setError(null);

      toastAfterPortfolioSave(updates, next, prevPublished);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save portfolio';
      setError(msg);
      toast.error('Could not save', { description: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Failed to load portfolio.
        </div>
      </div>
    );
  }

  const content = state.content;
  const updateContent = (updater: (current: PortfolioContent) => PortfolioContent) => {
    setState((prev) =>
      prev && prev.content ? { ...prev, content: updater(prev.content) } : prev,
    );
  };

  const previewCardClass = cn(
    'editor-form-card shadow-sm hover:translate-y-0 hover:shadow-md before:hidden dark:hover:shadow-black/20',
  );
  const editorCardTitleClass = 'font-sans text-base font-semibold tracking-tight text-foreground';
  const editorRepeatItemClass = cn(
    'editor-nested-card rounded-xl border-2 border-border p-5 sm:p-6 dark:border-white/10',
  );

  const monoInput = (extra?: string) => cn(editorMonoControlClass, 'h-11', extra);
  const monoTextarea = (extra?: string) =>
    cn(editorMonoControlClass, 'min-h-[104px] resize-y', extra);

  const stepContext = {
    state,
    setState,
    updateContent,
    handleSave,
    saving,
    tier,
    monoInput,
    monoTextarea,
    editorRepeatItemClass,
  };

  const liveSitePath = portfolioSiteBasePath({
    publicHandle: state.publicHandle,
    slug: state.slug,
  });

  const isDirty =
    saveBaselineRef.current !== null &&
    serializeEditorPageState(state) !== saveBaselineRef.current;

  const editorWorkspace = (
    <EditorWizardWorkspace
      stepIndex={wizardStep}
      onStepIndexChange={setWizardStep}
      footerError={error}
      onSavePortfolio={() => void handleSave()}
      savePending={saving}
      preview={
        <Card
          className={cn(
            previewCardClass,
            'flex max-h-[min(52vh,520px)] min-h-[260px] flex-col overflow-hidden sm:max-h-[min(640px,calc(100vh-9rem))] lg:max-h-[min(720px,calc(100vh-8.5rem))] lg:min-h-[280px]',
          )}
        >
          <CardHeader className="shrink-0 space-y-1 border-b border-border/60 bg-background/80 pb-4 dark:border-white/10">
            <CardTitle className={editorCardTitleClass}>Live preview</CardTitle>
            <p className="font-sans text-xs text-muted-foreground">
              Updates as you type. Theme: {PORTFOLIO_THEME_LABELS[state.theme] ?? state.theme} — matches what visitors
              see (they can switch light/dark on the published site).
            </p>
          </CardHeader>
          <CardContent className="relative min-h-0 flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={wizardStep}
                initial={{ opacity: 0.72, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.5, y: -4 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <EditorLivePreview
                  content={content}
                  slug={state.slug}
                  publicHandle={state.publicHandle}
                  theme={state.theme}
                  accentColor={state.accentColor}
                />
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      }
    >
      <EditorStepPanels stepIndex={wizardStep} ctx={stepContext} />
    </EditorWizardWorkspace>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Editor toolbar */}
        <div className="sticky top-16 z-40 border-b bg-background/80 backdrop-blur-lg">
          <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Edit content</span>
              <code
                className="max-w-[min(100%,14rem)] truncate rounded bg-muted px-2 py-0.5 text-xs sm:max-w-xs"
                title={state.publicHandle ? 'Public URL path' : 'Legacy URL (set a public username in Profile to shorten)'}
              >
                {liveSitePath}
              </code>
              <span
                className={
                  tier === 'pro'
                    ? 'rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary'
                    : 'rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground'
                }
              >
                {tier === 'pro' ? 'Pro' : 'Free'}
              </span>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums',
                  saving && 'border-border bg-muted/60 text-muted-foreground',
                  !saving && isDirty && 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300',
                  !saving && !isDirty && 'border-emerald-500/35 bg-emerald-500/10 text-emerald-900 dark:text-emerald-400',
                )}
                title={
                  saving
                    ? 'Writing changes to the server'
                    : isDirty
                      ? 'Changes not saved yet — use Save or Publish to persist'
                      : 'All edits in the editor match the last save'
                }
              >
                {saving ? 'Saving…' : isDirty ? 'Unsaved changes' : 'Saved'}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                Theme
                <select
                  className="h-8 rounded-md border-2 border-input bg-background px-2 font-mono text-xs font-bold uppercase tracking-[0.08em]"
                  value={state.theme}
                  onChange={(e) => void handleSave({ theme: e.target.value })}
                  disabled={saving}
                >
                  <option value="neubrutalism">Neubrutalism</option>
                  <option value="classic">Classic mono</option>
                  <option value="minimal">Minimal</option>
                  <option value="editorial" disabled={tier === 'free'}>
                    Editorial (Pro)
                  </option>
                  <option value="terminal" disabled={tier === 'free'}>
                    Terminal (Pro)
                  </option>
                </select>
              </label>
              <Button asChild variant="secondary" size="sm" className="h-8 shrink-0 gap-1.5 px-2.5">
                <Link
                  href={`/dashboard/portfolios/${state.id}/manage`}
                  title="Portfolio management: blog, custom domain, live URL, and shortcuts—outside the step-by-step editor below."
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Manage portfolio</span>
                  <span className="sm:hidden">Manage</span>
                </Link>
              </Button>
              {state.isPublished && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={liveSitePath} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Link>
                </Button>
              )}
              <Button
                variant={state.isPublished ? 'outline' : 'default'}
                size="sm"
                onClick={() => handleSave({ isPublished: !state.isPublished })}
                disabled={saving}
              >
                <Globe className="mr-2 h-4 w-4" />
                {state.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
              <Button size="sm" onClick={() => handleSave()} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Published: slim banner under toolbar (discovery) + full checklist after wizard */}
        {state.isPublished ? (
          <Suspense fallback={editorWorkspace}>
            <PublishedEditorChecklist
              portfolioId={state.id}
              publicHandle={state.publicHandle}
              tier={tier}
              liveSitePath={liveSitePath}
            >
              {editorWorkspace}
            </PublishedEditorChecklist>
          </Suspense>
        ) : (
          editorWorkspace
        )}
      </div>
    </div>
  );
}

