import Link from "next/link";
import { Leaf } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`mc-brand${compact ? " mc-brand--compact" : ""}`} href="/" aria-label="MindCare home">
      <span className="mc-brand__mark" aria-hidden="true">
        <Leaf size={21} strokeWidth={1.8} />
      </span>
      <span className="mc-brand__copy">
        <span className="mc-brand__name">MindCare</span>
        {!compact && <span className="mc-brand__tagline">YOUR SPACE TO BREATHE</span>}
      </span>
    </Link>
  );
}
