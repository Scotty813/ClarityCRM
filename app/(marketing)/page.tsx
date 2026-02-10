import { HeroSection } from "@/components/marketing/hero-section";
import { LogoBar } from "@/components/marketing/logo-bar";
import { FeaturesSection } from "@/components/marketing/features-section";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { CtaSection } from "@/components/marketing/cta-section";

export default function MarketingPage() {
  return (
    <main>
      <HeroSection />
      <LogoBar />
      <FeaturesSection />
      <FeatureShowcase />
      <TestimonialsSection />
      <CtaSection />
    </main>
  );
}
