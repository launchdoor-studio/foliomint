import Link from 'next/link';
import {
  ArrowRight,
  Upload,
  Sparkles,
  Globe,
  Palette,
  BarChart3,
  Layers,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/domain/navbar';
import { Footer } from '@/components/domain/footer';

const features = [
  {
    icon: Upload,
    title: 'Start with raw material',
    description: 'Upload a resume, paste text, or open a blank canvas. FolioMint turns scattered career proof into a site structure.',
  },
  {
    icon: Sparkles,
    title: 'Portfolio-first AI',
    description:
      'Groq maps your resume into hero copy, projects, gaps, and section order, not just another generic resume JSON file.',
  },
  {
    icon: Palette,
    title: 'Design beyond templates',
    description: 'Choose a strong starting theme, then tune accent, layout, density, and public light/dark presentation.',
  },
  {
    icon: Globe,
    title: 'Publish before momentum dies',
    description: 'Ship on a hosted URL immediately, then add a custom domain when the portfolio is worth pointing people to.',
  },
  {
    icon: BarChart3,
    title: 'Know what gets attention',
    description: 'See views first, then unlock the deeper traffic signals that tell you where real interest is coming from.',
  },
  {
    icon: Layers,
    title: 'One link with receipts',
    description: 'Pull together GitHub, LinkedIn, writing, design, socials, and proof-of-work links without making visitors hunt.',
  },
] as const;

/** Homepage teaser only—tier limits stay on /pricing. */
const productHighlights = [
  'Portfolio-specific AI, not generic resume parsing',
  'Guided editor that keeps every suggestion editable',
  'Distinct themes with public light and dark mode',
  'Proof links for repos, writing, socials, and profiles',
  'Analytics that show whether the portfolio is working',
  'Hosted URL first, custom domain when you are ready',
  'Markdown blog for proof that does not fit a resume',
  'No-code publishing without surrendering control',
] as const;

export function HomeMarketing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute left-8 top-20 hidden w-40 rotate-[-11deg] md:block"
            aria-hidden
          >
            <div className="h-5 w-24 rounded-sm border-4 border-foreground bg-primary shadow-[6px_6px_0_0_hsl(var(--foreground))] dark:shadow-[6px_6px_0_0_hsl(var(--secondary))]" />
            <div className="ml-9 mt-3 h-5 w-28 rounded-sm border-4 border-foreground bg-secondary shadow-[6px_6px_0_0_hsl(var(--foreground))] dark:shadow-[6px_6px_0_0_hsl(var(--primary))]" />
            <div className="ml-[4.5rem] mt-3 h-5 w-20 rounded-sm border-4 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] dark:shadow-[6px_6px_0_0_hsl(var(--secondary))]" />
          </div>
          <div
            className="pointer-events-none absolute right-8 top-24 hidden w-40 rotate-6 rounded-md border-4 border-foreground bg-card p-4 shadow-[8px_8px_0_0_hsl(var(--foreground))] dark:shadow-[8px_8px_0_0_hsl(var(--primary))] lg:block"
            aria-hidden
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="h-3 w-16 rounded-sm bg-primary" />
              <span className="h-3 w-8 rounded-sm bg-secondary" />
            </div>
            <div className="space-y-2">
              <span className="block h-2 rounded-sm bg-foreground/70" />
              <span className="block h-2 w-10/12 rounded-sm bg-foreground/45" />
              <span className="block h-2 w-7/12 rounded-sm bg-foreground/30" />
            </div>
            <div className="mt-4 rounded-sm border-2 border-foreground px-2 py-1 text-center font-mono text-[10px] font-black uppercase tracking-[0.18em]">
              proof
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6">
                Resume in. Proof-of-work site out.
              </Badge>
              <h1 className="font-display text-5xl font-black tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                Stop sending
                <span className="block">flat resumes.</span>
                <span className="block text-primary [text-shadow:3px_3px_0_hsl(var(--foreground))] dark:[text-shadow:3px_3px_0_hsl(var(--background))]">
                  Mint proof.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-balance text-lg font-semibold leading-8 text-foreground/80 sm:text-xl">
                FolioMint turns your resume into a live, editable proof-of-work site: sharper than a template builder,
                faster than a personal-site rebuild, and more convincing than a PDF attachment.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="xl">
                  <Link href="/generate">
                    Mint My Portfolio
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link href="/pricing">Compare Free vs Pro</Link>
                </Button>
              </div>
              <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
                {['No credit card', 'Hosted instantly', 'Every word editable'].map((item) => (
                  <div
                    key={item}
                    className="rounded-md border-2 border-foreground bg-card px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] shadow-[4px_4px_0_0_hsl(var(--foreground))] dark:shadow-[4px_4px_0_0_hsl(var(--primary))]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y-2 border-foreground bg-muted/70 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built to beat the blank-page problem
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                FolioMint does the hard first pass, then gives you the controls to make it sound and look like you.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-background">
                  <CardHeader>
                    <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))]">
                      <feature.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Three steps to your portfolio
              </h2>
            </div>
            <div className="mx-auto mt-16 grid max-w-4xl gap-12 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Feed the mint',
                  description: 'Upload a resume, paste text, or start blank. The app builds the first usable portfolio shape.',
                },
                {
                  step: '02',
                  title: 'Sharpen the proof',
                  description:
                    'Edit every AI suggestion, reorder sections, tune the headline, and pick a theme that fits your work.',
                },
                {
                  step: '03',
                  title: 'Publish the signal',
                  description: 'Share a hosted URL immediately, then add analytics, a blog, and a custom domain when ready.',
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="border-t bg-muted/30 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Pricing
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Free to prove it, Pro to grow it
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  The free tier is enough to publish a real portfolio. Pro adds the power features that cost money to run:
                  more AI, more sites, domains, blog, and deeper analytics.
                </p>
                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href="/pricing">
                      Compare Plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Card className="p-8">
                <div className="mb-7">
                  <p className="font-display text-xl font-semibold leading-snug tracking-tight text-foreground">
                    Why FolioMint has the upper hand
                  </p>
                </div>
                <ul className="space-y-4 font-sans">
                  {productHighlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3.5 text-[0.9375rem] font-medium leading-relaxed tracking-[-0.01em] text-foreground/90 sm:text-base sm:leading-[1.55]"
                    >
                      <Check
                        className="mt-[0.2em] h-[1.1em] w-[1.1em] shrink-0 text-primary"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      <span className="min-w-0 text-pretty">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your resume says what happened. Your portfolio proves it.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start with what you already have, publish something credible, and keep improving it as your work gets better.
              </p>
              <div className="mt-10">
                <Button asChild size="xl">
                  <Link href="/generate">
                    Mint Your Proof
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="mx-auto mt-6 max-w-md font-sans text-[0.9375rem] leading-relaxed tracking-[-0.01em] text-muted-foreground text-pretty sm:text-base sm:leading-[1.55]">
                You&apos;ll sign in before upload. Details and plans:{' '}
                <Link
                  href="/pricing"
                  className="font-semibold text-primary underline decoration-primary/40 underline-offset-[5px] transition-colors hover:text-primary/90 hover:decoration-primary hover:no-underline"
                >
                  Pricing
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
