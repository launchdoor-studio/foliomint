import { ParseError } from '@/lib/errors';
import type { ResumeData } from '@/types';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;

  try {
    const data = await pdfParse(buffer);
    if (!data.text?.trim()) {
      throw new ParseError('PDF appears to be empty or contains only images');
    }
    return data.text;
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError('Failed to extract text from PDF');
  }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');

  try {
    const result = await mammoth.extractRawText({ buffer });
    if (!result.value?.trim()) {
      throw new ParseError('DOCX appears to be empty');
    }
    return result.value;
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError('Failed to extract text from DOCX');
  }
}

export function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case 'application/pdf':
      return extractTextFromPdf(buffer);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractTextFromDocx(buffer);
    case 'text/plain':
      return Promise.resolve(buffer.toString('utf-8'));
    default:
      throw new ParseError(`Unsupported file type: ${mimeType}`);
  }
}

export function buildFallbackResumeData(rawText: string): ResumeData {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  const headingBlacklist = new Set([
    'profile',
    'contact',
    'contacts',
    'about',
    'summary',
    'experience',
    'work experience',
    'work history',
    'education',
    'projects',
    'skills',
    'certifications',
    'languages',
  ]);

  const nameCandidate =
    lines.find((line) => {
      const lower = line.toLowerCase();
      if (headingBlacklist.has(lower)) return false;
      if (lower.includes('@')) return false;
      if (lower.includes('linkedin.com') || lower.includes('github.com')) return false;
      if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('www.')) {
        return false;
      }
      // Heuristic: treat 2–4 word capitalized strings as likely names
      const words = line.split(/\s+/);
      if (words.length < 2 || words.length > 5) return false;
      const capitalizedWords = words.filter((w) => /^[A-Z][a-zA-Z'-]*$/.test(w));
      return capitalizedWords.length >= 2;
    }) ?? lines[0];

  return {
    name: nameCandidate || 'Unknown',
    headline: undefined,
    skills: [],
    experience: [],
    education: [],
    projects: [],
    bio: rawText.slice(0, 500),
    portfolioSuggestions: {
      heroTagline: undefined,
      bioVariants: [],
      missingFields: ['Review imported text', 'Add projects', 'Add social links'],
      recommendedSectionOrder: ['profile', 'experience', 'projects', 'skills', 'education'],
    },
  };
}
