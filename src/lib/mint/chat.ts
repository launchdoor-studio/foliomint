import Groq from 'groq-sdk';

import type { MintContext } from '@/lib/mint/help-knowledge';
import { buildMintSystemPrompt } from '@/lib/mint/help-knowledge';

export interface MintChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithMint(
  apiKey: string,
  context: MintContext,
  messages: MintChatMessage[],
): Promise<string> {
  const groq = new Groq({ apiKey });
  const system = buildMintSystemPrompt(context);

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'system', content: system }, ...messages],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.35,
    max_tokens: 1536,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Mint did not respond. Please try again.');
  }
  return content;
}
