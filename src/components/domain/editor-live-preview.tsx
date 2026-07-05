'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { PortfolioClassicMonoView } from '@/components/domain/portfolio-classic-mono-view';
import { PortfolioProfileLinkButtons } from '@/components/domain/portfolio-profile-link-buttons';
import { PortfolioProjectLinkChips } from '@/components/domain/portfolio-project-link-chips';
import { PortfolioPublicShell } from '@/components/domain/portfolio-public-shell';
import { sanitizeImageUrl } from '@/lib/safe-url';
import { buildPortfolioProfileLinks } from '@/lib/portfolio-profile-links';
import { cn } from '@/lib/utils';
import {
  PORTFOLIO_CARD_PAD,
  portfolioBulletDotClass,
  portfolioBulletLineClass,
  portfolioCardClass,
  portfolioSectionAccentClass,
  portfolioSectionTitleRowClass,
  portfolioSkillChipClass,
} from '@/lib/portfolio-public-ui';
import { portfolioSiteBasePath } from '@/lib/public-handle';
import type { PortfolioThemeColors } from '@/lib/portfolio-theme-colors';
import { visibleBullets, hasVisibleBullets } from '@/lib/bullet-textarea';
import type { SocialLink } from '@/lib/social-links';
import type { PortfolioContent } from '@/types';

function PreviewSiteLink({
  isPublished,
  portfolioId,
  siteBasePath,
  className,
}: {
  isPublished: boolean;
  portfolioId: string;
  siteBasePath: string;
  className?: string;
}) {
  const href = isPublished ? siteBasePath : `/preview/${portfolioId}`;
  const label = isPublished ? 'Open published site' : 'Preview draft';

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'font-bold text-[var(--portfolio-accent)] underline decoration-2 underline-offset-4 hover:opacity-90',
        className,
      )}
    >
      {label}
    </Link>
  );
}

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

function SectionHeading({ children, neu }: { children: React.ReactNode; neu: boolean }) {
  return (
    <h2 className={cn(portfolioSectionTitleRowClass(neu), 'mb-5 text-lg sm:text-[1.35rem]')}>
      <span className={portfolioSectionAccentClass(neu)} aria-hidden />
      {children}
    </h2>
  );
}

function PortfolioBulletList({
  items,
  neu,
  dense,
}: {
  items: string[];
  neu: boolean;
  dense?: boolean;
}) {
  const visible = visibleBullets(items);
  return (
    <ul className={dense ? 'space-y-1.5' : 'space-y-2'}>
      {visible.map((b, i) => (
        <li key={i} className={cn(portfolioBulletLineClass(neu), dense && 'text-[13px] leading-relaxed')}>
          <span className={portfolioBulletDotClass(neu)} aria-hidden />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function NeubrutalismPreview({
  content,
  slug,
  siteBasePath,
  narrowLayout,
  isPublished,
  portfolioId,
  socialLinks = [],
}: {
  content: PortfolioContent;
  slug: string;
  siteBasePath: string;
  narrowLayout?: boolean;
  isPublished: boolean;
  portfolioId: string;
  socialLinks?: SocialLink[];
}) {
  const neu = true;
  const sortedExperience = sortExperienceMostRecentFirst(content.experience ?? []);
  const displayName = content.name?.trim() || slug;
  const initial = displayName.charAt(0).toUpperCase() || '?';
  const profileLinks = buildPortfolioProfileLinks(content, socialLinks);
  const profileImageUrl = sanitizeImageUrl(content.profileImageUrl);
  const card = portfolioCardClass(neu);
  const pad = PORTFOLIO_CARD_PAD;

  return (
    <div className="text-[var(--portfolio-fg)]">
      <header className={cn('border-b border-[var(--portfolio-border)] pb-6 dark:border-zinc-600/80')}>
        <div
          className={cn(
            'flex flex-col gap-6',
            !narrowLayout && 'sm:flex-row sm:items-start sm:gap-8',
          )}
        >
          <div className="shrink-0">
            {profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImageUrl}
                alt={displayName}
                className={cn(
                  'border-4 border-[var(--portfolio-fg)] object-cover shadow-[6px_6px_0_0_rgb(24_24_27)] dark:border-[var(--portfolio-border)] dark:shadow-[6px_6px_0_0_rgb(228_228_231)]',
                  narrowLayout ? 'h-16 w-16' : 'h-20 w-20 sm:h-24 sm:w-24',
                )}
              />
            ) : (
              <div
                className={cn(
                  'flex items-center justify-center border-4 border-[var(--portfolio-fg)] bg-[var(--portfolio-accent-softer)] font-bold text-[var(--portfolio-accent)] shadow-[6px_6px_0_0_rgb(24_24_27)] dark:border-[var(--portfolio-border)] dark:shadow-[6px_6px_0_0_rgb(228_228_231)]',
                  narrowLayout ? 'h-16 w-16 text-lg' : 'h-20 w-20 text-xl sm:h-24 sm:w-24 sm:text-2xl',
                )}
                aria-hidden
              >
                {initial}
              </div>
            )}
          </div>
          <div className="min-w-0 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--portfolio-accent)]">
              Portfolio
            </p>
            <h1
              className={cn(
                'break-words font-semibold uppercase tracking-[0.06em] text-[var(--portfolio-fg)]',
                narrowLayout ? 'text-xl' : 'text-2xl sm:text-3xl',
              )}
            >
              {displayName}
            </h1>
            {content.bio && (
              <p className="max-w-2xl text-pretty text-sm font-medium leading-relaxed text-[var(--portfolio-fg-muted)] sm:text-base">
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

      <div className="portfolio-surface mt-10 space-y-12 sm:mt-12 sm:space-y-16 lg:mt-14 lg:space-y-20">
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
            <div className="space-y-4">
              {sortedExperience.map((exp, idx) => {
                const dateStr = `${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ' – Present'}`;
                return (
                  <div key={`editor-neu-exp-${idx}`} className={cn(card, pad)}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold uppercase leading-tight text-[var(--portfolio-fg)]">
                          {exp.role}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-[var(--portfolio-fg-muted)]">{exp.company}</p>
                      </div>
                      <p className="shrink-0 border-2 border-[var(--portfolio-fg)] bg-white px-2 py-1 text-xs font-bold text-zinc-900 dark:border-[var(--portfolio-border)] dark:bg-zinc-950 dark:text-zinc-100">
                        {dateStr}
                      </p>
                    </div>
                    {hasVisibleBullets(exp.bullets) && (
                      <div className="mt-4 border-t-2 border-[var(--portfolio-border)] pt-4 dark:border-zinc-700">
                        <PortfolioBulletList items={exp.bullets} neu={neu} dense />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {content.education.map((edu, idx) => (
                <div key={`${edu.institution}-${idx}`} className={cn(card, pad)}>
                  <h3 className="text-base font-semibold leading-snug text-[var(--portfolio-fg)]">{edu.institution}</h3>
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
            <div className="grid grid-cols-1 gap-4">
              {content.projects.map((project, idx) => (
                <div key={`${project.name}-${idx}`} className={cn('flex flex-col', card, pad)}>
                  <h3 className="text-base font-semibold leading-snug text-[var(--portfolio-fg)]">{project.name}</h3>
                  {project.description ? (
                    <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--portfolio-fg-muted)]">
                      {project.description}
                    </p>
                  ) : null}
                  <PortfolioProjectLinkChips project={project} neu={neu} className="mt-3" />
                  {project.technologies && project.technologies.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span key={tech} className={portfolioSkillChipClass(neu)}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {hasVisibleBullets(project.bullets) ? (
                    <div className="mt-4">
                      <PortfolioBulletList items={project.bullets} neu={neu} dense />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {content.awards && content.awards.filter(Boolean).length > 0 && (
          <section>
            <SectionHeading neu={neu}>Awards</SectionHeading>
            <div className={cn(card, pad)}>
              <PortfolioBulletList items={content.awards.filter(Boolean)} neu={neu} />
            </div>
          </section>
        )}

        {content.extracurricular && content.extracurricular.length > 0 && (
          <section>
            <SectionHeading neu={neu}>Extracurricular</SectionHeading>
            <div className="space-y-4">
              {content.extracurricular.map((block, idx) => (
                <div key={`${block.title}-${idx}`} className={cn(card, pad)}>
                  <h3 className="text-sm font-semibold text-[var(--portfolio-fg)]">{block.title}</h3>
                  {hasVisibleBullets(block.bullets) && (
                    <div className="mt-3">
                      <PortfolioBulletList items={block.bullets} neu={neu} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {content.otherSections && content.otherSections.length > 0 && (
          <section className="space-y-10">
            {content.otherSections.map((block, idx) => (
              <div key={`${block.title}-${idx}`}>
                <SectionHeading neu={neu}>{block.title}</SectionHeading>
                {hasVisibleBullets(block.bullets) && (
                  <div className={cn(card, pad)}>
                    <PortfolioBulletList items={block.bullets} neu={neu} />
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>

      <p className="mt-8 border-t border-[var(--portfolio-border)] pt-4 text-center text-[10px] uppercase tracking-[0.14em] text-zinc-600 dark:border-zinc-700 dark:text-[var(--portfolio-fg-muted)]">
        <PreviewSiteLink
          isPublished={isPublished}
          portfolioId={portfolioId}
          siteBasePath={siteBasePath}
        />
      </p>
    </div>
  );
}

export function EditorLivePreview({
  content,
  slug,
  publicHandle,
  theme,
  accentColor,
  themeColors,
  isPublished,
  portfolioId,
  socialLinks = [],
}: {
  content: PortfolioContent | null;
  slug: string;
  publicHandle?: string | null;
  theme: string;
  accentColor: string | null;
  themeColors: PortfolioThemeColors;
  isPublished: boolean;
  portfolioId: string;
  socialLinks?: SocialLink[];
}) {
  if (!content) {
    return (
      <p className="text-sm text-muted-foreground">
        Content will appear here after your resume is parsed.
      </p>
    );
  }

  const neu = theme === 'neubrutalism';
  const siteBasePath = portfolioSiteBasePath({ publicHandle: publicHandle ?? null, slug });

  return (
    <PortfolioPublicShell accentColor={accentColor} themeColors={themeColors} theme={theme} embed>
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        {neu ? (
          <NeubrutalismPreview
            content={content}
            slug={slug}
            siteBasePath={siteBasePath}
            narrowLayout
            isPublished={isPublished}
            portfolioId={portfolioId}
            socialLinks={socialLinks}
          />
        ) : (
          <>
            <PortfolioClassicMonoView
              content={content}
              slug={slug}
              siteBasePath={siteBasePath}
              showBlogLink={false}
              socialLinks={socialLinks}
              narrowLayout
            />
            <p className="mt-4 border-t border-[var(--portfolio-border)] pt-3 text-center text-[10px] uppercase tracking-wider text-zinc-600 dark:border-zinc-700 dark:text-[var(--portfolio-fg-muted)]">
              <PreviewSiteLink
                isPublished={isPublished}
                portfolioId={portfolioId}
                siteBasePath={siteBasePath}
                className="font-semibold underline-offset-4 hover:underline"
              />
            </p>
          </>
        )}
      </div>
    </PortfolioPublicShell>
  );
}
