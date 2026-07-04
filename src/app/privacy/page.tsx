import type { Metadata } from 'next';
import Link from 'next/link';

import { Footer } from '@/components/domain/footer';
import { Navbar } from '@/components/domain/navbar';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for FolioMint.',
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: April 9, 2026</p>

          <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-li:text-muted-foreground">
            <p>
              FolioMint (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) explains here how we collect, use, and
              share information when you use our websites and services (the &quot;Service&quot;).
            </p>

            <h2>1. Information we collect</h2>
            <ul>
              <li>
                <strong>Account information.</strong> When you sign in with a provider such as GitHub or Google, we
                receive profile details that provider shares with us (for example, name, email, and profile image).
              </li>
              <li>
                <strong>Content you provide.</strong> Resumes, portfolio text, images, blog posts, domain settings,
                and similar materials you upload or enter.
              </li>
              <li>
                <strong>Usage and device data.</strong> We may collect log data, approximate location derived from
                IP, device type, and pages viewed to operate and improve the Service and analytics features.
              </li>
              <li>
                <strong>Cookies and similar technologies.</strong> We use cookies or local storage for session
                management, preferences, and security.
              </li>
            </ul>

            <h2>2. How we use information</h2>
            <p>We use information to:</p>
            <ul>
              <li>Provide, maintain, and secure the Service.</li>
              <li>Process subscriptions and communicate about your account.</li>
              <li>Improve features, including Mint resume parsing, chat, and section improvements.</li>
              <li>Measure traffic and product usage where you enable analytics on your portfolio.</li>
              <li>Comply with law and enforce our terms.</li>
            </ul>

            <h2>3. Mint and resume processing</h2>
            <p>
              When you upload a resume, chat with Mint, or request section improvements, we send relevant text to
              infrastructure providers (including Groq) that power Mint. Resume files are processed in memory and not
              stored as uploaded files. Do not upload documents you are not permitted to share.
            </p>

            <h2>4. Sharing</h2>
            <p>We do not sell your personal information. We may share information with:</p>
            <ul>
              <li>Service providers who assist with hosting, email, payments, analytics, and security.</li>
              <li>Law enforcement or others when required by law or to protect rights and safety.</li>
              <li>A successor entity in a merger or acquisition, subject to this Policy.</li>
            </ul>

            <h2>5. Data retention</h2>
            <p>
              We retain information as long as your account is active and as needed to provide the Service, comply
              with legal obligations, resolve disputes, and enforce agreements. Hosted portfolios on certain plans
              may expire per plan terms described in pricing.
            </p>

            <h2>6. Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect information. No method of
              transmission or storage is completely secure.
            </p>

            <h2>7. Your rights</h2>
            <p>
              Depending on where you live, you may have rights to access, correct, delete, or export your personal
              information, or to object to certain processing. Contact us to exercise these rights. You may also
              disconnect OAuth providers or delete your account where the Service offers that option.
            </p>

            <h2>8. International transfers</h2>
            <p>
              We may process information in countries other than your own. Where required, we use appropriate
              safeguards for cross-border transfers.
            </p>

            <h2>9. Children</h2>
            <p>The Service is not directed at children under 13 (or the age required by local law).</p>

            <h2>10. Changes</h2>
            <p>
              We may update this Policy from time to time. We will post the revised version and update the
              &quot;Last updated&quot; date.
            </p>

            <h2>11. Contact</h2>
            <p>For privacy questions, contact us through the channels listed on our website or your account.</p>

            <p className="text-sm">
              See also our{' '}
              <Link href="/terms" className="text-primary underline underline-offset-4 hover:no-underline">
                Terms of Service
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
