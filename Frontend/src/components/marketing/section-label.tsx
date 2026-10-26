import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mc-section-label">
      <span className="mc-section-label__dot" aria-hidden="true" />
      {children}
    </span>
  );
}
