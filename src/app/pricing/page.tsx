import { Navbar } from '@/components/domain/navbar';
import { Footer } from '@/components/domain/footer';
import { PricingPlans } from '@/components/domain/pricing-plans';
import { getLaunchOfferDaysLeft, isLaunchOfferActive } from '@/lib/launch-offer';

export default function PricingPage() {
  const launchOfferActive = isLaunchOfferActive();
  const launchOfferDaysLeft = launchOfferActive ? getLaunchOfferDaysLeft() : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-24 sm:py-32">
        <PricingPlans
          heading="Simple, transparent pricing"
          description={
            launchOfferActive
              ? 'Start free. During our launch month, get a full year of Pro for $25, or stay flexible with monthly billing.'
              : 'Start free, upgrade when you need more. No hidden fees, cancel anytime.'
          }
          launchOfferActive={launchOfferActive}
          launchOfferDaysLeft={launchOfferDaysLeft}
        />
      </main>

      <Footer />
    </div>
  );
}
