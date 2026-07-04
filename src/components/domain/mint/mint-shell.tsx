'use client';

import { usePathname } from 'next/navigation';

import { MintProvider } from '@/components/domain/mint/mint-provider';
import { MintWidget } from '@/components/domain/mint/mint-chat';

const MINT_ROUTES = ['/generate', '/dashboard', '/editor', '/preview'];

export function MintShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showMint = MINT_ROUTES.some((prefix) => pathname.startsWith(prefix));

  if (!showMint) {
    return <>{children}</>;
  }

  return (
    <MintProvider>
      {children}
      <MintWidget />
    </MintProvider>
  );
}
