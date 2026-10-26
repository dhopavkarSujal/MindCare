import Link from "next/link";
import { Brand } from "@/components/marketing/brand";

export function SiteFooter() {
  return (
    <footer className="mc-footer">
      <div className="mc-container">
        <div className="mc-footer__main">
          <div className="mc-footer__brand-block">
            <Brand />
            <p>A calmer space for everyday reflection, emotional awareness, and wellbeing.</p>
          </div>
          <div className="mc-footer__column">
            <h2>Explore</h2>
            <Link href="/#features">What you can do</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/#our-approach">Our approach</Link>
            <Link href="/#faq">FAQs</Link>
          </div>
          <div className="mc-footer__column">
            <h2>Your account</h2>
            <Link href="/register">Create account</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
        <div className="mc-footer__bottom">
          <p>© {new Date().getFullYear()} MindCare. A digital wellbeing platform.</p>
          <p>MindCare is not a substitute for professional mental health care or emergency assistance.</p>
        </div>
      </div>
    </footer>
  );
}
