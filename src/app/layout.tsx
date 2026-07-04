import type { Metadata, Viewport } from 'next';
import { DM_Sans, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

import { Providers } from '@/components/providers';

import './globals.css';

const fontSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'FolioMint — Mint Proof From Your Resume',
    template: '%s | FolioMint',
  },
  description:
    'Turn resume raw material into a hosted proof-of-work portfolio with Mint-assisted structure, editable themes, analytics, and custom domains.',
  keywords: [
    'portfolio',
    'resume',
    'CV',
    'website builder',
    'developer portfolio',
    'professional portfolio',
  ],
  authors: [{ name: 'FolioMint' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'FolioMint',
    title: 'FolioMint — Mint Proof From Your Resume',
    description:
      'Turn resume raw material into a hosted proof-of-work portfolio you can edit, publish, and grow.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FolioMint — Mint Proof From Your Resume',
    description:
      'Turn resume raw material into a hosted proof-of-work portfolio you can edit, publish, and grow.',
  },
  icons: {
    icon: [{ url: '/new-logo.png', type: 'image/png' }],
    shortcut: ['/new-logo.png'],
    apple: ['/new-logo.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1ead5' },
    { media: '(prefers-color-scheme: dark)', color: '#091611' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} font-sans bg-aurora bg-grain`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
