import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { featureItems } from "@/lib/marketing-content";
import { MarketingIcon } from "@/components/marketing/marketing-icon";
import { SectionLabel } from "@/components/marketing/section-label";

export function FeaturesSection() {
  return (
    <section id="features" className="mc-section mc-features">
      <div className="mc-container">
        <div className="mc-section-heading mc-section-heading--split" data-reveal="up">
          <div className="mc-section-heading__main">
            <SectionLabel>Made for everyday wellbeing</SectionLabel>
            <h2>Small tools. <span>More room to understand yourself.</span></h2>
          </div>
          <p className="mc-section-heading__aside">
            Start with what feels useful today. Come back to the rest when you are ready.
          </p>
        </div>

        <div className="mc-feature-grid">
          {featureItems.map((item) => (
            <article className={`mc-feature-card mc-feature-card--${item.tone}`} key={item.number} data-reveal="up" data-reveal-delay={String((Number(item.number) - 1) * 90)}>
              <div className="mc-feature-card__top">
                <span className="mc-feature-card__icon"><MarketingIcon name={item.icon} size={22} /></span>
                <span className="mc-feature-card__number">{item.number}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="mc-feature-card__bottom">
                <span>{item.tag}</span>
              </div>
            </article>
          ))}
        </div>
        <p className="mc-section-footnote">Explore at your own pace. These tools support reflection; they do not replace professional care.</p>
        <div className="mc-inline-cta"><Link href="/register">Find your starting point <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}
