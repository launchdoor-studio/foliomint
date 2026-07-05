import Link from 'next/link';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className, size = 48, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG brand mark; sharper at all sizes than raster */}
      <img
        src="/logo.svg"
        alt="FolioMint"
        width={size}
        height={size}
        className="h-auto w-auto"
        style={{ width: size, height: 'auto' }}
      />
      {showText && <span className="font-display text-xl font-black tracking-tight">FolioMint</span>}
    </Link>
  );
}
