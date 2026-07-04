import type { Metadata } from 'next';
import Link from 'next/link';

import { Footer } from '@/components/domain/footer';
import { Navbar } from '@/components/domain/navbar';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for FolioMint.',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: April 9, 2026</p>

          <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-li:text-muted-foreground">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of FolioMint
              (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) websites, applications, and related services
              (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to these
              Terms. If you do not agree, do not use the Service.
            </p>

            <h2>1. Accounts</h2>
            <p>
              You may need an account to use certain features. You are responsible for safeguarding your account
              credentials and for activity under your account. You must provide accurate information and keep it
              up to date.
            </p>

            <h2>2. Your content</h2>
            <p>
              You retain ownership of content you submit (&quot;User Content&quot;). You grant us a worldwide,
              non-exclusive license to host, store, reproduce, and display User Content solely as needed to operate,
              improve, and provide the Service to you and your visitors.
            </p>
            <p>
              You represent that you have the rights to your User Content and that it does not violate applicable
              law or third-party rights. We may remove content that we reasonably believe violates these Terms or
              poses risk to the Service or others.
            </p>

            <h2>3. Acceptable use</h2>
            <p>You agree not to misuse the Service. For example, you must not:</p>
            <ul>
              <li>Attempt to probe, scan, or test the vulnerability of any system or network without authorization.</li>
              <li>Use the Service to distribute malware, spam, or deceptive content.</li>
              <li>Infringe intellectual property or privacy rights of others.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            </ul>

            <h2>4. Plans, billing, and changes</h2>
            <p>
              Paid features require a subscription through our payment provider. Fees, renewals, and taxes are
              described at checkout. We may change pricing or features with reasonable notice where required by law.
            </p>

            <h2>5. Disclaimers</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind, express or implied, to the
              fullest extent permitted by law. We do not warrant that the Service will be uninterrupted or
              error-free, or that Mint-assisted features will produce accurate or complete results.
            </p>

            <h2>6. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, FolioMint and its suppliers will not be liable for any
              indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or
              goodwill, arising from your use of the Service.
            </p>

            <h2>7. Termination</h2>
            <p>
              You may stop using the Service at any time. We may suspend or terminate access if you violate these
              Terms or if we must do so to comply with law or protect the Service.
            </p>

            <h2>8. Governing law</h2>
            <p>
              These Terms are governed by the laws applicable in your jurisdiction of residence, without regard to
              conflict-of-law principles, except where prohibited.
            </p>

            <h2>9. Contact</h2>
            <p>
              Questions about these Terms? Contact us through the channels listed on our website or your account
              settings.
            </p>

            <p className="text-sm">
              See also our{' '}
              <Link href="/privacy" className="text-primary underline underline-offset-4 hover:no-underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
