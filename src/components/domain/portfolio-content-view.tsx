import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { PortfolioClassicMonoView } from '@/components/domain/portfolio-classic-mono-view';
import { PortfolioProfileLinkButtons } from '@/components/domain/portfolio-profile-link-buttons';
import { PortfolioProjectLinkChips } from '@/components/domain/portfolio-project-link-chips';
import { PortfolioPublicThemeToggle } from '@/components/domain/portfolio-public-theme-toggle';
import { PortfolioPublicFooter } from '@/components/domain/portfolio-public-footer';
import { sanitizeImageUrl } from '@/lib/safe-url';
import { buildPortfolioProfileLinks } from '@/lib/portfolio-profile-links';
import { visibleBullets, hasVisibleBullets } from '@/lib/bullet-textarea';
import {
  PORTFOLIO_CARD_PAD,
  PORTFOLIO_SECTION_GAP,
  portfolioBulletDotClass,
  portfolioBulletLineClass,
  portfolioCardClass,
  portfolioContentContainerClass,
  portfolioDateBadgeClass,
  portfolioEyebrowClass,
  portfolioHeaderRuleClass,
  portfolioNavPillClass,
  portfolioSectionAccentClass,
  portfolioSectionTitleRowClass,
  portfolioShellClass,
  portfolioSkillChipClass,
} from '@/lib/portfolio-public-ui';
import { cn } from '@/lib/utils';
import type { SocialLink } from '@/lib/social-links';
import type { PortfolioContent } from '@/types';

interface PortfolioContentViewProps {
  content: PortfolioContent;
  /** Fallback label for initials / header when display name is empty (legacy slug or handle). */
  slug: string;
  /** Public URL prefix without trailing slash, e.g. `/u/alice` or `/name-abc123`. */
  siteBasePath: string;
  theme: string;
  showBlogLink?: boolean;
  socialLinks?: SocialLink[];
}

function parsePortfolioDate(value?: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;

  const raw = value.trim();
  if (!raw) return Number.NEGATIVE_INFINITY;

  if (/present|current|now/i.test(raw)) {
    return Number.POSITIVE_INFINITY;
  }

  const direct = Date.parse(raw);
  if (!Number.isNaN(direct)) {
    return direct;
  }

  const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return Date.parse(`${yearMatch[0]}-01-01`);
  }

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

function SectionHeading({ children, neu }: { children: React.ReactNode; neu: boolean }) {
  return (
    <h2 className={portfolioSectionTitleRowClass(neu)}>
      <span className={portfolioSectionAccentClass(neu)} aria-hidden />
      {children}
    </h2>
  );
}

function BulletList({ items, neu, dense }: { items: string[]; neu: boolean; dense?: boolean }) {
  const visible = visibleBullets(items);
  return (
    <ul className={dense ? 'space-y-1.5' : 'space-y-2.5'}>
      {visible.map((b, i) => (
        <li key={i} className={cn(portfolioBulletLineClass(neu), dense && 'text-[13px] leading-relaxed')}>
          <span className={portfolioBulletDotClass(neu)} aria-hidden />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

export function PortfolioContentView({
  content,
  slug,
  siteBasePath,
  theme,
  showBlogLink,
  socialLinks = [],
}: PortfolioContentViewProps) {
  const neu = theme === 'neubrutalism';
  const profileLinks = buildPortfolioProfileLinks(content, socialLinks);
  const profileImageUrl = sanitizeImageUrl(content.profileImageUrl);

  const card = portfolioCardClass(neu);
  const pad = PORTFOLIO_CARD_PAD;
  const sortedExperience = content.experience ? sortExperienceMostRecentFirst(content.experience) : [];

  if (!neu) {
    return (
      <PortfolioClassicMonoView
        content={content}
        slug={slug}
        siteBasePath={siteBasePath}
        showBlogLink={showBlogLink}
        socialLinks={socialLinks}
      />
    );
  }

  return (
    <div className={portfolioShellClass(neu)}>
      <div className={cn('relative', portfolioContentContainerClass())}>
        <div className="mb-10 flex flex-wrap items-center justify-end gap-3 sm:mb-12">
          {showBlogLink ? (
            <Link href={`${siteBasePath}/blog`} className={portfolioNavPillClass(neu)}>
              Blog
            </Link>
          ) : null}
          <PortfolioPublicThemeToggle variant="neu" />
        </div>

        <header className={portfolioHeaderRuleClass(neu)}>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10 lg:gap-14">
            <div className="shrink-0 sm:pt-1">
              {profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImageUrl}
                  alt={content.name}
                  className="h-24 w-24 rounded-none border-4 border-[var(--portfolio-fg)] object-cover shadow-[6px_6px_0_0_rgb(24_24_27)] dark:border-[var(--portfolio-border)] dark:shadow-[6px_6px_0_0_rgb(228_228_231)] sm:h-28 sm:w-28 sm:shadow-[8px_8px_0_0_rgb(24_24_27)] md:h-32 md:w-32 sm:shadow-[8px_8px_0_0_var(--portfolio-shadow)]"
                />
              ) : (
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-none border-4 border-[var(--portfolio-fg)] bg-[var(--portfolio-accent-softer)] text-2xl font-bold text-[var(--portfolio-accent)] shadow-[6px_6px_0_0_rgb(24_24_27)] dark:border-[var(--portfolio-border)] dark:shadow-[6px_6px_0_0_rgb(228_228_231)] sm:h-28 sm:w-28 sm:text-3xl sm:shadow-[8px_8px_0_0_rgb(24_24_27)] md:h-32 md:w-32 md:text-4xl sm:shadow-[8px_8px_0_0_var(--portfolio-shadow)]"
                  aria-hidden
                >
                  {(content.name?.charAt(0) || slug.charAt(0) || '?').toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-4 sm:space-y-5">
              <p className={portfolioEyebrowClass(neu)}>Portfolio</p>
              <h1 className="text-[clamp(1.75rem,3.5vw+0.5rem,3.25rem)] font-semibold uppercase leading-[1.08] tracking-[0.06em] text-[var(--portfolio-fg)]">
                {content.name || slug}
              </h1>
              {content.headline && (
                <p className="max-w-2xl text-pretty text-lg font-semibold leading-snug text-[var(--portfolio-fg)] sm:text-xl">
                  {content.headline}
                </p>
              )}
              {content.bio && (
                <p className="max-w-2xl text-pretty text-base font-medium leading-relaxed text-[var(--portfolio-fg-muted)] sm:text-lg md:text-xl">
                  {content.bio}
                </p>
              )}
              {content.location ? (
                <p className="flex items-center gap-2 text-sm font-medium text-[var(--portfolio-fg-muted)]">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  {content.location}
                </p>
              ) : null}
              {profileLinks.length > 0 ? (
                <PortfolioProfileLinkButtons links={profileLinks} neu className="pt-1" />
              ) : null}
            </div>
          </div>
        </header>

        <div className={cn('portfolio-surface', PORTFOLIO_SECTION_GAP)}>
          {content.skills && content.skills.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Skills</SectionHeading>
              <div className="flex flex-wrap gap-1.5">
                {content.skills.map((skill) => (
                  <span key={skill} className={portfolioSkillChipClass(neu)}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {sortedExperience.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Experience</SectionHeading>
              <div className="space-y-5">
                {sortedExperience.map((exp, idx) => {
                  const dateStr = `${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ' – Present'}`;

                  return (
                    <div key={`exp-${idx}`} className={cn(card, pad)}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold uppercase leading-tight tracking-tight text-[var(--portfolio-fg)] sm:text-lg">
                            {exp.role}
                          </h3>
                          <p className="mt-2 text-sm font-bold text-[var(--portfolio-fg-muted)]">{exp.company}</p>
                          {exp.location && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-none border-2 border-[var(--portfolio-fg)] bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 dark:border-[var(--portfolio-border)] dark:bg-zinc-950 dark:text-zinc-100">
                                {exp.location}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className={cn('shrink-0', portfolioDateBadgeClass(neu))}>{dateStr}</p>
                      </div>
                      {hasVisibleBullets(exp.bullets) && (
                        <div className="mt-6 border-t-2 border-[var(--portfolio-border)] pt-5 dark:border-zinc-700">
                          <BulletList items={exp.bullets} neu={neu} dense />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {content.education && content.education.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Education</SectionHeading>
              <div className={cn('grid gap-5', content.education.length > 1 && 'sm:grid-cols-2')}>
                {content.education.map((edu, idx) => (
                  <div key={`${edu.institution}-${idx}`} className={cn(card, pad)}>
                    <h3 className="text-base font-semibold leading-snug text-[var(--portfolio-fg)] sm:text-lg">{edu.institution}</h3>
                    <p className="mt-2 text-sm text-[var(--portfolio-fg-muted)]">
                      {edu.degree}
                      {edu.field ? ` · ${edu.field}` : ''}
                    </p>
                    <p className="mt-3 text-xs font-medium tabular-nums text-[var(--portfolio-fg-muted)]">
                      {edu.startDate}
                      {edu.endDate ? ` – ${edu.endDate}` : ''}
                      {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {content.projects && content.projects.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Projects</SectionHeading>
              <div className={cn('grid gap-5', content.projects.length > 1 && 'sm:grid-cols-2')}>
                {content.projects.map((project, idx) => (
                  <div key={`${project.name}-${idx}`} className={cn('flex flex-col', card, pad)}>
                    <h3 className="text-base font-semibold leading-snug text-[var(--portfolio-fg)] sm:text-lg">
                      {project.name}
                    </h3>
                    {project.description ? (
                      <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--portfolio-fg-muted)]">
                        {project.description}
                      </p>
                    ) : null}
                    <PortfolioProjectLinkChips project={project} neu={neu} className="mt-4" />
                    {project.technologies && project.technologies.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <span key={tech} className={portfolioSkillChipClass(neu)}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {hasVisibleBullets(project.bullets) ? (
                      <div className={cn(project.description || project.technologies?.length ? 'mt-5' : 'mt-4')}>
                        <BulletList items={project.bullets} neu={neu} dense />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          {content.awards && content.awards.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Awards</SectionHeading>
              <div className={cn(card, pad)}>
                <BulletList items={content.awards} neu={neu} />
              </div>
            </section>
          )}

          {content.extracurricular && content.extracurricular.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Extracurricular</SectionHeading>
              <div className="space-y-5">
                {content.extracurricular.map((block, idx) => (
                  <div key={`${block.title}-${idx}`} className={cn(card, pad)}>
                    <h3 className="text-base font-semibold text-[var(--portfolio-fg)]">{block.title}</h3>
                    {hasVisibleBullets(block.bullets) && (
                      <div className="mt-4">
                        <BulletList items={block.bullets} neu={neu} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {content.otherSections && content.otherSections.length > 0 && (
            <section className="space-y-14">
              {content.otherSections.map((block, idx) => (
                <div key={`${block.title}-${idx}`}>
                  <SectionHeading neu={neu}>{block.title}</SectionHeading>
                  {hasVisibleBullets(block.bullets) && (
                    <div className={cn(card, pad)}>
                      <BulletList items={block.bullets} neu={neu} />
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

        </div>

        <PortfolioPublicFooter neu={neu} label="Published profile" />
      </div>
    </div>
  );
}
