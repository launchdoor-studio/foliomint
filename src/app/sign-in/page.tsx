'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProviders, signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Github, Linkedin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [enabledProviders, setEnabledProviders] = useState<Set<string>>(new Set());
  const callbackUrl = searchParams.get('callbackUrl') ?? '/generate';

  useEffect(() => {
    void getProviders().then((providers) => {
      setEnabledProviders(new Set(Object.keys(providers ?? {})));
    });
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo size={48} showText={false} />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to continue</CardTitle>
            <CardDescription>
              {callbackUrl === '/generate'
                ? 'Sign in to create your portfolio. Free — no credit card required.'
                : 'Sign in to your FolioMint account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enabledProviders.has('github') && (
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => signIn('github', { callbackUrl })}
              >
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Button>
            )}
            {enabledProviders.has('google') && (
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => signIn('google', { callbackUrl })}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            )}
            {enabledProviders.has('linkedin') && (
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => signIn('linkedin', { callbackUrl })}
              >
                <Linkedin className="mr-2 h-5 w-5" />
                Continue with LinkedIn
              </Button>
            )}
            {enabledProviders.size === 0 && (
              <p className="rounded-md border-2 border-border bg-muted p-3 text-center text-sm text-muted-foreground">
                Sign-in is temporarily unavailable. OAuth providers must be configured for this
                deployment.
              </p>
            )}
            <p className="text-center text-xs text-muted-foreground">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
