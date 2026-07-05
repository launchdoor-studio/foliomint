'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  Loader2,
  LogIn,
  FileUp,
  LayoutTemplate,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/domain/navbar';
import { Footer } from '@/components/domain/footer';
import { useMintOptional } from '@/components/domain/mint/mint-provider';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function GenerateForm({ isAuthed }: { isAuthed: boolean }) {
  const router = useRouter();
  const mint = useMintOptional();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingBlank, setIsCreatingBlank] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return 'Please upload a PDF, DOCX, or TXT file.';
    }
    if (f.size > MAX_FILE_SIZE) {
      return 'File size must be under 4MB.';
    }
    return null;
  }, []);

  useEffect(() => {
    if (!isAuthed || !mint) return;
    mint.setNudge("Hi! I'm Mint — upload your resume and I'll help you build your portfolio.");
  }, [isAuthed, mint]);

  const handleFileSelect = useCallback(
    (f: File) => {
      const err = validateFile(f);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      setFile(f);
    },
    [validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect],
  );

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setStatusMessage('Mint is parsing your resume… this often takes 15–30 seconds. Please keep this tab open.');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
        const message = data.error || 'Upload failed';
        if (res.status === 401 || message.toLowerCase().includes('authentication')) {
          throw new Error('session_expired');
        }
        if (data.code === 'AI_PARSE_LIMIT_REACHED') {
          throw new Error('parse_limit');
        }
        throw new Error(message);
      }

      const data = (await res.json()) as { portfolioId?: string };
      const portfolioId =
        typeof data.portfolioId === 'string' && data.portfolioId.length > 0
          ? data.portfolioId
          : null;
      if (!portfolioId) {
        throw new Error('Server did not return a portfolio id. Please try again.');
      }

      setStatusMessage('Opening editor…');
      router.replace(`/editor/${portfolioId}?from=parse`);
      return;
    } catch (err) {
      if (err instanceof Error && err.message === 'session_expired') {
        setError('session_expired');
      } else if (err instanceof Error && err.message === 'parse_limit') {
        setError('parse_limit');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
      setStatusMessage(null);
    }
    setIsUploading(false);
  };

  const handleCreateBlank = async () => {
    setIsCreatingBlank(true);
    setError(null);
    setStatusMessage('Creating a blank portfolio canvas...');

    try {
      const res = await fetch('/api/portfolios/blank', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const message = data.error || 'Could not create portfolio';
        if (res.status === 401 || message.toLowerCase().includes('authentication')) {
          throw new Error('session_expired');
        }
        throw new Error(message);
      }

      const data = (await res.json()) as { portfolioId?: string };
      if (!data.portfolioId) {
        throw new Error('Server did not return a portfolio id. Please try again.');
      }

      setStatusMessage('Opening editor...');
      router.replace(`/editor/${data.portfolioId}`);
    } catch (err) {
      if (err instanceof Error && err.message === 'session_expired') {
        setError('session_expired');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
      setStatusMessage(null);
      setIsCreatingBlank(false);
    }
  };

  const isAuthError = error === 'session_expired';
  const isParseLimitError = error === 'parse_limit';

  if (!isAuthed) {
    const previewSteps = [
      {
        icon: LogIn,
        title: 'Sign in',
        caption: 'GitHub, Google, or LinkedIn · no card',
      },
      {
        icon: FileUp,
        title: 'Upload',
        caption: 'PDF, DOCX, or TXT',
      },
      {
        icon: LayoutTemplate,
        title: 'Edit & publish',
        caption: 'Guided editor',
      },
    ] as const;

    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 py-14 sm:py-20">
          <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Create your portfolio
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                Sign in, then upload your resume. Mint will help turn it into a site you can edit and publish.
              </p>
              <Button asChild size="lg" className="mt-8 w-full max-w-sm">
                <Link href="/sign-in?callbackUrl=%2Fgenerate">Sign in to upload</Link>
              </Button>
            </div>

            <div className="mt-12">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                How it works
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {previewSteps.map((step) => (
                  <div
                    key={step.title}
                    className="flex flex-col items-center rounded-xl border border-border/60 bg-card/40 px-3 py-5 text-center shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">{step.title}</p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">{step.caption}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Create your portfolio
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Upload your resume and Mint will map it into an editable portfolio.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>Supported formats: PDF, DOCX, TXT (max 4MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={cn(
                  'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 transition-colors',
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:border-primary/50',
                  file && 'border-primary/30 bg-primary/5',
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
                {file ? (
                  <>
                    <FileText className="mb-3 h-10 w-10 text-primary" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB — Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">Drop your resume here or click to browse</p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, or TXT</p>
                  </>
                )}
              </div>

              <p className="rounded-lg border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                Mint reads your resume to extract experience, projects, and skills into the editor.
                FolioMint stores your portfolio content; resume text is processed securely for parsing
                only.
              </p>

              {error && (
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-3 text-sm',
                    isAuthError || isParseLimitError
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'bg-destructive/10 text-destructive',
                  )}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {isAuthError ? (
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      Your session may have expired. Please{' '}
                      <Link href="/sign-in?callbackUrl=/generate" className="font-medium underline">
                        sign in again
                      </Link>{' '}
                      to continue.
                    </span>
                  ) : isParseLimitError ? (
                    <span>
                      You&apos;ve reached your Mint parsing limit. Try again later or ask Mint for help
                      starting from scratch.
                    </span>
                  ) : (
                    error
                  )}
                </div>
              )}

              {statusMessage && !error && (
                <p className="flex items-start gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
                  {statusMessage}
                </p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!file || isUploading || isCreatingBlank}
                size="lg"
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Parse with Mint & Generate Portfolio
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => void handleCreateBlank()}
                disabled={isUploading || isCreatingBlank}
                size="lg"
                variant="outline"
                className="w-full"
              >
                {isCreatingBlank ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <LayoutTemplate className="mr-2 h-4 w-4" />
                    Start from scratch
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
