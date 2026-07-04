'use client';

import { useCallback, useRef, useState } from 'react';
import { FileUp, Loader2, X } from 'lucide-react';

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

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close re-import dialog"
            onClick={close}
          />
          <div className="relative w-full max-w-md rounded-2xl border bg-background p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Re-import from resume</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload PDF, DOCX, or TXT. Mint will extract experience, projects, and skills into
                  this portfolio again. Your handle, theme, and publish settings stay the same, but
                  editor content is replaced.
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={close} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4">
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
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

            <div className="mt-5 flex justify-end gap-2">
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
          </div>
        </div>
      )}
    </>
  );
}
