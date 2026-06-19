import * as pdfjsLib from 'pdfjs-dist';

import { ParseError } from './errors';
import type { ResumeData } from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const parts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      parts.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
    }
    const text = parts.join('\n').trim();
    if (!text) {
      throw new ParseError('PDF appears to be empty or contains only images');
    }
    return text;
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError('Failed to extract text from PDF');
  }
}

export async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth');
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    if (!result.value?.trim()) {
      throw new ParseError('DOCX appears to be empty');
    }
    return result.value;
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError('Failed to extract text from DOCX');
  }
}

export function mimeFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (lower.endsWith('.txt')) return 'text/plain';
  return 'application/octet-stream';
}

export async function extractTextFromFile(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  switch (mimeType) {
    case 'application/pdf':
      return extractTextFromPdf(buffer);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractTextFromDocx(buffer);
    case 'text/plain':
      return new TextDecoder().decode(buffer);
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
      const words = line.split(/\s+/);
      if (words.length < 2 || words.length > 5) return false;
      const capitalizedWords = words.filter((w) => /^[A-Z][a-zA-Z'-]*$/.test(w));
      return capitalizedWords.length >= 2;
    }) ?? lines[0];

  return {
    name: nameCandidate || 'Unknown',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    bio: rawText.slice(0, 500),
  };
}
