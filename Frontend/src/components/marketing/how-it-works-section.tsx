import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { processSteps } from "@/lib/marketing-content";
import { SectionLabel } from "@/components/marketing/section-label";

export function HowItWorksSection() {
  return (
    <section className="mc-section mc-process" id="how-it-works">
      <div className="mc-container">
        <div className="mc-process__intro" data-reveal="up">
          <SectionLabel>A gentle place to begin</SectionLabel>
          <h2>You do not need to have it all figured out.</h2>
          <p>MindCare is here for the small moments that help you pause, reflect, and decide what might help next.</p>
        </div>
        <div className="mc-process__steps">
          {processSteps.map((step, index) => (
            <article className="mc-step" key={step.number} data-reveal="up" data-reveal-delay={String(index * 110)}>
              <div className="mc-step__number-row">
                <span className="mc-step__number">{step.number}</span>
                {index < processSteps.length - 1 && <span className="mc-step__connector" aria-hidden="true" />}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
        <div className="mc-process__footer">
          <span><span className="mc-process__footer-dot" /> There is no perfect way to start.</span>
          <Link href="/register">Take the first step <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}
