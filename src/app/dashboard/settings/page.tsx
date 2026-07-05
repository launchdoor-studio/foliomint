import Link from 'next/link';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { redirect } from 'next/navigation';
import { ArrowLeft, Settings } from 'lucide-react';

import { MintAvatar } from '@/components/domain/mint/mint-avatar';
import { Navbar } from '@/components/domain/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user && !isDevAuthBypassed()) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard/settings')}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="mt-1 text-muted-foreground">Account, Mint assistant, and billing.</p>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MintAvatar pose="hello" size={64} />
                <div>
                  <CardTitle className="text-lg">Mint assistant</CardTitle>
                  <CardDescription>
                    Mint is built into FolioMint — use the &quot;Ask Mint&quot; button on Generate,
                    Dashboard, and the editor for help with publishing, handles, resume parsing, and
                    resume export.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mint handles resume parsing, chat, and section improvements. Your tier controls usage
                limits — no API key setup required.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Billing</CardTitle>
              <CardDescription>
                Subscribe or change plans on the pricing page. Subscription management uses Lemon
                Squeezy&apos;s customer portal links from your receipts or dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pricing" className="text-sm font-medium text-primary hover:underline">
                View pricing →
              </Link>
            </CardContent>
          </Card>

          {user?.email && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
