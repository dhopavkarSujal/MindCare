import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { approachItems } from "@/lib/marketing-content";
import { MarketingIcon } from "@/components/marketing/marketing-icon";
import { SectionLabel } from "@/components/marketing/section-label";

export function ApproachSection() {
  return (
    <section id="our-approach" className="mc-section mc-approach">
      <div className="mc-container mc-approach__grid">
        <div className="mc-approach__visual" data-reveal="left">
          <div className="mc-approach-art">
            <div className="mc-approach-art__ring mc-approach-art__ring--outer" />
            <div className="mc-approach-art__ring mc-approach-art__ring--inner" />
            <div className="mc-approach-art__center"><Heart size={29} strokeWidth={1.5} /></div>
            <span className="mc-approach-art__leaf mc-approach-art__leaf--one" />
            <span className="mc-approach-art__leaf mc-approach-art__leaf--two" />
            <div className="mc-approach-art__note"><span>Take a breath.</span><strong>One moment at a time.</strong></div>
          </div>
          <div className="mc-approach-quote"><span aria-hidden="true">“</span><p>You do not have to fix everything today. You can begin by noticing how you feel.</p></div>
        </div>

        <div className="mc-approach__copy" data-reveal="right">
          <SectionLabel><Heart size={14} /> A thoughtful approach</SectionLabel>
          <h2>Support without pressure. <span>Progress without perfection.</span></h2>
          <p className="mc-approach__lead">Wellbeing is not a straight line. Some days you may want to reflect. Other days, simply taking a moment for yourself is enough.</p>
          <div className="mc-approach-list">
            {approachItems.map((item) => (
              <div className="mc-approach-item" key={item.title}>
                <span className="mc-approach-item__icon"><MarketingIcon name={item.icon} size={20} /></span>
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
              </div>
            ))}
          </div>
          <Link href="/register" className="mc-approach__link">Find your starting point <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}
