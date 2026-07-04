/** Platform Groq API key for all AI features (parsing, Mint, improvements). */
import { shouldUseDevMockAi } from '@/lib/dev-mode';

export function resolvePlatformGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function isPlatformAiAvailable(): boolean {
  return resolvePlatformGroqApiKey() !== null || shouldUseDevMockAi();
}

/** @deprecated Use resolvePlatformGroqApiKey */
export async function resolveParsingApiKey(_userId: string): Promise<string | null> {
  return resolvePlatformGroqApiKey();
}
