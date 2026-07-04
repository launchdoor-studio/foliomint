import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let cachedKnowledge: string | null = null;

const KNOWLEDGE_PATH = join(process.cwd(), 'src/lib/mint/foliomint-knowledge.md');

/** Patterns that must never appear in the Mint-facing knowledge document. */
export const FORBIDDEN_KNOWLEDGE_PATTERNS: RegExp[] = [
  /GROQ_API/i,
  /LEMONSQUEEZY_/i,
  /SIGNUP_TRIAL_/i,
  /NEXTAUTH_/i,
  /AUTH_SECRET/i,
  /TURSO_/i,
  /BYPASS_/i,
  /LOCAL_DEV_MODE/i,
  /\/api\//i,
  /\bsrc\/lib\//i,
  /webhook/i,
  /variant_id/i,
  /llama-/i,
  /drizzle/i,
  /libsql/i,
  /vercel/i,
  /groqConsent/i,
  /system prompt/i,
  /maintainer checklist/i,
];

export function assertKnowledgeDocumentIsSafe(content: string): void {
  for (const pattern of FORBIDDEN_KNOWLEDGE_PATTERNS) {
    if (pattern.test(content)) {
      throw new Error(
        `foliomint-knowledge.md contains disallowed content (${pattern.source}). See src/lib/mint/README.md`,
      );
    }
  }
}

/** Canonical FolioMint product knowledge for Mint (see foliomint-knowledge.md). */
export function getFoliomintKnowledgeBase(): string {
  if (cachedKnowledge === null) {
    const raw = readFileSync(KNOWLEDGE_PATH, 'utf8');
    assertKnowledgeDocumentIsSafe(raw);
    cachedKnowledge = raw;
  }
  return cachedKnowledge;
}

/** Dev/test helper — bust cache after editing the markdown file. */
export function resetFoliomintKnowledgeCache(): void {
  cachedKnowledge = null;
}
