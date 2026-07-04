'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { MintAvatar } from '@/components/domain/mint/mint-avatar';
import { useMint } from '@/components/domain/mint/mint-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const QUICK_REPLIES = [
  'How do I publish?',
  'What is a public handle?',
  'How do I export my resume?',
];

function MintMessageBody({ content, role }: { content: string; role: 'user' | 'assistant' }) {
  if (role === 'user') {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>,
        ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
        li: ({ children }) => <li>{children}</li>,
        a: ({ href, children }) => (
          <a href={href} className="font-medium underline underline-offset-2" target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="rounded bg-background/70 px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function MintChatPanel() {
  const { isOpen, closeMint, messages, sendMessage, isSending } = useMint();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    void sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pb-24 sm:p-6 sm:pb-24">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 lg:bg-black/15"
        aria-label="Close Mint"
        onClick={closeMint}
      />
      <div
        id="mint-chat-panel"
        className="relative flex h-[min(560px,calc(100vh-7rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-background/95 shadow-2xl backdrop-blur-lg"
      >
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <MintAvatar pose="hello" size={36} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight">Mint</p>
            <p className="text-xs text-muted-foreground">Your FolioMint guide</p>
          </div>
          <Button variant="ghost" size="icon" onClick={closeMint} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'max-w-[90%] rounded-xl px-3 py-2 text-sm',
                msg.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground',
              )}
            >
              <MintMessageBody content={msg.content} role={msg.role} />
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Mint is thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t px-4 py-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                type="button"
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => void sendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Mint anything about FolioMint…"
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
            />
            <Button size="icon" onClick={handleSend} disabled={isSending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MintFloatingButton() {
  const { toggleMint, nudge, dismissNudge, openMint, isOpen } = useMint();

  return (
    <div className="fixed bottom-5 right-5 z-40 flex max-w-xs flex-col items-end gap-2">
      {nudge && !isOpen && (
        <div className="rounded-xl border bg-background/95 px-3 py-2 text-sm shadow-lg backdrop-blur-lg">
          <p>{nudge}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => {
                dismissNudge();
                openMint();
              }}
            >
              Ask Mint
            </button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline"
              onClick={dismissNudge}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center">
        <MintAvatar
          pose="peeking"
          size={88}
          className="pointer-events-none relative z-10 -mb-8"
        />
        <button
          type="button"
          onClick={toggleMint}
          aria-expanded={isOpen}
          aria-controls="mint-chat-panel"
          className={cn(
            'relative z-0 rounded-full border-2 border-primary bg-background px-5 py-2.5 shadow-lg backdrop-blur-lg transition-colors',
            isOpen ? 'bg-muted' : 'hover:bg-muted',
          )}
          aria-label="Open Mint assistant"
        >
          <span className="text-sm font-semibold">Ask Mint</span>
        </button>
      </div>
    </div>
  );
}

export function MintWidget() {
  return (
    <>
      <MintFloatingButton />
      <MintChatPanel />
    </>
  );
}
