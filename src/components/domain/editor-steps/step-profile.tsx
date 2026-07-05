'use client';

import { Input } from '@/components/ui/input';
import { EditorField, EditorFormPanel, EditorSensitiveContactNotice } from '@/components/domain/editor-form-ui';
import type { EditorStepContext } from '@/components/domain/editor-step-context';
import { MintImproveButton } from '@/components/domain/mint-improve-diff';

export function EditorStepProfile(ctx: EditorStepContext) {
  const { state, setState, updateContent, handleSave, saving, monoInput, monoTextarea } = ctx;
  const content = state.content;

  return (
    <div className="space-y-6">
      <EditorFormPanel title="Personal info">
        <EditorField
          id="editor-portfolio-title"
          label="Portfolio title"
          hint="Shown in your dashboard and browser tab; can differ from your display name."
        >
          <Input
            id="editor-portfolio-title"
            value={state.title}
            onChange={(e) => setState((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
            className={monoInput()}
          />
        </EditorField>
        <EditorField
          id="editor-public-handle"
          label="Public username"
          hint="Clean link for sharing: /u/your-name on this site (e.g. foliomint.site/u/alice). Lowercase letters, numbers, and single hyphens; 3–32 characters. Leave empty to use only the legacy auto-generated link in the toolbar."
        >
          <Input
            id="editor-public-handle"
            className={monoInput('lowercase')}
            value={state.publicHandle ?? ''}
            placeholder="e.g. alice-chen"
            spellCheck={false}
            autoComplete="off"
            onChange={(e) =>
              setState((prev) =>
                prev ? { ...prev, publicHandle: e.target.value || null } : prev,
              )
            }
            onBlur={(e) => {
              const t = e.target.value.trim().toLowerCase();
              const next = t === '' ? null : t;
              setState((prev) => (prev ? { ...prev, publicHandle: next } : prev));
              void handleSave({ publicHandle: next });
            }}
            disabled={saving}
          />
        </EditorField>
        {content ? (
          <>
            <EditorField id="editor-full-name" label="Display name" hint="Your name on the public portfolio.">
              <Input
                id="editor-full-name"
                value={content.name}
                onChange={(e) =>
                  setState((prev) =>
                    prev && prev.content ? { ...prev, content: { ...prev.content, name: e.target.value } } : prev,
                  )
                }
                className={monoInput()}
              />
            </EditorField>
            <EditorField
              id="editor-headline"
              label="Headline"
              hint="A concise role or value proposition for the top of your portfolio."
            >
              <Input
                id="editor-headline"
                value={content.headline ?? ''}
                onChange={(e) => updateContent((c) => ({ ...c, headline: e.target.value || undefined }))}
                placeholder="Product designer building clear, useful systems"
                className={monoInput()}
              />
            </EditorField>
            <MintImproveButton
              portfolioId={state.id}
              section="headline"
              onApply={(patch) => updateContent((c) => ({ ...c, ...patch }))}
            />
            <EditorField
              id="editor-profile-image"
              label="Profile image URL"
              hint="Square photo works best. Paste a direct image link (https://…)."
            >
              <Input
                id="editor-profile-image"
                value={content.profileImageUrl ?? ''}
                onChange={(e) =>
                  updateContent((c) => ({
                    ...c,
                    profileImageUrl: e.target.value || undefined,
                  }))
                }
                placeholder="https://example.com/me.jpg"
                className={monoInput()}
              />
            </EditorField>
            <div className="grid gap-6 sm:grid-cols-2">
              <EditorField
                id="editor-email"
                label="Email"
                hint="Recommended for your portfolio and resume export."
                uniformLabelStack
              >
                <Input
                  id="editor-email"
                  type="email"
                  value={content.email ?? ''}
                  onChange={(e) => updateContent((c) => ({ ...c, email: e.target.value || undefined }))}
                  className={monoInput()}
                  aria-describedby="editor-contact-privacy-notice"
                />
              </EditorField>
              <EditorField
                id="editor-phone"
                label="Phone"
                hint="More sensitive than email — Mint (AI) may process what you save here."
                uniformLabelStack
              >
                <Input
                  id="editor-phone"
                  type="tel"
                  autoComplete="tel"
                  value={content.phone ?? ''}
                  onChange={(e) => updateContent((c) => ({ ...c, phone: e.target.value || undefined }))}
                  className={monoInput()}
                  aria-describedby="editor-contact-privacy-notice"
                />
              </EditorField>
            </div>
            <EditorSensitiveContactNotice />
            <EditorField id="editor-location" label="Location">
              <Input
                id="editor-location"
                value={content.location ?? ''}
                onChange={(e) => updateContent((c) => ({ ...c, location: e.target.value || undefined }))}
                className={monoInput()}
              />
            </EditorField>
            <div className="grid gap-6 sm:grid-cols-2">
              <EditorField id="editor-website" label="Website">
                <Input
                  id="editor-website"
                  value={content.website ?? ''}
                  onChange={(e) => updateContent((c) => ({ ...c, website: e.target.value || undefined }))}
                  className={monoInput()}
                />
              </EditorField>
              <EditorField id="editor-linkedin" label="LinkedIn">
                <Input
                  id="editor-linkedin"
                  value={content.linkedin ?? ''}
                  onChange={(e) => updateContent((c) => ({ ...c, linkedin: e.target.value || undefined }))}
                  className={monoInput()}
                />
              </EditorField>
            </div>
            <EditorField id="editor-github" label="GitHub">
              <Input
                id="editor-github"
                value={content.github ?? ''}
                onChange={(e) => updateContent((c) => ({ ...c, github: e.target.value || undefined }))}
                className={monoInput()}
              />
            </EditorField>
            <EditorField
              id="editor-bio"
              label="About"
              hint="Short summary for your portfolio. Blank lines create new paragraphs."
            >
              <textarea
                id="editor-bio"
                className={monoTextarea('min-h-[120px]')}
                value={content.bio ?? ''}
                onChange={(e) => updateContent((c) => ({ ...c, bio: e.target.value || undefined }))}
                placeholder="A brief professional summary…"
              />
            </EditorField>
            <MintImproveButton
              portfolioId={state.id}
              section="bio"
              onApply={(patch) => updateContent((c) => ({ ...c, ...patch }))}
            />
          </>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">
            Profile fields below the title will appear after your resume is parsed.
          </p>
        )}
      </EditorFormPanel>
    </div>
  );
}
