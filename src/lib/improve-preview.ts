import type { ImproveSection } from '@/lib/groq-improve';

/** Unwrap model output when `after` is nested like `{ bio: "..." }` instead of a plain string. */
export function normalizeImproveAfter(section: ImproveSection, after: unknown): unknown {
  if (after == null || typeof after !== 'object' || Array.isArray(after)) {
    return after;
  }

  const record = after as Record<string, unknown>;

  if (section === 'bio' && typeof record.bio === 'string') return record.bio;
  if (section === 'headline' && typeof record.headline === 'string') return record.headline;
  if (section === 'skills' && Array.isArray(record.skills)) return record.skills;

  if (section === 'experience' && record.company != null) return after;
  if (section === 'projects' && record.name != null) return after;
  if (section === 'education' && record.institution != null) return after;

  const keys = Object.keys(record);
  if (keys.length === 1) return record[keys[0]!];

  return after;
}

export function formatImprovePreview(section: ImproveSection, value: unknown): string {
  const normalized = normalizeImproveAfter(section, value);

  if (normalized == null || normalized === '') return '(empty)';

  if (section === 'bio' || section === 'headline') {
    return typeof normalized === 'string' ? normalized : String(normalized);
  }

  if (section === 'skills' && Array.isArray(normalized)) {
    return normalized.map(String).join(', ');
  }

  if (
    (section === 'experience' || section === 'projects' || section === 'education') &&
    typeof normalized === 'object' &&
    normalized !== null
  ) {
    const entry = normalized as Record<string, unknown>;
    const lines: string[] = [];

    if (section === 'experience') {
      const role = entry.role ? String(entry.role) : '';
      const company = entry.company ? String(entry.company) : '';
      if (role || company) lines.push([role, company].filter(Boolean).join(' · '));
    }

    if (section === 'projects' && entry.name) {
      lines.push(String(entry.name));
    }

    if (section === 'education') {
      const degree = entry.degree ? String(entry.degree) : '';
      const institution = entry.institution ? String(entry.institution) : '';
      if (degree || institution) lines.push([degree, institution].filter(Boolean).join(' · '));
    }

    if (entry.description) lines.push(String(entry.description));

    if (Array.isArray(entry.bullets) && entry.bullets.length > 0) {
      lines.push(...entry.bullets.map((bullet) => `• ${String(bullet)}`));
    }

    if (lines.length > 0) return lines.join('\n');
  }

  if (typeof normalized === 'string') return normalized;

  return JSON.stringify(normalized, null, 2);
}
