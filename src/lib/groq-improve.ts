import Groq from 'groq-sdk';

import { ParseError } from '@/lib/errors';
import { normalizeImproveAfter } from '@/lib/improve-preview';
import type { ResumeData } from '@/types';

export type ImproveSection =
  | 'bio'
  | 'headline'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education';

export interface ImproveRequest {
  section: ImproveSection;
  content: ResumeData;
  targetIndex?: number;
  instruction?: string;
}

export interface ImproveResult {
  before: unknown;
  after: unknown;
  patch: Partial<ResumeData>;
}

function sectionPrompt(req: ImproveRequest): string {
  const base = `You improve portfolio/resume content for FolioMint. Return ONLY valid JSON:
{ "patch": { ...partial ResumeData fields to merge... }, "after": <improved content> }

The "after" value must use the same shape as the field being improved:
- bio or headline: a string
- skills: a string array
- experience, projects, or education: the improved entry object only

Rules:
- Do not invent companies, dates, degrees, or metrics not supported by existing content.
- Improve clarity, impact, and ATS-friendly wording.
- Keep facts accurate; add metrics only if plausible from context or existing numbers.
- For bullets: complete sentences, strong verbs, one outcome per bullet.`;

  const instruction = req.instruction?.trim()
    ? `\nUser instruction: ${req.instruction.trim()}`
    : '';

  const snapshot = JSON.stringify(req.content, null, 2);

  if (req.section === 'bio' || req.section === 'headline') {
    return `${base}${instruction}\n\nImprove the ${req.section} field.\n\nCurrent content:\n${snapshot}`;
  }

  if (req.section === 'skills') {
    return `${base}${instruction}\n\nImprove the skills array — dedupe, shorten tags, keep at most 24.\n\nCurrent content:\n${snapshot}`;
  }

  if (req.section === 'experience' && req.targetIndex != null) {
    const exp = req.content.experience?.[req.targetIndex];
    return `${base}${instruction}\n\nImprove experience entry at index ${req.targetIndex} only.\n\nEntry:\n${JSON.stringify(exp, null, 2)}`;
  }

  if (req.section === 'projects' && req.targetIndex != null) {
    const project = req.content.projects?.[req.targetIndex];
    return `${base}${instruction}\n\nImprove project at index ${req.targetIndex} only.\n\nEntry:\n${JSON.stringify(project, null, 2)}`;
  }

  return `${base}${instruction}\n\nImprove section: ${req.section}\n\nCurrent content:\n${snapshot}`;
}

export async function improveResumeSection(
  apiKey: string,
  req: ImproveRequest,
): Promise<ImproveResult> {
  const groq = new Groq({ apiKey });
  const prompt = sectionPrompt(req);

  let before: unknown;
  if (req.section === 'bio') before = req.content.bio;
  else if (req.section === 'headline') before = req.content.headline;
  else if (req.section === 'skills') before = req.content.skills;
  else if (req.section === 'experience' && req.targetIndex != null) {
    before = req.content.experience?.[req.targetIndex];
  } else if (req.section === 'projects' && req.targetIndex != null) {
    before = req.content.projects?.[req.targetIndex];
  } else {
    before = null;
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are Mint, FolioMint resume improvement assistant. Return strict JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const json = completion.choices[0]?.message?.content;
    if (!json) throw new ParseError('No response from Mint');

    const parsed = JSON.parse(json) as { patch?: Partial<ResumeData>; after?: unknown };
    const rawAfter = parsed.after ?? parsed.patch;
    return {
      before,
      after: normalizeImproveAfter(req.section, rawAfter),
      patch: parsed.patch ?? {},
    };
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError(
      `Improvement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
