import {
  Dribbble,
  Github,
  Globe,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';

import type { SocialLink } from '@/lib/social-links';

function hostnameForIconMatch(href: string): string | null {
  try {
    const raw = href.trim();
    if (!raw || raw.startsWith('mailto:')) return null;
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
    return new URL(withScheme).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isTwitterHostname(host: string): boolean {
  return host === 'x.com' || host === 'twitter.com' || host.endsWith('.twitter.com');
}

export function iconForProfileLink(link: SocialLink): LucideIcon {
  const label = link.label.toLowerCase();
  const href = link.href.toLowerCase();
  const host = hostnameForIconMatch(link.href);

  if (label.includes('github') || (host && (host === 'github.com' || host.endsWith('.github.com')))) return Github;
  if (label.includes('linkedin') || (host && (host === 'linkedin.com' || host.endsWith('.linkedin.com'))))
    return Linkedin;
  if (label.includes('twitter') || label === 'x' || (host && isTwitterHostname(host))) return Twitter;
  if (label.includes('youtube') || (host && (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com'))))
    return Youtube;
  if (label.includes('dribbble') || (host && (host === 'dribbble.com' || host.endsWith('.dribbble.com'))))
    return Dribbble;
  if (label.includes('discord') || (host && (host === 'discord.com' || host.endsWith('.discord.com'))))
    return MessageCircle;
  if (label.includes('email') || href.startsWith('mailto:')) return Mail;
  return Globe;
}

function BlueskyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.042-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.498 7.823 4.308 4.267-4.267 1.066-6.498-2.83-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.788.624-6.478 0-.69-.139-1.861-.902-2.203-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
    </svg>
  );
}

function BehanceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.938 4.503c.702 0 1.338.045 1.908.135.57.096 1.05.248 1.44.456.39.208.684.496.882.864.198.372.297.816.297 1.332 0 .516-.132.972-.396 1.368a2.762 2.762 0 0 1-1.188.864c.72.216 1.248.612 1.584 1.188.336.576.504 1.248.504 2.016 0 .648-.108 1.224-.324 1.728-.216.504-.528.924-.936 1.26-.408.336-.912.588-1.512.756-.6.168-1.284.252-2.052.252H0V4.503h6.938Zm-.396 4.284c.528 0 .924-.132 1.188-.396.264-.264.396-.636.396-1.116 0-.48-.132-.852-.396-1.116-.264-.264-.66-.396-1.188-.396H3.564v2.988h3.978v.036Zm.072 4.752c.624 0 1.092-.156 1.404-.468.312-.312.468-.756.468-1.332 0-.576-.168-1.02-.504-1.332-.336-.312-.804-.468-1.404-.468H3.564v3.6h3.05Zm10.188-8.64h4.968v1.512h-4.968V4.899Zm.036 10.08c-1.056 0-1.908-.324-2.556-.972-.648-.648-.972-1.524-.972-2.628 0-1.056.312-1.908.936-2.556.624-.648 1.476-.972 2.556-.972 1.008 0 1.824.3 2.448.9.624.6.972 1.404 1.044 2.412h-2.052c-.048-.432-.216-.768-.504-1.008-.288-.24-.672-.36-1.152-.36-.576 0-1.02.204-1.332.612-.312.408-.468.972-.468 1.692 0 .744.156 1.32.468 1.728.312.408.756.612 1.332.612.48 0 .864-.12 1.152-.36.288-.24.456-.576.504-1.008h2.052c-.072 1.008-.42 1.812-1.044 2.412-.624.6-1.44.9-2.448.9Z" />
    </svg>
  );
}

function MastodonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.258 3.989c-1.222-1.015-2.998-1.104-4.404-.405-1.406.699-2.303 2.088-2.303 3.636v1.08c-1.104-.276-2.208-.414-3.312-.414-1.104 0-2.208.138-3.312.414V3.989c0-1.548-.897-2.937-2.303-3.636-1.406-.699-3.182-.61-4.404.405C1.742 5.537.6 8.574.6 11.748c0 3.174 1.142 6.211 3.023 8.759 1.406 1.704 3.312 3.036 5.496 3.864 1.104.414 2.346.69 3.588.828.552.069 1.104.103 1.656.103.552 0 1.104-.034 1.656-.103 1.242-.138 2.484-.414 3.588-.828 2.184-.828 4.09-2.16 5.496-3.864 1.881-2.548 3.023-5.585 3.023-8.759 0-3.174-1.142-6.211-3.023-8.759Zm-1.518 14.904c-.828.966-1.932 1.725-3.174 2.208-.552.207-1.104.345-1.656.414-.552.069-1.104.103-1.656.103s-1.104-.034-1.656-.103c-.552-.069-1.104-.207-1.656-.414-1.242-.483-2.346-1.242-3.174-2.208-.966-1.104-1.518-2.484-1.518-3.933 0-1.449.552-2.829 1.518-3.933.828-.966 1.932-1.725 3.174-2.208.552-.207 1.104-.345 1.656-.414.552-.069 1.104-.103 1.656-.103s1.104.034 1.656.103c.552.069 1.104.207 1.656.414 1.242.483 2.346 1.242 3.174 2.208.966 1.104 1.518 2.484 1.518 3.933 0 1.449-.552 2.829-1.518 3.933Z" />
    </svg>
  );
}

function useBrandIcon(link: SocialLink): 'bluesky' | 'behance' | 'mastodon' | null {
  const label = link.label.toLowerCase();
  const host = hostnameForIconMatch(link.href);
  if (label.includes('bluesky') || (host && (host === 'bsky.app' || host.endsWith('.bsky.app')))) return 'bluesky';
  if (label.includes('behance') || (host && (host === 'behance.net' || host.endsWith('.behance.net')))) return 'behance';
  if (label.includes('mastodon') || (host && host.includes('mastodon'))) return 'mastodon';
  return null;
}

export function ProfileLinkIcon({ link, className }: { link: SocialLink; className?: string }) {
  const brand = useBrandIcon(link);
  if (brand === 'bluesky') return <BlueskyIcon className={className} />;
  if (brand === 'behance') return <BehanceIcon className={className} />;
  if (brand === 'mastodon') return <MastodonIcon className={className} />;

  const Icon = iconForProfileLink(link);
  return <Icon className={className} />;
}
