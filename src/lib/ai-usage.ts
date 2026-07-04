import { nanoid } from 'nanoid';

import type { AiUsageKind } from '@/lib/access';
import { db } from '@/lib/db';
import { aiUsageEvents } from '@/lib/db/schema';

export async function recordAiUsage(input: {
  userId: string;
  kind: AiUsageKind;
  model?: string | null;
  portfolioId?: string | null;
  succeeded?: boolean;
}): Promise<void> {
  try {
    await db.insert(aiUsageEvents).values({
      id: nanoid(12),
      userId: input.userId,
      portfolioId: input.portfolioId ?? null,
      kind: input.kind,
      model: input.model ?? null,
      succeeded: input.succeeded ?? true,
    });
  } catch (error) {
    console.error('[ai-usage] Failed to record usage event', error);
  }
}
