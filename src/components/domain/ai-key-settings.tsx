'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ExternalLink, KeyRound, Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type AiKeyStatus = {
  configured: boolean;
  provider: string | null;
  hint: string | null;
};

export function AiKeySettings() {
  const [status, setStatus] = useState<AiKeyStatus | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/ai-key', { credentials: 'include' });
      if (!res.ok) throw new Error('Could not load AI key status');
      setStatus((await res.json()) as AiKeyStatus);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load AI key status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('Enter your Groq API key first.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/settings/ai-key', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'groq', apiKey: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to save API key');

      setApiKey('');
      setSuccess('Groq API key saved. You can use AI parsing on the create page.');
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/settings/ai-key', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove API key');
      setSuccess('API key removed.');
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove API key');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="h-5 w-5 text-primary" />
          Groq API key (BYOK)
        </CardTitle>
        <CardDescription>
          AI resume parsing uses your own Groq key. FolioMint encrypts it at rest and never uses it
          for other users.{' '}
          <Link
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
          >
            Get a free key
            <ExternalLink className="h-3 w-3" />
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </p>
        ) : (
          <>
            {status?.configured ? (
              <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-300">
                Key configured
                {status.hint ? ` (…${status.hint})` : ''}. You can upload with AI enabled on{' '}
                <Link href="/generate" className="font-medium underline underline-offset-2">
                  Create
                </Link>
                .
              </p>
            ) : (
              <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                No key saved yet. You can still create portfolios with basic text extraction, or add
                a key here to enable AI parsing.
              </p>
            )}

            <div className="space-y-2">
              <label htmlFor="groq-api-key" className="text-sm font-medium">
                {status?.configured ? 'Replace key' : 'Groq API key'}
              </label>
              <Input
                id="groq-api-key"
                type="password"
                autoComplete="off"
                placeholder="gsk_…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={saving || removing}
              />
            </div>

            {error && (
              <p className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-300">
                {success}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void handleSave()} disabled={saving || removing || !apiKey.trim()}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating…
                  </>
                ) : (
                  'Save key'
                )}
              </Button>
              {status?.configured && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleRemove()}
                  disabled={saving || removing}
                >
                  {removing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing…
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove key
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
