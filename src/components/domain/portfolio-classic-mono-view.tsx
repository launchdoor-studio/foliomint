import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';

import { PortfolioPublicFooter } from '@/components/domain/portfolio-public-footer';
import { PortfolioProfileLinkButtons } from '@/components/domain/portfolio-profile-link-buttons';
import { PortfolioPublicThemeToggle } from '@/components/domain/portfolio-public-theme-toggle';
import { buildPortfolioProfileLinks } from '@/lib/portfolio-profile-links';
import { getProjectLinks } from '@/lib/project-links';
import { visibleBullets, hasVisibleBullets } from '@/lib/bullet-textarea';
import {
  portfolioClassicAvatarClass,
  portfolioClassicBodyClass,
  portfolioClassicBodyFontStyle,
  portfolioClassicBrandClass,
  portfolioClassicBulletClass,
  portfolioClassicBulletDotClass,
  portfolioClassicCalloutClass,
  portfolioClassicCardClass,
  portfolioClassicCardTitleClass,
  portfolioClassicHeaderClass,
  portfolioClassicHeroNameClass,
  portfolioClassicHeroSubtitleClass,
  portfolioClassicListPrimaryClass,
  portfolioClassicListSecondaryClass,
  portfolioClassicNavLinkClass,
  portfolioClassicPageWrapClass,
  portfolioClassicSectionDescClass,
  portfolioClassicSectionHeadingClass,
  portfolioClassicTagClass,
  portfolioClassicTextLinkClass,
} from '@/lib/portfolio-classic-ui';
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

function ClassicSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('mb-14 scroll-mt-24 sm:mb-16', className)}>
      <h2 className={portfolioClassicSectionHeadingClass()}>{title}</h2>
      {description ? <p className={portfolioClassicSectionDescClass()}>{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ClassicListItem({ text }: { text: string }) {
  const trimmed = text.trim();
  const parenMatch = trimmed.match(/^(.+?)\s*(\([^)]+\))\s*$/);

  if (parenMatch) {
    return (
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={portfolioClassicListPrimaryClass()}>{parenMatch[1].trim()}</span>
        <span className={portfolioClassicListSecondaryClass()}>{parenMatch[2]}</span>
      </p>
    );
  }

  return <p className={portfolioClassicListSecondaryClass()}>{trimmed}</p>;
}

function ClassicListCard({ items }: { items: string[] }) {
  const visible = items.map((s) => s.trim()).filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <div className={cn(portfolioClassicCardClass(), 'gap-3.5')}>
      {visible.map((item, i) => (
        <ClassicListItem key={`${item}-${i}`} text={item} />
      ))}
    </div>
  );
}

function ClassicListSection({
  id,
  title,
  description,
  items,
}: {
  id?: string;
  title: string;
  description?: string;
  items: string[];
}) {
  return (
    <ClassicSection id={id} title={title} description={description}>
      <ClassicListCard items={items} />
    </ClassicSection>
  );
}

interface PortfolioClassicMonoViewProps {
  content: PortfolioContent;
  slug: string;
  siteBasePath: string;
  showBlogLink?: boolean;
  socialLinks?: SocialLink[];
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
  const brandLabel = displayName.split(/\s+/)[0] || displayName;

  const navItems = [
    content.projects?.length ? { label: 'Projects', href: '#projects' } : null,
    sortedExperience.length ? { label: 'Experience', href: '#experience' } : null,
    showBlogLink ? { label: 'Blog', href: `${siteBasePath}/blog` } : null,
  ].filter((item): item is { label: string; href: string } => item !== null);

  const avatarSize = narrowLayout ? 'sm' : 'md';

  return (
    <div
      className="portfolio-surface min-h-full antialiased text-[var(--portfolio-fg)]"
      style={portfolioClassicBodyFontStyle()}
    >
      <div className={portfolioClassicPageWrapClass(narrowLayout)}>
        {/* Header */}
        <header className={portfolioClassicHeaderClass()}>
          <span className={portfolioClassicBrandClass()}>{brandLabel}</span>
          <div className="flex shrink-0 items-center gap-4 sm:gap-5">
            {!narrowLayout ? (
              <nav className="flex items-center gap-4 sm:gap-5">
                {navItems.map((item) =>
                  item.href.startsWith('/') ? (
                    <Link key={item.label} href={item.href} className={portfolioClassicNavLinkClass()}>
                      {item.label}
                    </Link>
                  ) : (
                    <a key={item.label} href={item.href} className={portfolioClassicNavLinkClass()}>
                      {item.label}
                    </a>
                  ),
                )}
              </nav>
            ) : null}
            <PortfolioPublicThemeToggle variant="classic" />
          </div>
        </header>

        {/* Intro */}
        <section className="mb-12 sm:mb-14">
          <div className="flex items-start gap-4">
            {content.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.profileImageUrl}
                alt={displayName}
                className={portfolioClassicAvatarClass(avatarSize)}
              />
            ) : (
              <div
                className={cn(
                  portfolioClassicAvatarClass(avatarSize),
                  'flex items-center justify-center bg-[color-mix(in_srgb,var(--portfolio-fg)_6%,var(--portfolio-bg))] font-mono text-lg font-bold text-[var(--portfolio-fg-muted)]',
                )}
              >
                {initial}
              </div>
            )}
            <div className="min-w-0 pt-0.5">
              <h1 className={portfolioClassicHeroNameClass()}>{brandLabel}</h1>
              <p className={portfolioClassicHeroSubtitleClass()}>{displayName}</p>
            </div>
          </div>

          {(bioParagraphs.length > 0 || content.headline) && (
            <div className="mt-8 space-y-5">
              {bioParagraphs.map((p, i) => (
                <p key={i} className={portfolioClassicBodyClass()}>
                  {p}
                </p>
              ))}
              {content.headline ? (
                <blockquote className={portfolioClassicCalloutClass()}>{content.headline}</blockquote>
              ) : null}
            </div>
          )}

          {content.location ? (
            <p className="mt-6 flex items-center gap-2 text-sm text-[var(--portfolio-fg-muted)] [font-family:var(--classic-body-font)]">
              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" />
              {content.location}
            </p>
          ) : null}

          {profileLinks.length > 0 ? (
            <PortfolioProfileLinkButtons links={profileLinks} neu={false} className="mt-6" />
          ) : null}
        </section>

        {/* Projects — 2-col grid like reference */}
        {content.projects && content.projects.length > 0 && (
          <ClassicSection
            id="projects"
            title="Featured Projects"
            description="Selected work — tools, systems, and things shipped."
          >
            <div className={cn('grid gap-4', !narrowLayout && 'sm:grid-cols-2')}>
              {content.projects.map((project, idx) => {
                const links = getProjectLinks(project);
                const primaryLink = links[0];
                const href = primaryLink ? normalizeOutboundHref(primaryLink.url) : null;
                return (
                  <article key={`proj-${idx}`} className={portfolioClassicCardClass()}>
                    <h3 className={portfolioClassicCardTitleClass()}>{project.name}</h3>
                    {project.description ? (
                      <p className={cn('mt-3 flex-1', portfolioClassicBodyClass())}>{project.description}</p>
                    ) : null}
                    {project.technologies && project.technologies.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <span key={tech} className={portfolioClassicTagClass()}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer" className={portfolioClassicTextLinkClass()}>
                        View Project
                        <ArrowUpRight className="size-3.5" aria-hidden />
                      </a>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </ClassicSection>
        )}

        {/* Experience */}
        {sortedExperience.length > 0 && (
          <ClassicSection
            id="experience"
            title="Experience"
            description="Roles, teams, and what I worked on."
          >
            <div className="space-y-4">
              {sortedExperience.map((exp, idx) => {
                const dateStr = `${exp.startDate}${exp.endDate ? ` — ${exp.endDate}` : ' — Present'}`;
                return (
                  <article key={`exp-${idx}`} className={portfolioClassicCardClass()}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className={portfolioClassicCardTitleClass()}>{exp.role}</h3>
                      <span className="font-mono text-[11px] tabular-nums text-[var(--portfolio-fg-muted)]">
                        {dateStr}
                      </span>
                    </div>
                    <p className={cn('mt-1.5', portfolioClassicBodyClass())}>{exp.company}</p>
                    {exp.location ? (
                      <p className="mt-2">
                        <span className={portfolioClassicTagClass()}>{exp.location}</span>
                      </p>
                    ) : null}
                    {hasVisibleBullets(exp.bullets) ? (
                      <ul className="mt-4 space-y-2 border-t border-[var(--portfolio-border)] pt-4">
                        {visibleBullets(exp.bullets).map((b, i) => (
                          <li key={i} className={portfolioClassicBulletClass()}>
                            <span className={portfolioClassicBulletDotClass()} aria-hidden />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </ClassicSection>
        )}

        {content.education && content.education.length > 0 && (
          <ClassicSection id="education" title="Education">
            <div className="space-y-4">
              {content.education.map((edu, idx) => (
                <article key={`edu-${idx}`} className={portfolioClassicCardClass()}>
                  <h3 className={portfolioClassicCardTitleClass()}>{edu.institution}</h3>
                  <p className={cn('mt-1.5', portfolioClassicBodyClass())}>
                    {edu.degree}
                    {edu.field ? ` · ${edu.field}` : ''}
                  </p>
                  <p className="mt-2 font-mono text-[11px] tabular-nums text-[var(--portfolio-fg-muted)]">
                    {edu.startDate}
                    {edu.endDate ? ` — ${edu.endDate}` : ''}
                    {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </p>
                </article>
              ))}
            </div>
          </ClassicSection>
        )}

        {content.skills && content.skills.length > 0 && (
          <ClassicSection id="skills" title="Skills" description="Languages, frameworks, and tooling.">
            <div className="flex flex-wrap gap-2">
              {content.skills.map((skill) => (
                <span key={skill} className={portfolioClassicTagClass()}>
                  {skill}
                </span>
              ))}
            </div>
          </ClassicSection>
        )}

        {content.awards && content.awards.filter(Boolean).length > 0 && (
          <ClassicListSection
            title="Awards"
            description="Honors, prizes, and recognition."
            items={content.awards.filter(Boolean)}
          />
        )}

        {content.extracurricular && content.extracurricular.length > 0 && (
          <ClassicSection title="Extracurricular">
            <div className="space-y-4">
              {content.extracurricular.map((block, idx) => (
                <article key={`ex-${idx}`} className={portfolioClassicCardClass()}>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--portfolio-fg-muted)]">
                    {block.title}
                  </p>
                  {hasVisibleBullets(block.bullets) ? (
                    <ul className="mt-3 space-y-2">
                      {visibleBullets(block.bullets).map((b, i) => (
                        <li key={i} className={portfolioClassicBulletClass()}>
                          <span className={portfolioClassicBulletDotClass()} aria-hidden />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </ClassicSection>
        )}

        {content.certifications && content.certifications.filter(Boolean).length > 0 && (
          <ClassicListSection
            title="Certifications"
            description="Credentials and completed programs."
            items={content.certifications.filter(Boolean)}
          />
        )}

        {content.languages && content.languages.filter(Boolean).length > 0 && (
          <ClassicListSection
            id="languages"
            title="Languages"
            description="Spoken languages and proficiency."
            items={content.languages.filter(Boolean)}
          />
        )}

        {content.otherSections && content.otherSections.length > 0 && (
          <section className="mb-14 space-y-10 sm:mb-16">
            {content.otherSections.map((block, idx) => (
              <ClassicSection key={`other-${idx}`} title={block.title || 'More'}>
                {hasVisibleBullets(block.bullets) ? (
                  <ClassicListCard items={visibleBullets(block.bullets)} />
                ) : null}
              </ClassicSection>
            ))}
          </section>
        )}

        {!narrowLayout ? (
          <footer className="mt-12 border-t border-[var(--portfolio-border)] pt-8">
            <PortfolioPublicFooter neu={false} label="Published profile" />
          </footer>
        ) : null}
      </div>
    </div>
  );
}
