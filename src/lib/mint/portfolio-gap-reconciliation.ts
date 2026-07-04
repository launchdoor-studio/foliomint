import type { ResumeData } from '@/types';

export interface ProfileLinkStatus {
  email: boolean;
  phone: boolean;
  website: boolean;
  github: boolean;
  linkedin: boolean;
  profileImage: boolean;
}

export interface ProjectLinkStatus {
  total: number;
  withLinks: number;
}

export interface PortfolioGapStatus {
  /** Raw strings from resume parse — may be stale */
  parseSuggestions: string[];
  /** Still actionable given current editor content */
  openGaps: string[];
  /** Parse suggested this but the editor already satisfies it */
  resolvedGaps: string[];
  profileLinks: ProfileLinkStatus;
  projects: ProjectLinkStatus;
}

function hasProjectLinks(project: ResumeData['projects'][number]): boolean {
  if ((project.links?.length ?? 0) > 0) return true;
  const legacyUrl = (project as { url?: string }).url;
  return Boolean(typeof legacyUrl === 'string' && legacyUrl.trim());
}

export function buildProfileLinkStatus(content: ResumeData): ProfileLinkStatus {
  return {
    email: Boolean(content.email?.trim()),
    phone: Boolean(content.phone?.trim()),
    website: Boolean(content.website?.trim()),
    github: Boolean(content.github?.trim()),
    linkedin: Boolean(content.linkedin?.trim()),
    profileImage: Boolean(content.profileImageUrl?.trim()),
  };
}

export function buildProjectLinkStatus(content: ResumeData): ProjectLinkStatus {
  const projects = content.projects ?? [];
  return {
    total: projects.length,
    withLinks: projects.filter(hasProjectLinks).length,
  };
}

/** Whether a parse-time gap string is already satisfied by live portfolio content. */
export function isParseGapSatisfied(gap: string, content: ResumeData): boolean {
  const g = gap.toLowerCase();
  const links = buildProfileLinkStatus(content);
  const projects = buildProjectLinkStatus(content);

  const mentionsGithub = /\bgithub\b/.test(g);
  const mentionsLinkedin = /\blinkedin\b/.test(g);
  const mentionsSocial =
    mentionsGithub ||
    mentionsLinkedin ||
    /\bsocial\b/.test(g) ||
    /\bprofile link/.test(g);

  if (mentionsSocial) {
    if (mentionsGithub && mentionsLinkedin) {
      return links.github && links.linkedin;
    }
    if (mentionsGithub) return links.github;
    if (mentionsLinkedin) return links.linkedin;
    return links.github || links.linkedin;
  }

  if (/photo|headshot|profile image|picture/.test(g)) {
    return links.profileImage;
  }

  if (/headline/.test(g)) {
    return Boolean(content.headline?.trim());
  }

  if (/\bbio\b|summary|about me|professional summary/.test(g)) {
    return Boolean(content.bio?.trim());
  }

  if (/project link|repo link|demo link|live link|repository/.test(g)) {
    if (projects.total === 0) return false;
    return projects.withLinks > 0;
  }

  if (/\bemail\b|\bcontact\b/.test(g)) {
    return links.email || links.phone || links.website || links.github || links.linkedin;
  }

  if (/\bwebsite\b|\bportfolio site\b|\bpersonal site\b/.test(g)) {
    return links.website;
  }

  if (/\bphone\b|\bmobile\b/.test(g)) {
    return links.phone;
  }

  if (/\bskill/.test(g)) {
    return (content.skills?.length ?? 0) >= 3;
  }

  if (/quantified|metric|number|impact bullet/.test(g)) {
    return false;
  }

  return false;
}

export function reconcilePortfolioGaps(content: ResumeData): PortfolioGapStatus {
  const parseSuggestions = content.portfolioSuggestions?.missingFields ?? [];
  const openGaps: string[] = [];
  const resolvedGaps: string[] = [];

  for (const gap of parseSuggestions) {
    const trimmed = gap.trim();
    if (!trimmed) continue;
    if (isParseGapSatisfied(trimmed, content)) {
      resolvedGaps.push(trimmed);
    } else {
      openGaps.push(trimmed);
    }
  }

  return {
    parseSuggestions,
    openGaps,
    resolvedGaps,
    profileLinks: buildProfileLinkStatus(content),
    projects: buildProjectLinkStatus(content),
  };
}

export function formatProfileLinkStatusForMint(links: ProfileLinkStatus): string {
  const parts = [
    `email ${links.email ? 'set' : 'empty'}`,
    `github ${links.github ? 'set' : 'empty'}`,
    `linkedin ${links.linkedin ? 'set' : 'empty'}`,
    `website ${links.website ? 'set' : 'empty'}`,
    `phone ${links.phone ? 'set' : 'empty'}`,
    `profile photo ${links.profileImage ? 'set' : 'empty'}`,
  ];
  return parts.join(', ');
}
