'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Save, Eye, Globe, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

import { toastAfterPortfolioSave } from '@/lib/editor-save-toast';
import { buildPortfolioSavePayload } from '@/lib/editor-save-payload';
import { serializeEditorPageState } from '@/lib/editor-state-snapshot';
import { ACTIVE_PORTFOLIO_THEME } from '@/lib/portfolio-profile-links';
import { integrationToSocialLink } from '@/lib/social-links';
import type { SocialLink } from '@/lib/social-links';

import { Button } from '@/components/ui/button';
import { EditorLivePreview } from '@/components/domain/editor-live-preview';
import { EditorLivePreviewPanel } from '@/components/domain/editor-live-preview-panel';
import { EditorStepPanels } from '@/components/domain/editor-step-panels';
import { EditorWizardWorkspace } from '@/components/domain/editor-wizard-workspace';
import {
  PublishedEditorChecklist,
} from '@/components/domain/post-publish-checklist';
import { editorMonoControlClass } from '@/components/domain/editor-form-ui';
import { Navbar } from '@/components/domain/navbar';
import { useMintOptional } from '@/components/domain/mint/mint-provider';
import { ResumeReimportButton } from '@/components/domain/resume-reimport-button';
import {
  ResumeHealthDock,
  ResumeHealthToolbarToggle,
} from '@/components/domain/resume-health-panel';
import { useEditorToolbarHeight } from '@/hooks/use-editor-toolbar-height';
import { TrialBanner } from '@/components/domain/trial-banner';
import { scoreResumeHealth } from '@/lib/resume-health';
import { buildMintResumeHealthSnapshot } from '@/lib/mint/resume-health-guidance';
import { EDITOR_WIZARD_STEPS } from '@/lib/editor-wizard-steps';
import { EMPTY_PORTFOLIO_THEME_COLORS } from '@/lib/portfolio-theme-colors';
import { portfolioSiteBasePath } from '@/lib/public-handle';
import { cn } from '@/lib/utils';
import type { EditorPageState } from '@/types/editor-page';
import type { PortfolioContent } from '@/types';

const PORTFOLIO_THEME_LABEL = 'Neubrutalism';

export default function EditorPage() {
  const params = useParams<{ portfolioId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mint = useMintOptional();
  const [state, setState] = useState<EditorPageState | null>(null);
  const [tier, setTier] = useState<'free' | 'pro'>('pro');
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [healthPanelOpen, setHealthPanelOpen] = useState(false);

  useEditorToolbarHeight();
  const [integrationSocialLinks, setIntegrationSocialLinks] = useState<SocialLink[]>([]);
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
          theme: ACTIVE_PORTFOLIO_THEME,
          accentColor: data.accentColor ?? null,
          themeColors: data.themeColors ?? EMPTY_PORTFOLIO_THEME_COLORS,
          isPublished: data.isPublished,
          content: data.content,
        };
        if (data.theme !== ACTIVE_PORTFOLIO_THEME) {
          void fetch(`/api/portfolios/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: ACTIVE_PORTFOLIO_THEME }),
          });
        }
        setState(loaded);
        saveBaselineRef.current = serializeEditorPageState(loaded);
        const me = await fetch('/api/me', { credentials: 'include' }).then(
          (r) =>
            r.json() as Promise<{ tier?: string; trialDaysLeft?: number | null }>,
        );
        setTier(me.tier === 'pro' ? 'pro' : 'free');
        setTrialDaysLeft(me.trialDaysLeft ?? null);
        if (searchParams.get('from') === 'parse') {
          setHealthPanelOpen(true);
          router.replace(`/editor/${id}`, { scroll: false });
        }

        const integrationsRes = await fetch('/api/integrations', { credentials: 'include' });
        if (integrationsRes.ok) {
          const integrationsData = (await integrationsRes.json()) as {
            integrations: Array<{
              platform: string;
              username: string | null;
              data: Record<string, unknown> | null;
            }>;
          };
          const links = integrationsData.integrations
            .map((row) => integrationToSocialLink(row.platform, row.username, row.data))
            .filter((link): link is SocialLink => link !== null);
          setIntegrationSocialLinks(links);
        }

        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params.portfolioId, router, searchParams]);

  useEffect(() => {
    if (!mint || !state?.content) return;
    const step = EDITOR_WIZARD_STEPS[wizardStep];
    const health = scoreResumeHealth(state.content);
    mint.setPageContext({
      editorStep: step?.id,
      portfolioId: state.id,
      hasPortfolio: true,
      isPublished: state.isPublished,
      resumeHealth: buildMintResumeHealthSnapshot(state.content, health),
    });
  }, [mint, state, wizardStep]);

  useEffect(() => {
    if (!mint || !state?.content || wizardStep !== 0) return;
    if (healthPanelOpen) return;
    if (!state.content.bio?.trim()) {
      mint.setNudge('Want help writing your intro? Ask Mint anytime.');
    }
  }, [mint, state?.content, state?.id, wizardStep, healthPanelOpen]);

  const handleSave = async (updates?: Partial<EditorPageState>) => {
    if (!state) return;
    const prevPublished = state.isPublished;
    setSaving(true);
    try {
      const next = { ...state, ...updates, theme: ACTIVE_PORTFOLIO_THEME };
      const res = await fetch(`/api/portfolios/${state.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPortfolioSavePayload(next, updates)),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Failed to save portfolio');
      }
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

  if (!state.content) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Failed to load portfolio content.
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

  const handleReimport = (nextContent: PortfolioContent) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, content: nextContent };
      saveBaselineRef.current = serializeEditorPageState(next);
      return next;
    });
    setWizardStep(0);
    setHealthPanelOpen(true);
    toast.success('Resume re-imported', {
      description: 'Mint refreshed your portfolio content from the file.',
    });
  };

  const previewCardClass = cn(
    'editor-form-card shadow-sm hover:translate-y-0 hover:shadow-md before:hidden dark:hover:shadow-black/20',
  );
  const editorCardTitleClass = 'font-sans text-base font-semibold tracking-tight text-foreground';
  const editorRepeatItemClass = cn(
    'editor-nested-card rounded-xl border-2 border-border p-5 sm:p-6',
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

  const resumeHealth = scoreResumeHealth(content);

  const editorWorkspace = (
    <EditorWizardWorkspace
      stepIndex={wizardStep}
      onStepIndexChange={setWizardStep}
      footerError={error}
      onSavePortfolio={() => void handleSave()}
      savePending={saving}
      preview={
        <EditorLivePreviewPanel
          stepKey={wizardStep}
          themeLabel={PORTFOLIO_THEME_LABEL}
          cardClassName={previewCardClass}
          titleClassName={editorCardTitleClass}
        >
          <EditorLivePreview
            content={content}
            slug={state.slug}
            publicHandle={state.publicHandle}
            theme={ACTIVE_PORTFOLIO_THEME}
            accentColor={state.accentColor}
            themeColors={state.themeColors}
            isPublished={state.isPublished}
            portfolioId={state.id}
            socialLinks={integrationSocialLinks}
          />
        </EditorLivePreviewPanel>
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
        <div
          id="editor-toolbar"
          className="sticky top-16 z-40 border-b-2 border-foreground bg-background/90 backdrop-blur-lg dark:bg-card/90"
        >
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
              <span className="hidden rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground md:inline">
                {PORTFOLIO_THEME_LABEL}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <ResumeReimportButton portfolioId={state.id} onImported={handleReimport} />
              <Button asChild variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 px-2.5">
                <a
                  href={`/api/portfolios/${state.id}/export/resume`}
                  download
                  title="Download resume PDF matching your portfolio content"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Resume PDF</span>
                  <span className="sm:hidden">PDF</span>
                </a>
              </Button>
              <ResumeHealthToolbarToggle
                open={healthPanelOpen}
                onToggle={() => setHealthPanelOpen((open) => !open)}
                health={resumeHealth}
              />

              <span
                className="mx-0.5 hidden h-6 w-px shrink-0 bg-border sm:block"
                aria-hidden
              />

              <Button asChild variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 px-2.5">
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
                <Button asChild variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 px-2.5">
                  <Link href={liveSitePath} target="_blank">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </Link>
                </Button>
              )}

              <span
                className="mx-0.5 hidden h-6 w-px shrink-0 bg-border sm:block"
                aria-hidden
              />

              <Button
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 px-2.5"
                onClick={() => handleSave()}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="hidden sm:inline">Saving</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </Button>
              <Button
                variant={state.isPublished ? 'outline' : 'default'}
                size="sm"
                className="h-8 shrink-0 gap-1.5 px-2.5"
                onClick={() => handleSave({ isPublished: !state.isPublished })}
                disabled={saving}
              >
                <Globe className="h-3.5 w-3.5" />
                {state.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>

        {typeof trialDaysLeft === 'number' && trialDaysLeft > 0 && (
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <TrialBanner daysLeft={trialDaysLeft} />
          </div>
        )}

        <div>
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

        <ResumeHealthDock
          open={healthPanelOpen}
          onOpenChange={setHealthPanelOpen}
          content={content}
          health={resumeHealth}
          chrome="editor"
        />
      </div>
    </div>
  );
}

