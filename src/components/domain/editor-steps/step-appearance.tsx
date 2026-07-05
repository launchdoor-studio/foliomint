'use client';

import { Input } from '@/components/ui/input';
import { EditorField, EditorFormPanel } from '@/components/domain/editor-form-ui';
import type { EditorStepContext } from '@/components/domain/editor-step-context';
import { PortfolioThemeColorsPanel } from '@/components/domain/portfolio-theme-colors-panel';
import { PortfolioThemePicker } from '@/components/domain/portfolio-theme-picker';
import { normalizePortfolioAccent } from '@/lib/portfolio-accent';

export function EditorStepAppearance(ctx: EditorStepContext) {
  const { state, setState, handleSave, saving, monoInput, tier } = ctx;

  return (
    <div className="space-y-6">
      <EditorFormPanel title="Portfolio style">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Choose how your published site looks to visitors. Switch anytime — your content stays the same.
        </p>
        <PortfolioThemePicker
          value={state.theme}
          tier={tier}
          saving={saving}
          onSelect={(theme) => {
            setState((prev) => (prev ? { ...prev, theme } : prev));
            void handleSave({ theme });
          }}
        />
      </EditorFormPanel>

      <EditorFormPanel title="Accent & canvas">
        <p className="text-sm leading-relaxed text-muted-foreground">
          These colors apply to your published portfolio. Accent drives links, chips, and highlights.
          Background and text colors switch automatically when visitors toggle light or dark on your live
          site (independent of the FolioMint dashboard theme).
        </p>
        <EditorField
          id="editor-accent-color"
          label="Portfolio accent"
          hint="Used for highlights and links on your public site."
        >
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              aria-label="Pick accent color"
              className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
              value={normalizePortfolioAccent(state.accentColor)}
              onChange={(e) => void handleSave({ accentColor: e.target.value })}
              disabled={saving}
            />
            <Input
              id="editor-accent-color-hex"
              className={monoInput('max-w-[9.5rem]')}
              value={state.accentColor ?? ''}
              placeholder="#34d399"
              spellCheck={false}
              onChange={(e) =>
                setState((prev) => (prev ? { ...prev, accentColor: e.target.value || null } : prev))
              }
              onBlur={(e) => {
                const v = e.target.value.trim() || null;
                void handleSave({ accentColor: v });
              }}
              disabled={saving}
            />
          </div>
        </EditorField>
        <PortfolioThemeColorsPanel
          themeColors={state.themeColors}
          setThemeColors={(themeColors) =>
            setState((prev) => (prev ? { ...prev, themeColors } : prev))
          }
          onSave={(themeColors) => void handleSave({ themeColors })}
          saving={saving}
          monoInput={monoInput}
        />
      </EditorFormPanel>
    </div>
  );
}
