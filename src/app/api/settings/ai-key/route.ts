import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  AI_PROVIDERS,
  deleteUserAiKey,
  getAiKeyStatus,
  isAiProvider,
  saveUserAiKey,
} from '@/lib/ai-credentials';
import { getCurrentUser } from '@/lib/auth';
import { validateGroqApiKey } from '@/lib/groq';

export const dynamic = 'force-dynamic';

const saveKeySchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  apiKey: z.string().min(1, 'API key is required'),
});

async function requireUserId(): Promise<string | NextResponse> {
  const appUser = await getCurrentUser();
  if (!appUser && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return appUser?.id ?? 'dev-user';
}

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) {
    return userId;
  }

  const status = await getAiKeyStatus(userId);
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) {
    return userId;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = saveKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request' },
      { status: 400 },
    );
  }

  const { provider, apiKey } = parsed.data;

  if (!isAiProvider(provider)) {
    return NextResponse.json({ error: 'Unsupported AI provider' }, { status: 400 });
  }

  if (provider === 'groq') {
    const valid = await validateGroqApiKey(apiKey);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid Groq API key. Get one at console.groq.com and try again.' },
        { status: 400 },
      );
    }
  }

  try {
    const status = await saveUserAiKey(userId, provider, apiKey);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to save AI key:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 });
  }
}

export async function DELETE() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) {
    return userId;
  }

  await deleteUserAiKey(userId);
  return NextResponse.json({ configured: false, provider: null, hint: null });
}
