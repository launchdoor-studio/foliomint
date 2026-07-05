const BLOCKED_SCHEMES = new Set([
  'javascript',
  'data',
  'vbscript',
  'file',
  'blob',
  'about',
]);

const OUTBOUND_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);
const IMAGE_SCHEMES = new Set(['http', 'https']);

function parseScheme(raw: string): string | null {
  const match = raw.trim().match(/^([a-z][a-z0-9+.-]*):/i);
  return match ? match[1].toLowerCase() : null;
}

export function isBlockedUrlScheme(scheme: string): boolean {
  return BLOCKED_SCHEMES.has(scheme.toLowerCase());
}

export function isAllowedOutboundScheme(scheme: string): boolean {
  return OUTBOUND_SCHEMES.has(scheme.toLowerCase());
}

export function isAllowedImageUrlScheme(scheme: string): boolean {
  return IMAGE_SCHEMES.has(scheme.toLowerCase());
}

/** Returns a safe http(s)/mailto/tel URL, or null when the value must not be used as a link. */
export function sanitizeOutboundUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
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

/** Returns a safe http(s) image URL, or null when the value must not be used as img src. */
export function sanitizeImageUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;

  const scheme = parseScheme(s);
  if (scheme) {
    if (isBlockedUrlScheme(scheme) || !isAllowedImageUrlScheme(scheme)) return null;
    return s;
  }

  if (s.startsWith('//')) return `https:${s}`;
  return `https://${s}`;
}

/** Zod-friendly check for integration / API URL fields (http/https only). */
export function isSafeHttpUrl(raw: string): boolean {
  return sanitizeImageUrl(raw) !== null;
}
