import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mc-section-heading mc-enter"><div><div className="mc-eyebrow">{eyebrow ?? "MINDCARE"}</div><h1 className="mc-page-title">{title}</h1>{description && <p className="mc-section-heading__description">{description}</p>}</div>{action && <div className="mc-section-heading__action">{action}</div>}</div>;
}
