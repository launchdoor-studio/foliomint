import { Navbar } from '@/components/domain/navbar';
import { Footer } from '@/components/domain/footer';
import { PricingPlans } from '@/components/domain/pricing-plans';
import { getLaunchOfferDaysLeft, isLaunchOfferActive } from '@/lib/launch-offer';

export default function UpgradePage() {
  const launchOfferActive = isLaunchOfferActive();
  const launchOfferDaysLeft = launchOfferActive ? getLaunchOfferDaysLeft() : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-24 sm:py-32">
        <PricingPlans
          heading="Upgrade to Pro"
          description="Compare Free and Pro. Unlock Mint parsing, custom domains, the blog, advanced analytics, and more."
          proCtaLabel="Upgrade to Pro"
          signInCallbackUrl="/upgrade"
          launchOfferActive={launchOfferActive}
          launchOfferDaysLeft={launchOfferDaysLeft}
        />
      </main>

      <Footer />
    </div>
  );
}
