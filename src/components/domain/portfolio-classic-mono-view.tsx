import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { PortfolioPublicFooter } from '@/components/domain/portfolio-public-footer';
import { PortfolioProfileLinkButtons } from '@/components/domain/portfolio-profile-link-buttons';
import { PortfolioPublicThemeToggle } from '@/components/domain/portfolio-public-theme-toggle';
import { buildPortfolioProfileLinks } from '@/lib/portfolio-profile-links';
import type { SocialLink } from '@/lib/social-links';
import { cn, normalizeOutboundHref } from '@/lib/utils';
import type { PortfolioContent } from '@/types';

function parsePortfolioDate(value?: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const raw = value.trim();
  if (!raw) return Number.NEGATIVE_INFINITY;
  if (/present|current|now/i.test(raw)) return Number.POSITIVE_INFINITY;
  const direct = Date.parse(raw);
  if (!Number.isNaN(direct)) return direct;
  const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) return Date.parse(`${yearMatch[0]}-01-01`);
  return Number.NEGATIVE_INFINITY;
}

function sortExperienceMostRecentFirst(experience: PortfolioContent['experience']) {
  return [...experience].sort((a, b) => {
    const aEnd = parsePortfolioDate(a.endDate);
    const bEnd = parsePortfolioDate(b.endDate);
    if (aEnd !== bEnd) return bEnd - aEnd;
    const aStart = parsePortfolioDate(a.startDate);
    const bStart = parsePortfolioDate(b.startDate);
    if (aStart !== bStart) return bStart - aStart;
    return 0;
  });
}

function splitBioParagraphs(bio?: string | null): string[] {
  if (!bio) return [];
  return bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 border-b border-zinc-200 pb-2 text-lg font-bold tracking-tight text-zinc-900 dark:border-zinc-700 dark:text-zinc-100 sm:text-xl">
      {children}
    </h2>
  );
}

interface PortfolioClassicMonoViewProps {
  content: PortfolioContent;
  slug: string;
  siteBasePath: string;
  showBlogLink?: boolean;
  socialLinks?: SocialLink[];
  /**
   * Editor / narrow embed: avoid viewport `md:`/`sm:` side-by-side layouts that break when the
   * preview panel is only ~400–600px wide while the window is large.
   */
  narrowLayout?: boolean;
}

export function PortfolioClassicMonoView({
  content,
  slug,
  siteBasePath,
  showBlogLink,
  socialLinks = [],
  narrowLayout = false,
}: PortfolioClassicMonoViewProps) {
  const sortedExperience = content.experience ? sortExperienceMostRecentFirst(content.experience) : [];
  const bioParagraphs = splitBioParagraphs(content.bio);
  const profileLinks = buildPortfolioProfileLinks(content, socialLinks);
  const displayName = content.name?.trim() || slug;
  const initial = displayName.charAt(0).toUpperCase() || '?';
  const navItems = [
    bioParagraphs.length > 0 ? { label: 'About', href: '#about' } : null,
    sortedExperience.length ? { label: 'Experience', href: '#experience' } : null,
    content.education?.length ? { label: 'Education', href: '#education' } : null,
    content.projects?.length ? { label: 'Projects', href: '#projects' } : null,
    content.skills?.length ? { label: 'Skills', href: '#skills' } : null,
    showBlogLink ? { label: 'Blog', href: `${siteBasePath}/blog` } : null,
  ].filter((item): item is { label: string; href: string } => item !== null);
  const mobileBlogItem = navItems.find((item) => item.label === 'Blog');

  const skillsEyebrow = content.skills?.length
    ? content.skills.slice(0, 6).join(' · ')
    : null;

  return (
    <div className="min-h-full text-zinc-800 antialiased dark:text-zinc-200">
      <div
        className={cn(
          'mx-auto max-w-2xl px-5 pb-20 sm:px-8 lg:max-w-3xl',
          narrowLayout ? 'pt-4 pb-12' : 'pt-8 lg:pt-12',
        )}
      >
        <header
          className={cn(
            'mb-10 flex border-b border-zinc-200 pb-6 dark:border-zinc-700',
            narrowLayout
              ? 'flex-col gap-4'
              : 'flex-row items-center justify-between gap-3 sm:gap-4',
          )}
        >
          <span
            className={cn(
              'min-w-0 text-sm font-bold text-zinc-900 dark:text-zinc-100',
              narrowLayout ? 'break-words' : 'min-w-0 flex-1 truncate pr-2',
            )}
          >
            {displayName}
          </span>
          <div className="flex min-w-0 shrink-0 flex-nowrap items-center justify-end gap-x-3 sm:gap-x-4 md:gap-x-5">
            {mobileBlogItem ? (
              <Link
                href={mobileBlogItem.href}
                className="box-border inline-flex h-10 max-h-10 min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-none border border-zinc-300 bg-white px-3 text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-zinc-600 !shadow-none transition-colors hover:border-[var(--portfolio-accent)] hover:text-[var(--portfolio-accent)] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 sm:hidden"
              >
                {mobileBlogItem.label}
              </Link>
            ) : null}

            <nav className="hidden max-w-full flex-wrap items-center justify-end gap-x-3 gap-y-2 text-zinc-500 sm:flex sm:gap-x-4 md:gap-x-5 lg:gap-x-4 xl:gap-x-5">
              {navItems.map((item) =>
                item.href.startsWith('/') ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:text-[var(--portfolio-accent)] md:tracking-[0.18em] lg:tracking-[0.2em]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:text-[var(--portfolio-accent)] md:tracking-[0.18em] lg:tracking-[0.2em]"
                  >
                    {item.label}
                  </a>
                ),
              )}
            </nav>

            <PortfolioPublicThemeToggle variant="classic" />
          </div>
        </header>

        <section
          className={cn(
            'mb-14 border-b border-zinc-200 pb-12 dark:border-zinc-700 sm:mb-16 sm:pb-14',
            narrowLayout
              ? 'flex flex-col gap-6'
              : 'flex flex-col gap-8 sm:flex-row-reverse sm:items-start sm:justify-between sm:gap-10 lg:gap-14',
          )}
        >
          <div className={cn('shrink-0', !narrowLayout && 'sm:pt-1')}>
            {content.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.profileImageUrl}
                alt={displayName}
                className={cn(
                  'border border-zinc-300 object-cover dark:border-zinc-600',
                  narrowLayout ? 'h-20 w-20' : 'h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32',
                )}
              />
            ) : (
              <div
                className={cn(
                  'flex items-center justify-center border border-zinc-300 font-bold text-zinc-400 dark:border-zinc-600 dark:text-zinc-500',
                  narrowLayout ? 'h-20 w-20 text-xl' : 'h-24 w-24 text-2xl sm:h-28 sm:w-28 md:h-32 md:w-32',
                )}
              >
                {initial}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            {skillsEyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">{skillsEyebrow}</p>
            ) : null}
            <h1
              className={cn(
                'break-words font-bold leading-tight tracking-tight text-zinc-950 dark:text-zinc-50',
                narrowLayout ? 'text-2xl' : 'text-[clamp(1.75rem,3vw+0.5rem,3rem)]',
              )}
            >
              {displayName}
            </h1>
            {content.headline ? (
              <p className="max-w-xl text-base font-semibold leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-lg">
                {content.headline}
              </p>
            ) : null}
            {content.location ? (
              <p className="flex items-center gap-2 text-sm text-zinc-500">
                <MapPin className="h-4 w-4 shrink-0" />
                {content.location}
              </p>
            ) : null}
            {profileLinks.length > 0 ? (
              <PortfolioProfileLinkButtons links={profileLinks} neu={false} className="pt-2" />
            ) : null}
          </div>
        </section>

        {bioParagraphs.length > 0 && (
          <section id="about" className="mb-14 scroll-mt-24 sm:mb-16">
            <SectionTitle>About</SectionTitle>
            <div className="max-w-prose space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-[15px] sm:leading-[1.75]">
              {bioParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {sortedExperience.length > 0 && (
          <section id="experience" className="mb-14 scroll-mt-24 sm:mb-16">
            <SectionTitle>Work experience</SectionTitle>
            <div className="space-y-10 sm:space-y-12">
              {sortedExperience.map((exp, idx) => {
                const dateStr = `${exp.startDate}${exp.endDate ? ` — ${exp.endDate}` : ' — Present'}`;
                return (
                  <article key={`exp-${idx}`}>
                    <div
                      className={cn(
                        'flex flex-col gap-2',
                        !narrowLayout && 'sm:flex-row sm:items-baseline sm:justify-between sm:gap-4',
                      )}
                    >
                      <h3
                        className={cn(
                          'font-bold text-zinc-900 dark:text-zinc-100',
                          narrowLayout ? 'text-base' : 'text-base sm:text-lg',
                        )}
                      >
                        {exp.role}
                      </h3>
                      {exp.location ? (
                        <span className="w-fit shrink-0 border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
                          {exp.location}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-500">{exp.company}</p>
                    <p className="mt-2 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-600">{dateStr}</p>
                    {exp.bullets && exp.bullets.length > 0 ? (
                      <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:mt-5">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" aria-hidden />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {content.education && content.education.length > 0 && (
          <section id="education" className="mb-14 scroll-mt-24 sm:mb-16">
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-8">
              {content.education.map((edu, idx) => (
                <article key={`edu-${idx}`}>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 sm:text-lg">{edu.institution}</h3>
                  <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-500">
                    {edu.degree}
                    {edu.field ? ` · ${edu.field}` : ''}
                  </p>
                  <p className="mt-2 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-600">
                    {edu.startDate}
                    {edu.endDate ? ` — ${edu.endDate}` : ''}
                    {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {content.projects && content.projects.length > 0 && (
          <section id="projects" className="mb-14 scroll-mt-24 sm:mb-16">
            <SectionTitle>Projects</SectionTitle>
            <div className="space-y-10 sm:space-y-12">
              {content.projects.map((project, idx) => (
                <article key={`proj-${idx}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 sm:text-lg">{project.name}</h3>
                    {project.url ? (
                      <a
                        href={normalizeOutboundHref(project.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-xs font-bold text-[var(--portfolio-accent)] underline underline-offset-4 hover:opacity-90"
                      >
                        Open link
                      </a>
                    ) : null}
                  </div>
                  {project.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:mt-3">{project.description}</p>
                  ) : null}
                  {project.bullets && project.bullets.length > 0 ? (
                    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {project.bullets.map((b, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" aria-hidden />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        )}

        {content.skills && content.skills.length > 0 && (
          <section id="skills" className="mb-14 scroll-mt-24 sm:mb-16">
            <SectionTitle>Skills</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {content.skills.map((skill) => (
                <span
                  key={skill}
                  className="border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium leading-none text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {content.awards && content.awards.filter(Boolean).length > 0 && (
          <section className="mb-14 sm:mb-16">
            <SectionTitle>Awards</SectionTitle>
            <ul className="space-y-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {content.awards.filter(Boolean).map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" aria-hidden />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {content.extracurricular && content.extracurricular.length > 0 && (
          <section className="mb-14 sm:mb-16">
            <SectionTitle>Extracurricular</SectionTitle>
            <div className="space-y-8">
              {content.extracurricular.map((block, idx) => (
                <article key={`ex-${idx}`}>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{block.title}</h3>
                  {block.bullets.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {block.bullets.map((b, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" aria-hidden />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        )}

        {content.otherSections && content.otherSections.length > 0 && (
          <section className="mb-14 space-y-12 sm:mb-16">
            {content.otherSections.map((block, idx) => (
              <div key={`other-${idx}`}>
                <SectionTitle>{block.title || 'Section'}</SectionTitle>
                {block.bullets.length > 0 ? (
                  <ul className="space-y-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {block.bullets.map((b, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        )}

        {!narrowLayout ? (
          <div className="mt-16 border-t border-zinc-200 bg-zinc-100/80 px-5 py-6 sm:mt-20 sm:px-6 sm:py-8 dark:border-zinc-800 dark:bg-zinc-900/50">
            <PortfolioPublicFooter neu={false} label="Published profile" band />
          </div>
        ) : null}
      </div>
    </div>
  );
}
