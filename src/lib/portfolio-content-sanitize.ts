import { normalizeProjectLinks } from '@/lib/project-links';
import { sanitizeImageUrl, sanitizeOutboundUrl } from '@/lib/safe-url';
import { portfolioContentSchema, type PortfolioContent } from '@/types';

function optionalSanitizedOutbound(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  return sanitizeOutboundUrl(raw) ?? undefined;
}

function optionalSanitizedImage(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  return sanitizeImageUrl(raw) ?? undefined;
}

/** Strip dangerous URL schemes from portfolio content after schema validation. */
export function sanitizePortfolioContentUrls(content: PortfolioContent): PortfolioContent {
  const projects = content.projects.map((project) => {
    const links = normalizeProjectLinks(project.links, project.url)
      .map((link) => {
        const url = sanitizeOutboundUrl(link.url);
        return url ? { ...link, url } : null;
      })
      .filter((link): link is NonNullable<typeof link> => link !== null);

    const legacyUrl = optionalSanitizedOutbound(project.url);

    return {
      ...project,
      url: legacyUrl,
      links: links.length > 0 ? links : undefined,
    };
  });

  return {
    ...content,
    profileImageUrl: optionalSanitizedImage(content.profileImageUrl),
    website: optionalSanitizedOutbound(content.website),
    linkedin: optionalSanitizedOutbound(content.linkedin),
    github: optionalSanitizedOutbound(content.github),
    projects,
  };
}

export function parseAndSanitizePortfolioContent(
  input: unknown,
):
  | { ok: true; content: PortfolioContent }
  | { ok: false; error: string } {
  const parsed = portfolioContentSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    const path = first?.path.length ? `${first.path.join('.')}: ` : '';
    return { ok: false, error: `${path}${first?.message ?? 'Invalid portfolio content'}` };
  }

  return { ok: true, content: sanitizePortfolioContentUrls(parsed.data) };
}
