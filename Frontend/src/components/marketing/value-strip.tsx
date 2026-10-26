import { valueItems } from "@/lib/marketing-content";
import { MarketingIcon } from "@/components/marketing/marketing-icon";

export function ValueStrip() {
  return (
    <section className="mc-value-strip" aria-label="The MindCare approach">
      <div className="mc-container mc-value-strip__grid">
        {valueItems.map((item) => (
          <div className="mc-value-item" key={item.title}>
            <span className="mc-value-item__icon"><MarketingIcon name={item.icon} size={20} /></span>
            <span className="mc-value-item__copy">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
