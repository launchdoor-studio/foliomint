import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BLOCKED_SCHEMES = new Set([
  'javascript',
  'data',
  'vbscript',
  'file',
  'blob',
  'about',
]);

const OUTBOUND_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

function parseScheme(raw: string): string | null {
  const match = raw.trim().match(/^([a-z][a-z0-9+.-]*):/i);
  return match ? match[1].toLowerCase() : null;
}

function isBlockedUrlScheme(scheme: string): boolean {
  return BLOCKED_SCHEMES.has(scheme.toLowerCase());
}

function isAllowedOutboundScheme(scheme: string): boolean {
  return OUTBOUND_SCHEMES.has(scheme.toLowerCase());
}

function sanitizeOutboundUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  const scheme = parseScheme(s);
  if (scheme) {
    if (isBlockedUrlScheme(scheme) || !isAllowedOutboundScheme(scheme)) return null;
    return s;
  }

  if (s.startsWith('//')) return `https:${s}`;
  if (s.startsWith('/') || s.startsWith('#') || s.startsWith('?')) return s;
  return `https://${s}`;
}

export function normalizeOutboundHref(raw: string): string {
  return sanitizeOutboundUrl(raw) ?? '';
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
