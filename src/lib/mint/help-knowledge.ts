import { getEditorWizardStep } from '@/lib/editor-wizard-steps';
import {
  buildResumeHealthMintAnswer,
  isResumeHealthQuestion,
  type MintResumeHealthSnapshot,
} from '@/lib/mint/resume-health-guidance';

export interface MintContext {
  pathname: string;
  editorStep?: string;
  portfolioId?: string;
  tier?: 'free' | 'pro';
  trialDaysLeft?: number | null;
  hasPortfolio?: boolean;
  isPublished?: boolean;
  resumeHealth?: MintResumeHealthSnapshot;
}

interface HelpEntry {
  patterns: RegExp[];
  answer: string;
}

const GLOBAL_HELP: HelpEntry[] = [
  {
    patterns: [/publish/i, /how do i (go|make) live/i, /make.*live/i],
    answer:
      'To publish: open your portfolio in the editor, set a public handle (e.g. your-name), then click **Publish** in the toolbar. Your site will be live at `/u/your-handle`. You can unpublish anytime from the same toolbar.',
  },
  {
    patterns: [/public handle|handle/i, /custom url|url/i],
    answer:
      'Your **public handle** is the clean URL segment for your portfolio — `/u/your-handle`. Set it in the editor under Profile on step 1. Handles must be unique and use letters, numbers, and hyphens.',
  },
  {
    patterns: [/parse|upload|resume file|parsing/i, /fail/i],
    answer:
      'If parsing fails: use PDF, DOCX, or TXT under 4MB; make sure the file has selectable text (not a scanned image-only PDF). If you hit your Mint parsing limit, wait for the limit to reset or start from scratch and fill sections manually.',
  },
  {
    patterns: [/trial|pro trial/i, /expire/i],
    answer:
      'New sign-ups during our launch promo get a **14-day Pro trial** — blog, custom domain, higher Mint limits, and resume export. During our opening month you can also get **your first year of Pro for $25** on the pricing page.',
  },
  {
    patterns: [/export|download.*resume|resume pdf/i],
    answer:
      'Download an updated resume PDF from the editor toolbar or portfolio manage page. The PDF matches your current portfolio content — edit the site first, then export.',
  },
  {
    patterns: [/blank|scratch|manual/i],
    answer:
      'On **Generate**, click **Start from scratch** to skip resume upload and build your portfolio manually in the guided editor.',
  },
  {
    patterns: [/mint|who are you|help me/i],
    answer:
      "I'm **Mint**, your FolioMint guide. I can explain screens, publishing, handles, resume parsing, trials, and resume export. Ask me anything about using FolioMint!",
  },
];

function stepHelp(editorStep?: string): string | null {
  const step = getEditorWizardStep(editorStep);
  if (!step) return null;
  return `You're on **${step.title}**: ${step.description} Use Save portfolio when you're ready, or move between steps with the pills above the form.`;
}

export function findCuratedMintAnswer(message: string, context: MintContext): string | null {
  const trimmed = message.trim();
  if (!trimmed) return null;

  if (isResumeHealthQuestion(trimmed) || (context.resumeHealth && /fix|improve|next|checklist|score|health/i.test(trimmed))) {
    const healthAnswer = buildResumeHealthMintAnswer(context.resumeHealth);
    if (healthAnswer) return healthAnswer;
  }

  for (const entry of GLOBAL_HELP) {
    if (entry.patterns.some((p) => p.test(trimmed))) {
      return entry.answer;
    }
  }

  if (context.pathname.startsWith('/editor') && /this step|what.*do|what.*mean|help me here/i.test(trimmed)) {
    const healthAnswer = buildResumeHealthMintAnswer(context.resumeHealth);
    if (healthAnswer) return healthAnswer;

    const stepAnswer = stepHelp(context.editorStep);
    if (stepAnswer) return stepAnswer;
  }

  if (context.pathname === '/generate' && /start|begin|first/i.test(trimmed)) {
    return 'Upload your resume (PDF, DOCX, or TXT) and click **Parse with Mint**. I will map your experience, projects, and skills into the editor. Or use **Start from scratch** if you prefer manual entry.';
  }

  if (context.pathname.startsWith('/dashboard') && /next|what now/i.test(trimmed)) {
    return context.hasPortfolio
      ? 'Open a portfolio from **Your portfolios**, continue editing, or publish if you have not yet. Ask me about handles, themes, or exporting your resume.'
      : 'Head to **Generate** to upload a resume or start from scratch. Your first portfolio takes about 10–20 minutes to polish.';
  }

  return null;
}

export function buildMintSystemPrompt(context: MintContext): string {
  const step = getEditorWizardStep(context.editorStep);

  const healthSummary = context.resumeHealth
    ? `Resume health: ${context.resumeHealth.score}/100 (${context.resumeHealth.label}). Open items: ${
        context.resumeHealth.openItems.length > 0
          ? context.resumeHealth.openItems.map((item) => item.label).join(', ')
          : 'none'
      }.`
    : 'Resume health: n/a';

  return `You are Mint, a friendly career buddy and in-app guide for FolioMint (a portfolio builder).

Rules:
- Only help with FolioMint: signing in, uploading resumes, the editor, publishing, handles, themes, trials, resume PDF export, and Mint features.
- When the user asks about resume health or what to fix, give concrete next steps tied to editor wizard steps (Profile, Experience, Projects, Skills). Use the resume health snapshot below when present.
- Never invent features FolioMint does not have. If unsure, say so and suggest the dashboard or support.
- Be warm, concise, and practical. Use short paragraphs.
- Do not provide legal, medical, or unrelated career coaching.
- Current page: ${context.pathname}
- Editor step: ${step ? `${step.title} — ${step.description}` : 'n/a'}
- ${healthSummary}
- User tier: ${context.tier ?? 'unknown'}
- Trial days left: ${context.trialDaysLeft ?? 'n/a'}
- Has portfolio: ${context.hasPortfolio ? 'yes' : 'no'}
- Published: ${context.isPublished ? 'yes' : 'no'}`;
}
