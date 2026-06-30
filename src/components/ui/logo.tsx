import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className, size = 40, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <Image
        src="/new-logo.png"
        alt="FolioMint"
        width={size}
        height={size}
        className="h-auto"
        priority
      />
      {showText && <span className="font-display text-xl font-black tracking-tight">FolioMint</span>}
    </Link>
  );
}
