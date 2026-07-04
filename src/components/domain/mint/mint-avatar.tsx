'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

export type MintPose = 'hello' | 'thinking' | 'celebrate' | 'guide' | 'peeking';

const POSE_FILES: Record<MintPose, string> = {
  hello: '/mint/hello.svg',
  thinking: '/mint/thinking.svg',
  celebrate: '/mint/celebrate.svg',
  guide: '/mint/guide.svg',
  peeking: '/mint/peeking.svg',
};

export function mintImageSrc(pose: MintPose = 'hello'): string {
  return POSE_FILES[pose];
}

export function MintAvatar({
  pose = 'hello',
  size = 40,
  className,
}: {
  pose?: MintPose;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={mintImageSrc(pose)}
      alt="Mint, your FolioMint guide"
      width={size}
      height={size}
      className={cn(
        pose === 'peeking' ? 'object-contain object-bottom' : 'rounded-full object-cover',
        className,
      )}
      unoptimized
    />
  );
}
