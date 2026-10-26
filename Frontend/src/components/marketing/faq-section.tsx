import { ChevronDown } from "lucide-react";
import { frequentlyAskedQuestions } from "@/lib/marketing-content";
import { SectionLabel } from "@/components/marketing/section-label";

export function FaqSection() {
  return (
    <section className="mc-section mc-faq" id="faq" aria-labelledby="mc-faq-heading">
      <div className="mc-container mc-faq__grid">
        <div className="mc-faq__intro" data-reveal="left">
          <SectionLabel>Questions, answered</SectionLabel>
          <h2 id="mc-faq-heading">A few things you might want to know.</h2>
          <p>
            It is okay to have questions before getting started. Here are some useful things to
            understand about MindCare.
          </p>
          <div className="mc-faq__aside-note" aria-hidden="true">
            <span className="mc-faq__aside-mark">
              <span />
              <span />
              <span />
            </span>
            <span>Take your time. Explore at your own pace.</span>
          </div>
        </div>

        <div className="mc-faq__list" data-reveal="right">
          {frequentlyAskedQuestions.map((item, index) => (
            <details
              className="mc-faq-item"
              key={item.question}
              open={index === 0}
              style={{ "--faq-index": index } as React.CSSProperties}
            >
              <summary>
                <span className="mc-faq-item__question">
                  <span className="mc-faq-item__number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item.question}</span>
                </span>
                <span className="mc-faq-item__icon" aria-hidden="true">
                  <ChevronDown size={17} strokeWidth={1.8} />
                </span>
              </summary>
              <div className="mc-faq-item__answer">
                <div className="mc-faq-item__answer-inner">
                  <p>{item.answer}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
