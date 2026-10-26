import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

type Props = { title: string; children: React.ReactNode };

/** Shared shell for legal pages. Content must be supplied/approved by the institution. */
export function LegalPage({ title, children }: Props) {
  return (
    <div className="mc-page">
      <SiteHeader />
      <main id="main-content" className="mc-container" style={{ maxWidth: 760, padding: "72px 0 96px" }}>
        <h1 className="mc-display" style={{ fontSize: "clamp(2.4rem, 5vw, 3.4rem)", lineHeight: 1.08, color: "var(--mc-primary-dark)" }}>
          {title}
        </h1>
        <div className="mc-alert mc-alert--info" role="note" style={{ margin: "24px 0 32px", display: "flex", gap: 10 }}>
          <ShieldCheck size={18} aria-hidden="true" style={{ flex: "none", marginTop: 2 }} />
          <p style={{ margin: 0 }}>
            This page is a placeholder. The final wording must be written and approved by the organisation operating
            MindCare before launch. Nothing here should be read as a legal commitment.
          </p>
        </div>
        {children}
        <p style={{ marginTop: 40 }}>
          <Link href="/" className="mc-inline-link">Back to home</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
