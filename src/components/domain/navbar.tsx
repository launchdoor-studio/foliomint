'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

/** Logged-out visitors: marketing CTAs. */
const navLinksPublic = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/generate', label: 'Get Started' },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isSignedIn = status === 'authenticated' && session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background/90 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-6 md:flex">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Button asChild size="sm">
                <Link href="/upgrade">Upgrade to Pro</Link>
              </Button>
            </>
          ) : (
            navLinksPublic.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))
          )}
          <ThemeToggle />
          {isSignedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-md border-2 border-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user?.name ?? 'Account'}
                    width={32}
                    height={32}
                    className="rounded-sm"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-sm font-bold text-primary-foreground">
                    {session.user?.name?.[0] ?? session.user?.email?.[0] ?? '?'}
                  </span>
                )}
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border-2 border-foreground bg-popover py-1 shadow-[6px_6px_0_0_hsl(var(--foreground))] dark:shadow-[6px_6px_0_0_hsl(var(--primary))]">
                    <div className="border-b-2 border-foreground px-3 py-2">
                      <p className="truncate text-sm font-medium">{session.user?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/upgrade"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Upgrade to Pro
                    </Link>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {isSignedIn ? (
            <Link href="/dashboard">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user?.name ?? 'Account'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {session?.user?.name?.[0] ?? '?'}
                </span>
              )}
            </Link>
          ) : (
            <Button asChild size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      <div
        className={cn(
          'overflow-hidden border-t transition-all duration-200 md:hidden',
          mobileOpen ? 'max-h-64' : 'max-h-0 border-transparent',
        )}
      >
        <div className="flex flex-col gap-2 px-4 py-4">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <Button asChild className="w-full justify-center" onClick={() => setMobileOpen(false)}>
                <Link href="/upgrade">Upgrade to Pro</Link>
              </Button>
              <button
                type="button"
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              {navLinksPublic.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-2">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
