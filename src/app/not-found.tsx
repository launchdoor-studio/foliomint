import type { Metadata } from 'next';

import { NotFoundPage } from '@/components/domain/not-found-page';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This FolioMint page was not minted. Head home or play Proof Scramble while you are here.',
};

export default function NotFound() {
  return <NotFoundPage />;
}
