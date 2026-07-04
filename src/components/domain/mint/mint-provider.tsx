'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

import type { MintResumeHealthSnapshot } from '@/lib/mint/resume-health-guidance';

export interface MintMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface MintPageContext {
  editorStep?: string;
  portfolioId?: string;
  hasPortfolio?: boolean;
  isPublished?: boolean;
  resumeHealth?: MintResumeHealthSnapshot;
}

interface MintContextValue {
  isOpen: boolean;
  openMint: () => void;
  closeMint: () => void;
  toggleMint: () => void;
  messages: MintMessage[];
  sendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  pageContext: MintPageContext;
  setPageContext: (ctx: MintPageContext) => void;
  nudge: string | null;
  setNudge: (text: string | null) => void;
  dismissNudge: () => void;
}

const MintContext = createContext<MintContextValue | null>(null);

export function MintProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MintMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm Mint — your FolioMint guide. Ask me about uploading, the editor, publishing, trials, or exporting your resume.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [pageContext, setPageContext] = useState<MintPageContext>({});
  const [nudge, setNudgeState] = useState<string | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const setNudge = useCallback((text: string | null) => {
    setNudgeState(text);
    setNudgeDismissed(false);
  }, []);

  const dismissNudge = useCallback(() => {
    setNudgeDismissed(true);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const userMsg: MintMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);

      try {
        const history = [...messages, userMsg]
          .filter((m) => m.id !== 'welcome')
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch('/api/mint/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: trimmed,
            context: {
              pathname,
              ...pageContext,
            },
            history,
          }),
        });

        let data: { reply?: string; error?: string } = {};
        try {
          const raw = await res.text();
          if (raw) {
            data = JSON.parse(raw) as { reply?: string; error?: string };
          }
        } catch {
          throw new Error('Mint could not respond. Please try again.');
        }

        if (!res.ok) {
          throw new Error(data.error || 'Mint could not respond.');
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.reply ?? 'Sorry, I could not help with that.',
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: 'assistant',
            content: error instanceof Error ? error.message : 'Something went wrong.',
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages, pageContext, pathname],
  );

  const value = useMemo(
    () => ({
      isOpen,
      openMint: () => setIsOpen(true),
      closeMint: () => setIsOpen(false),
      toggleMint: () => setIsOpen((v) => !v),
      messages,
      sendMessage,
      isSending,
      pageContext,
      setPageContext,
      nudge: nudgeDismissed ? null : nudge,
      setNudge,
      dismissNudge,
    }),
    [
      isOpen,
      messages,
      sendMessage,
      isSending,
      pageContext,
      nudge,
      nudgeDismissed,
      setNudge,
      dismissNudge,
    ],
  );

  return <MintContext.Provider value={value}>{children}</MintContext.Provider>;
}

export function useMint() {
  const ctx = useContext(MintContext);
  if (!ctx) {
    throw new Error('useMint must be used within MintProvider');
  }
  return ctx;
}

export function useMintOptional() {
  return useContext(MintContext);
}
