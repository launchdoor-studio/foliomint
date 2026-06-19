import type { PortfolioContent } from '@foliomint/core';
import { normalizeOutboundHref, normalizePortfolioAccent } from '@foliomint/core';

export function ClassicPortfolioPreview({
  content,
  accentColor,
  narrowLayout = true,
}: {
  content: PortfolioContent;
  accentColor?: string | null;
  narrowLayout?: boolean;
}) {
  const accent = normalizePortfolioAccent(accentColor);
  const name = content.name?.trim() || 'Portfolio';

  return (
    <div
      className="min-h-[480px] overflow-auto rounded-lg border bg-zinc-50 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
      style={{ ['--portfolio-accent' as string]: accent }}
    >
      <div className={`mx-auto max-w-2xl px-5 pb-12 ${narrowLayout ? 'pt-4' : 'pt-8'}`}>
        <header className="mb-8 border-b border-zinc-200 pb-4 dark:border-zinc-700">
          <h1 className="text-xl font-bold">{name}</h1>
          {content.location ? <p className="text-sm text-zinc-500">{content.location}</p> : null}
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {content.email ? (
              <a href={`mailto:${content.email}`} style={{ color: accent }}>
                Email
              </a>
            ) : null}
            {content.website ? (
              <a href={normalizeOutboundHref(content.website)} style={{ color: accent }}>
                Website
              </a>
            ) : null}
            {content.github ? (
              <a href={normalizeOutboundHref(content.github)} style={{ color: accent }}>
                GitHub
              </a>
            ) : null}
          </div>
        </header>
        {content.bio ? (
          <section className="mb-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">About</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content.bio}</p>
          </section>
        ) : null}
        {content.experience?.length ? (
          <section className="mb-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Experience</h2>
            {content.experience.map((exp, i) => (
              <div key={i} className="mb-3 text-sm">
                <p className="font-semibold">{exp.role}</p>
                <p className="text-zinc-500">{exp.company}</p>
              </div>
            ))}
          </section>
        ) : null}
        {content.skills?.length ? (
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {content.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border px-2 py-0.5 text-xs"
                  style={{ borderColor: accent, color: accent }}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
