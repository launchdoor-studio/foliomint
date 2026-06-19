import { eq } from 'drizzle-orm';

import {
  decryptAiKey,
  encryptAiKey,
  keyHintFromApiKey,
} from '@/lib/ai-key-encryption';
import { db } from '@/lib/db';
import { userAiCredentials } from '@/lib/db/schema';

export const AI_PROVIDERS = ['groq'] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export function isAiProvider(value: string): value is AiProvider {
  return (AI_PROVIDERS as readonly string[]).includes(value);
}

export interface AiKeyStatus {
  configured: boolean;
  provider: AiProvider | null;
  hint: string | null;
}

export async function getAiKeyStatus(userId: string): Promise<AiKeyStatus> {
  const row = await db
    .select({
      provider: userAiCredentials.provider,
      keyHint: userAiCredentials.keyHint,
    })
    .from(userAiCredentials)
    .where(eq(userAiCredentials.userId, userId))
    .get();

  if (!row) {
    return { configured: false, provider: null, hint: null };
  }

  return {
    configured: true,
    provider: row.provider as AiProvider,
    hint: row.keyHint,
  };
}

export async function resolveUserApiKey(userId: string): Promise<string | null> {
  const row = await db
    .select({ encryptedKey: userAiCredentials.encryptedKey })
    .from(userAiCredentials)
    .where(eq(userAiCredentials.userId, userId))
    .get();

  if (!row) {
    return null;
  }

  return decryptAiKey(row.encryptedKey);
}

/** Dev-only fallback when no user key is stored. */
export function resolveDevGroqApiKey(): string | null {
  const allowed =
    process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEV_BYPASS === 'true';

  if (!allowed || !process.env.GROQ_API_KEY) {
    return null;
  }

  return process.env.GROQ_API_KEY;
}

export async function resolveParsingApiKey(userId: string): Promise<string | null> {
  const userKey = await resolveUserApiKey(userId);
  if (userKey) {
    return userKey;
  }
  return resolveDevGroqApiKey();
}

export async function saveUserAiKey(
  userId: string,
  provider: AiProvider,
  apiKey: string,
): Promise<AiKeyStatus> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new Error('API key is required');
  }

  const now = new Date();
  const encryptedKey = encryptAiKey(trimmed);
  const keyHint = keyHintFromApiKey(trimmed);

  await db
    .insert(userAiCredentials)
    .values({
      userId,
      provider,
      encryptedKey,
      keyHint,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userAiCredentials.userId,
      set: {
        provider,
        encryptedKey,
        keyHint,
        updatedAt: now,
      },
    });

  return { configured: true, provider, hint: keyHint };
}

export async function deleteUserAiKey(userId: string): Promise<void> {
  await db.delete(userAiCredentials).where(eq(userAiCredentials.userId, userId));
}
