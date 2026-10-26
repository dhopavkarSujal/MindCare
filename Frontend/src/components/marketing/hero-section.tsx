import Link from "next/link";
import { ArrowRight, ArrowUpRight, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { MoodPreview } from "@/components/marketing/mood-preview";
import { SectionLabel } from "@/components/marketing/section-label";

export function HeroSection() {
  return (
    <section className="mc-hero">
      <div className="mc-container mc-hero__grid">
        <div className="mc-hero__copy" data-reveal="left">
          <SectionLabel><Sparkles size={14} /> A little space, just for you</SectionLabel>
          <h1 className="mc-display-heading">
            Your mind deserves <span className="mc-heading-accent">a little room.<span className="mc-heading-underline" aria-hidden="true" /></span>
          </h1>
          <p className="mc-hero__description">
            Student life can ask a lot of you. MindCare brings mood check-ins, guided reflection, supportive conversations, and practical resources into one calmer space—so you can pause and figure out what might help next.
          </p>
          <div className="mc-hero__actions">
            <Link href="/register" className="mc-button mc-button--large">
              Create your space <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a href="#features" className="mc-button mc-button--outline mc-button--large">
              See how it works <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="mc-hero__reassurance">
            <span><ShieldCheck size={16} aria-hidden="true" /> Made for real-life moments</span>
            <span><Heart size={16} aria-hidden="true" /> Small steps count</span>
          </div>
        </div>
        <div className="mc-hero__visual" data-reveal="right">
          <MoodPreview />
        </div>
      </div>
      <div className="mc-hero__edge" aria-hidden="true"><span /><span /><span /></div>
    </section>
  );
}
