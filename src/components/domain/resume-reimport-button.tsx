'use client';

import { useCallback, useRef, useState } from 'react';
import { FileUp, Loader2, X } from 'lucide-react';

import { FloatingAssistantPanel } from '@/components/domain/floating-assistant-panel';
import { MintAvatar } from '@/components/domain/mint/mint-avatar';
import { Button } from '@/components/ui/button';
import type { PortfolioContent } from '@/types';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const MAX_FILE_SIZE = 4 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Please upload a PDF, DOCX, or TXT file.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be under 4MB.';
  }
  return null;
}

export function ResumeReimportButton({
  portfolioId,
  onImported,
}: {
  portfolioId: string;
  onImported: (content: PortfolioContent) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setFile(null);
    setError(null);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/portfolios/${portfolioId}/reparse`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = (await res.json().catch(() => ({}))) as {
        content?: PortfolioContent;
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      if (!data.content) {
        throw new Error('Server did not return parsed content.');
      }

      onImported(data.content);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 shrink-0 gap-1.5 px-2.5"
        onClick={() => setOpen(true)}
        title="Upload a resume again and replace editor content with a fresh Mint parse"
      >
        <FileUp className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Re-import resume</span>
        <span className="sm:hidden">Import</span>
      </Button>

      <FloatingAssistantPanel
        id="resume-reimport-panel"
        open={open}
        onClose={close}
        backdropLabel="Close re-import panel"
        heightClass="h-auto max-h-[min(420px,calc(100vh-7rem))]"
        zIndexClass="z-[52]"
        header={
          <>
            <MintAvatar pose="hello" size={36} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">Re-import from resume</p>
              <p className="text-xs text-muted-foreground">Replace editor content with a fresh parse</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={close} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </>
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close} disabled={loading}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleImport()} disabled={!file || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing…
                </>
              ) : (
                'Parse with Mint'
              )}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Upload PDF, DOCX, or TXT. Mint will extract experience, projects, and skills into this
          portfolio again. Your handle, theme, and publish settings stay the same, but editor content
          is replaced.
        </p>

        <div className="mt-4">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-2 file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              if (!next) {
                setFile(null);
                return;
              }
              const validationError = validateFile(next);
              if (validationError) {
                setError(validationError);
                setFile(null);
                return;
              }
              setError(null);
              setFile(next);
            }}
          />
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </FloatingAssistantPanel>
    </>
  );
}
