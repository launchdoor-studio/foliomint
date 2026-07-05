'use client';

import Link from 'next/link';
import Image from 'next/image';
import { forwardRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Menu, X, LogOut, LayoutDashboard, Sparkles, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAppSession } from '@/hooks/use-app-session';
import { cn } from '@/lib/utils';

/** Logged-out visitors on marketing pages. */
const navLinksPublic = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/generate', label: 'Get Started' },
] as const;

const navLinkClass =
  'font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground';

function isAppPath(pathname: string): boolean {
  const appPrefixes = ['/editor', '/dashboard', '/generate', '/preview'] as const;
  return appPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Full document navigation — avoids client-router edge cases from heavy client pages like the editor. */
const AppNavAnchor = forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    className?: string;
    children: ReactNode;
    onNavigate?: () => void;
    'aria-label'?: string;
  }
>(function AppNavAnchor(
  { href, className, children, onNavigate, 'aria-label': ariaLabel },
  ref,
) {
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => onNavigate?.()}
    >
      {children}
    </a>
  );
});

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isSignedIn, isLoading, user, showUpgradeCta } = useAppSession();
  const inApp = isAppPath(pathname);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-[100] w-full border-b-2 border-foreground bg-background/90 backdrop-blur-lg dark:bg-card/90">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-6 md:flex">
          {isLoading ? (
            <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
              …
            </span>
          ) : isSignedIn ? (
            <>
              <AppNavAnchor href="/dashboard" className={navLinkClass}>
                Dashboard
              </AppNavAnchor>
              {showUpgradeCta && (
                <Button asChild size="sm">
                  <AppNavAnchor href="/upgrade">Upgrade to Pro</AppNavAnchor>
                </Button>
              )}
            </>
          ) : inApp ? (
            <AppNavAnchor href="/dashboard" className={navLinkClass}>
              Dashboard
            </AppNavAnchor>
          ) : (
            navLinksPublic.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))
          )}
          <ThemeToggle />
          {isLoading ? null : isSignedIn && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-md border-2 border-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? 'Account'}
                    width={32}
                    height={32}
                    className="rounded-sm"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-sm font-bold text-primary-foreground">
                    {user.name?.[0] ?? user.email[0] ?? '?'}
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
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <AppNavAnchor
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      onNavigate={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </AppNavAnchor>
                    <AppNavAnchor
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      onNavigate={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </AppNavAnchor>
                    {showUpgradeCta && (
                      <AppNavAnchor
                        href="/upgrade"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                        onNavigate={() => setUserMenuOpen(false)}
                      >
                        <Sparkles className="h-4 w-4" />
                        Upgrade to Pro
                      </AppNavAnchor>
                    )}
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
          ) : inApp ? null : (
            <Button asChild size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {isLoading ? null : isSignedIn && user ? (
            <AppNavAnchor href="/dashboard" aria-label="Dashboard">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'Account'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {user.name?.[0] ?? user.email[0] ?? '?'}
                </span>
              )}
            </AppNavAnchor>
          ) : inApp ? (
            <Button asChild size="sm" variant="outline">
              <AppNavAnchor href="/dashboard" aria-label="Dashboard">
                <LayoutDashboard className="h-4 w-4" />
              </AppNavAnchor>
            </Button>
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
          {isLoading ? null : isSignedIn ? (
            <>
              <AppNavAnchor
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onNavigate={closeMobile}
              >
                Dashboard
              </AppNavAnchor>
              <AppNavAnchor
                href="/dashboard/settings"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onNavigate={closeMobile}
              >
                Settings
              </AppNavAnchor>
              {showUpgradeCta && (
                <Button asChild className="w-full justify-center">
                  <AppNavAnchor href="/upgrade" onNavigate={closeMobile}>
                    Upgrade to Pro
                  </AppNavAnchor>
                </Button>
              )}
              <button
                type="button"
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => {
                  closeMobile();
                  signOut({ callbackUrl: '/' });
                }}
              >
                Sign out
              </button>
            </>
          ) : inApp ? (
            <AppNavAnchor
              href="/dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onNavigate={closeMobile}
            >
              Dashboard
            </AppNavAnchor>
          ) : (
            <>
              {navLinksPublic.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={closeMobile}
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
