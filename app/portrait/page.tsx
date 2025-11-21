/**
 * Portrait Clone Page
 * 
 * A visual clone of portrait.so landing page, adapted for image hub/search theme.
 * Features: Hero section, features, benefits, FAQ, and footer sections.
 */

import { PortraitHero } from "./components/portrait-hero";
import { PortraitFeatures } from "./components/portrait-features";
import { PortraitParallaxGallery } from "./components/portrait-parallax-gallery";
import { PortraitPeerNetwork } from "./components/portrait-peer-network";
import { PortraitBenefits } from "./components/portrait-benefits";
import { PortraitFAQ } from "./components/portrait-faq";
import { PortraitFooter } from "./components/portrait-footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export default function PortraitPage() {
  return (
    <div className="min-h-screen bg-background antialiased">
      {/* Scroll progress indicator */}
      <ScrollProgress />
      
      {/* Rounded container wrapper like portrait.so */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-3xl overflow-hidden bg-background shadow-sm border border-border/50">
          <main className="relative">
            <PortraitHero />
            <PortraitFeatures />
            <PortraitParallaxGallery />
            <PortraitPeerNetwork />
            <PortraitBenefits />
            <PortraitFAQ />
          </main>
          <PortraitFooter />
        </div>
      </div>
    </div>
  );
}
