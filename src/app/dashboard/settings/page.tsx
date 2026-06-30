import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Settings } from 'lucide-react';

import { AiKeySettings } from '@/components/domain/ai-key-settings';
import { Navbar } from '@/components/domain/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user && process.env.NEXTAUTH_DEV_BYPASS !== 'true') {
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
              <p className="mt-1 text-muted-foreground">Account, AI parsing, and billing.</p>
            </div>
          </div>

          <AiKeySettings />

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
