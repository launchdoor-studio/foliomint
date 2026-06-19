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

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Publish a real proof-of-work site without paying first.',
    features: [
      { text: '3 Groq AI parses per day', included: true },
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
    ],
    cta: 'Get Started',
    ctaHref: '/generate',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$5',
    period: '/month',
    description: 'For people turning attention into interviews, clients, or opportunities.',
    features: [
      { text: '50 Groq AI parses per day', included: true },
      { text: 'AI rewrites, gaps, and positioning suggestions', included: true },
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
    ],
    cta: 'Start Pro',
    ctaHref: '/pricing',
    highlighted: true,
  },
];

export interface PricingPlansProps {
  heading: string;
  description: string;
  /** Shown on the Pro plan checkout button (e.g. upgrade flow vs marketing). */
  proCtaLabel?: string;
  /** Where to send users after signing in to complete checkout. */
  signInCallbackUrl?: string;
}

export function PricingPlans({
  heading,
  description,
  proCtaLabel = 'Start Pro',
  signInCallbackUrl = '/pricing',
}: PricingPlansProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{heading}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      </div>

      <div
        id="compare"
        className="mx-auto mt-16 grid max-w-4xl gap-8 scroll-mt-24 lg:grid-cols-2"
      >
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'relative flex flex-col',
              plan.highlighted && 'border-primary shadow-lg shadow-primary/10',
            )}
          >
            {plan.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Best leverage</Badge>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3 text-sm">
                    {feature.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={cn(!feature.included && 'text-muted-foreground/60')}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.highlighted ? (
                <PricingProCta
                  variant="default"
                  size="lg"
                  label={proCtaLabel}
                  signInCallbackUrl={signInCallbackUrl}
                />
              ) : (
                <Button asChild className="w-full" variant="outline" size="lg">
                  <Link href={plan.ctaHref}>{plan.cta}</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
