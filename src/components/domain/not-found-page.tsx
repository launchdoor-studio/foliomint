'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

import { ProofScrambleGame } from '@/components/domain/proof-scramble-game';
import { Footer } from '@/components/domain/footer';
import { Navbar } from '@/components/domain/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const { status } = useSession();
  const isSignedIn = status === 'authenticated';

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />

      <main className="relative flex flex-1 flex-col items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div
          className="pointer-events-none absolute left-[8%] top-28 hidden rotate-[-8deg] md:block"
          aria-hidden
        >
          <div className="h-6 w-28 rounded-sm border-4 border-foreground bg-primary shadow-[6px_6px_0_0_hsl(var(--foreground))] dark:shadow-[6px_6px_0_0_hsl(var(--secondary))]" />
          <div className="ml-8 mt-3 h-6 w-32 rounded-sm border-4 border-foreground bg-secondary shadow-[6px_6px_0_0_hsl(var(--foreground))] dark:shadow-[6px_6px_0_0_hsl(var(--primary))]" />
        </div>

        <div
          className="pointer-events-none absolute right-[10%] top-32 hidden rotate-6 rounded-md border-4 border-foreground bg-card p-3 shadow-[8px_8px_0_0_hsl(var(--foreground))] dark:shadow-[8px_8px_0_0_hsl(var(--primary))] lg:block"
          aria-hidden
        >
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            status
          </p>
          <p className="mt-1 font-display text-lg font-bold">404</p>
          <p className="font-mono text-[10px] text-muted-foreground">not minted</p>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          <Badge variant="secondary" className="mb-5">
            Lost URL · Still on-brand
          </Badge>

          <h1 className="font-display text-[clamp(4.5rem,18vw,8rem)] font-bold leading-none tracking-tighter text-primary">
            404
          </h1>
          <p className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            This page was never minted
          </p>
          <p className="mx-auto mt-3 max-w-lg text-balance text-muted-foreground">
            The link you followed doesn&apos;t exist or moved. Rebuild the page in{' '}
            <strong className="text-foreground">Proof Scramble</strong> — collect editor sections
            in order, dodge 404 traps, and chase a high score.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                Back home
              </Link>
            </Button>
            {isSignedIn ? (
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg">
                <Link href="/generate">Start a portfolio</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-14 w-full max-w-3xl">
          <ProofScrambleGame />
        </div>
      </main>

      <Footer />
    </div>
  );
}
