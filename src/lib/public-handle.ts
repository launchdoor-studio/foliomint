/** Lowercase handle used in /u/{handle} — not the internal portfolio slug. */

const RESERVED = new Set([
  'api',
  'dashboard',
  'editor',
  'sign-in',
  'signin',
  'pricing',
  'generate',
  'preview',
  'admin',
  'www',
  'settings',
  'help',
  'support',
  'status',
  'mail',
  'email',
  'ftp',
  'localhost',
]);

const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

export function normalizePublicHandleInput(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();
  return s === '' ? null : s;
}

export type PublicHandleValidation =
  | { ok: true; handle: string }
  | { ok: false; error: string };

export function validatePublicHandleForSave(raw: string | null | undefined): PublicHandleValidation {
  const s = normalizePublicHandleInput(raw);
  if (s === null) {
    return { ok: true, handle: '' };
  }

  if (s.length < 3 || s.length > 32) {
    return { ok: false, error: 'Username must be 3–32 characters.' };
  }

  if (!HANDLE_RE.test(s) || s.includes('--')) {
    return {
      ok: false,
      error: 'Use lowercase letters, numbers, and single hyphens (not at the start or end).',
    };
  }

  if (RESERVED.has(s)) {
    return { ok: false, error: 'This username is reserved. Pick another.' };
  }

  return { ok: true, handle: s };
}

export function portfolioSiteBasePath(row: { publicHandle: string | null; slug: string }): string {
  return row.publicHandle ? `/u/${row.publicHandle}` : `/${row.slug}`;
}
