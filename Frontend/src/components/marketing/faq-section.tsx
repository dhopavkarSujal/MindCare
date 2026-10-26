import { ChevronDown } from "lucide-react";
import { frequentlyAskedQuestions } from "@/lib/marketing-content";
import { SectionLabel } from "@/components/marketing/section-label";

export function FaqSection() {
  return (
    <section className="mc-section mc-faq" id="faq">
      <div className="mc-container mc-faq__grid">
        <div className="mc-faq__intro" data-reveal="left">
          <SectionLabel>Questions, answered</SectionLabel>
          <h2>A few things you might want to know.</h2>
          <p>It is okay to have questions before getting started. Here are some useful things to understand about MindCare.</p>
        </div>
        <div className="mc-faq__list" data-reveal="right">
          {frequentlyAskedQuestions.map((item, index) => (
            <details className="mc-faq-item" key={item.question} open={index === 0}>
              <summary>
                <span>{item.question}</span>
                <span className="mc-faq-item__icon"><ChevronDown size={17} /></span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
