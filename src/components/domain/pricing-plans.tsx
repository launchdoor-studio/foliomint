import Link from 'next/link';
import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingProCta } from '@/components/domain/pricing-pro-cta';
import { cn } from '@/lib/utils';

interface PlanFeature {
  text: string;
  included: boolean;
}

const proFeatures: PlanFeature[] = [
  { text: '20 Mint resume parses per day', included: true },
  { text: 'Mint improvements, gaps, and positioning suggestions', included: true },
  { text: 'Editable form editor', included: true },
  { text: 'Light & dark mode', included: true },
  { text: '10 platform integrations', included: true },
  { text: 'Advanced analytics (referrer, device, geo)', included: true },
  { text: 'All themes and advanced identity controls', included: true },
  { text: 'Hosted portfolio (no expiry)', included: true },
  { text: 'Unlimited uploads', included: true },
  { text: 'Multiple portfolios', included: true },
  { text: 'Custom domains', included: true },
  { text: 'Blog management (Markdown CRUD)', included: true },
  { text: 'Resume PDF export', included: true },
];

const freePlan = {
  name: 'Free',
  price: '$0',
  period: 'forever',
  description: 'Publish a real proof-of-work site without paying first.',
  features: [
    { text: '3 Mint resume parses per 30 days', included: true },
    { text: 'Editable form editor', included: true },
    { text: 'Light & dark mode', included: true },
    { text: '10 platform integrations', included: true },
    { text: 'Basic analytics (view counts)', included: true },
    { text: 'Core proof-first portfolio themes', included: true },
    { text: 'Hosted portfolio (3-month expiry)', included: true },
    { text: 'Unlimited uploads', included: false },
    { text: 'Multiple portfolios', included: false },
    { text: 'Custom domains', included: false },
    { text: 'Advanced analytics', included: false },
    { text: 'Blog management', included: false },
    { text: 'Premium themes and advanced customization', included: false },
  ] satisfies PlanFeature[],
  cta: 'Get Started',
  ctaHref: '/generate',
};

export interface PricingPlansProps {
  heading: string;
  description: string;
  proCtaLabel?: string;
  signInCallbackUrl?: string;
  launchOfferActive?: boolean;
  launchOfferDaysLeft?: number | null;
}

function PlanFeatureList({ features }: { features: PlanFeature[] }) {
  return (
    <ul className="space-y-3">
      {features.map((feature) => (
        <li key={feature.text} className="flex items-start gap-3 text-sm">
          {feature.included ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          ) : (
            <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
          )}
          <span className={cn(!feature.included && 'text-muted-foreground/60')}>{feature.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function PricingPlans({
  heading,
  description,
  proCtaLabel = 'Start Pro',
  signInCallbackUrl = '/pricing',
  launchOfferActive = false,
  launchOfferDaysLeft = null,
}: PricingPlansProps) {
  const gridClass = launchOfferActive
    ? 'mx-auto mt-16 grid max-w-6xl gap-8 scroll-mt-24 lg:grid-cols-3'
    : 'mx-auto mt-16 grid max-w-4xl gap-8 scroll-mt-24 lg:grid-cols-2';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{heading}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        {launchOfferActive && launchOfferDaysLeft !== null && (
          <p className="mt-3 text-sm text-muted-foreground">
            Launch special:{' '}
            <span className="font-medium text-foreground">$25 for your first year of Pro</span>.
            Introductory pricing during our opening month
            {launchOfferDaysLeft <= 14 && (
              <>
                {' '}
                (about {launchOfferDaysLeft === 1 ? '1 day' : `${launchOfferDaysLeft} days`} left)
              </>
            )}
            .
          </p>
        )}
      </div>

      <div id="compare" className={gridClass}>
        <Card className="relative flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{freePlan.name}</CardTitle>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{freePlan.price}</span>
              <span className="text-muted-foreground">{freePlan.period}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{freePlan.description}</p>
          </CardHeader>
          <CardContent className="flex-1">
            <PlanFeatureList features={freePlan.features} />
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline" size="lg">
              <Link href={freePlan.ctaHref}>{freePlan.cta}</Link>
            </Button>
          </CardFooter>
        </Card>

        {launchOfferActive && (
          <Card className="relative flex flex-col border-primary shadow-lg shadow-primary/15">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Launch offer</Badge>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Pro, 1 year</CardTitle>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$25</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Everything in Pro for a full year at our launch rate. About $2/mo vs $5/mo on
                monthly Pro, during our opening month.
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <PlanFeatureList features={proFeatures} />
            </CardContent>
            <CardFooter>
              <PricingProCta
                variant="default"
                size="lg"
                label="Claim launch offer"
                signInCallbackUrl={signInCallbackUrl}
                checkoutPlan="launch_year"
              />
            </CardFooter>
          </Card>
        )}

        <Card
          className={cn(
            'relative flex flex-col',
            !launchOfferActive && 'border-primary shadow-lg shadow-primary/10',
          )}
        >
          {!launchOfferActive && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Best leverage</Badge>
          )}
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Pro</CardTitle>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold">$5</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {launchOfferActive
                ? 'Same Pro features, billed monthly. Cancel anytime if you prefer flexibility.'
                : 'For people turning attention into interviews, clients, or opportunities.'}
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            <PlanFeatureList features={proFeatures} />
          </CardContent>
          <CardFooter>
            <PricingProCta
              variant={launchOfferActive ? 'outline' : 'default'}
              size="lg"
              label={proCtaLabel}
              signInCallbackUrl={signInCallbackUrl}
              checkoutPlan="pro_monthly"
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
