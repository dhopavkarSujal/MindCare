import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="mc-cta-wrap" id="get-started">
      <div className="mc-container">
        <div className="mc-cta" data-reveal="up">
          <div className="mc-cta__content">
            <span className="mc-cta__icon"><Sparkles size={23} /></span>
            <p className="mc-cta__eyebrow">A little space for yourself</p>
            <h2>You can start small. <span>You can start today.</span></h2>
            <p>Make room to reflect, explore your feelings, and discover the tools that fit your needs.</p>
            <Link href="/register" className="mc-button mc-button--large">
              Create your MindCare account <ArrowRight size={16} />
            </Link>
            <span className="mc-cta__signin">Already have an account? <Link href="/login">Sign in</Link></span>
          </div>
        </div>
      </div>
    </section>
  );
}
