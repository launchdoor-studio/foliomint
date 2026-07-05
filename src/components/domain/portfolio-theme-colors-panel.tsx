'use client';

import { Input } from '@/components/ui/input';
import { EditorField } from '@/components/domain/editor-form-ui';
import { normalizePortfolioAccent, sanitizePortfolioAccentForStorage } from '@/lib/portfolio-accent';
import {
  DEFAULT_PORTFOLIO_THEME_COLORS,
  resolvePortfolioThemeColors,
  type PortfolioThemeColors,
} from '@/lib/portfolio-theme-colors';

type ColorKey = keyof PortfolioThemeColors;

export function PortfolioThemeColorField({
  id,
  label,
  hint,
  colorKey,
  themeColors,
  setThemeColors,
  onSave,
  saving,
  monoInput,
}: {
  id: string;
  label: string;
  hint?: string;
  colorKey: ColorKey;
  themeColors: PortfolioThemeColors;
  setThemeColors: (next: PortfolioThemeColors) => void;
  onSave: (next: PortfolioThemeColors) => void | Promise<void>;
  saving: boolean;
  monoInput: (extra?: string) => string;
}) {
  const resolved = resolvePortfolioThemeColors(themeColors);
  const defaultHex = DEFAULT_PORTFOLIO_THEME_COLORS[colorKey];
  const displayValue = resolved[colorKey];

  const apply = (raw: string | null) => {
    const trimmed = raw?.trim() ?? '';
    if (trimmed === '') {
      const next = { ...themeColors, [colorKey]: null };
      setThemeColors(next);
      void onSave(next);
      return;
    }
    const sanitized = sanitizePortfolioAccentForStorage(trimmed);
    if (sanitized === null) return;
    const nextValue =
      sanitized.toLowerCase() === defaultHex.toLowerCase() ? null : sanitized;
    const next = { ...themeColors, [colorKey]: nextValue };
    setThemeColors(next);
    void onSave(next);
  };

  return (
    <EditorField id={id} label={label} hint={hint}>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          aria-label={`Pick ${label.toLowerCase()}`}
          className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
          value={normalizePortfolioAccent(displayValue)}
          onChange={(e) => apply(e.target.value)}
          disabled={saving}
        />
        <Input
          id={`${id}-hex`}
          className={monoInput('max-w-[9.5rem]')}
          value={themeColors[colorKey] ?? ''}
          placeholder={defaultHex}
          spellCheck={false}
          onChange={(e) =>
            setThemeColors({ ...themeColors, [colorKey]: e.target.value || null })
          }
          onBlur={(e) => apply(e.target.value || null)}
          disabled={saving}
        />
      </div>
    </EditorField>
  );
}

export function PortfolioThemeColorsPanel({
  themeColors,
  setThemeColors,
  onSave,
  saving,
  monoInput,
}: {
  themeColors: PortfolioThemeColors;
  setThemeColors: (next: PortfolioThemeColors) => void;
  onSave: (next: PortfolioThemeColors) => void | Promise<void>;
  saving: boolean;
  monoInput: (extra?: string) => string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Light theme
        </p>
        <div className="mt-3 space-y-6">
          <PortfolioThemeColorField
            id="editor-light-background"
            label="Background"
            hint="Page canvas when visitors use light mode on your published site."
            colorKey="lightBackground"
            themeColors={themeColors}
            setThemeColors={setThemeColors}
            onSave={onSave}
            saving={saving}
            monoInput={monoInput}
          />
          <PortfolioThemeColorField
            id="editor-light-foreground"
            label="Text"
            hint="Primary text and high-contrast borders in light mode."
            colorKey="lightForeground"
            themeColors={themeColors}
            setThemeColors={setThemeColors}
            onSave={onSave}
            saving={saving}
            monoInput={monoInput}
          />
        </div>
      </div>
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Dark theme
        </p>
        <div className="mt-3 space-y-6">
          <PortfolioThemeColorField
            id="editor-dark-background"
            label="Background"
            hint="Page canvas when visitors switch to dark mode."
            colorKey="darkBackground"
            themeColors={themeColors}
            setThemeColors={setThemeColors}
            onSave={onSave}
            saving={saving}
            monoInput={monoInput}
          />
          <PortfolioThemeColorField
            id="editor-dark-foreground"
            label="Text"
            hint="Primary text and high-contrast borders in dark mode."
            colorKey="darkForeground"
            themeColors={themeColors}
            setThemeColors={setThemeColors}
            onSave={onSave}
            saving={saving}
            monoInput={monoInput}
          />
        </div>
      </div>
    </div>
  );
}
