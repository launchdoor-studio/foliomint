import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { sanitizeOutboundUrl } from '@/lib/safe-url';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function absoluteUrl(path: string): string {
  return `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}${path}`;
}

/**
 * User-typed URLs without a scheme (e.g. `github.com/org/repo`) are path-relative in HTML and
 * resolve under the current page (e.g. `/u/handle/...`). Prefix `https://` when the value is
 * clearly meant to be an external location. Leaves `mailto:`, `tel:`, `/#` fragments, and
 * site-relative paths starting with `/` unchanged.
 */
export function normalizeOutboundHref(raw: string): string {
  return sanitizeOutboundUrl(raw) ?? '';
}
