
import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { HeroSection } from "@/components/marketing/hero-section";
import { ValueStrip } from "@/components/marketing/value-strip";
import { ExperienceSection } from "@/components/marketing/experience-section";
import { ScrollEffects } from "@/components/marketing/scroll-effects";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { ApproachSection } from "@/components/marketing/approach-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "A little room to breathe",
  description:
    "A student wellbeing space for mood check-ins, reflection, guided journaling, supportive AI conversations, and trusted wellbeing resources.",
  openGraph: {
    title: "MindCare — A little room to breathe",
    description:
      "Check in with yourself, make room to reflect, and explore everyday wellbeing tools at your own pace.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="mc-page">
      <a className="mc-skip-link" href="#main-content">
        Skip to content
      </a>

      <ScrollEffects />
      <SiteHeader />

      <main id="main-content">
        <HeroSection />
        <ValueStrip />
        <ExperienceSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ApproachSection />
        <CtaSection />
        <FaqSection />
      </main>

      <SiteFooter />
    </div>
  );
}
