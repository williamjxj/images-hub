import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PortraitHero } from "@/components/portrait/portrait-hero";
import { PortraitFeatures } from "@/components/portrait/portrait-features";
import { PortraitParallaxGallery } from "@/components/portrait/portrait-parallax-gallery";
import { PortraitPeerNetwork } from "@/components/portrait/portrait-peer-network";
import { PortraitBenefits } from "@/components/portrait/portrait-benefits";
import { PortraitFAQ } from "@/components/portrait/portrait-faq";
import { PortraitFooter } from "@/components/portrait/portrait-footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Image Search Hub",
  description: "Search for images across Unsplash, Pixabay, and Pexels",
};

/**
 * Home Page - Portrait Clone Landing Page
 *
 * A visual clone of portrait.so landing page, adapted for image hub/search theme.
 * Features: Hero section, features, benefits, FAQ, and footer sections.
 *
 * Requires authentication - redirects to sign-in if not authenticated
 */
export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

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
