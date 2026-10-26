import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HeartHandshake,
  Leaf,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/marketing/brand";

type AuthShellProps = {
  mode: "login" | "register";
  children: React.ReactNode;
};

export function AuthShell({ mode, children }: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <main className={`mc-auth mc-auth--${mode}`}>
      <aside className="mc-auth__visual" aria-label="About MindCare">
        <div className="mc-auth__orb mc-auth__orb--one" aria-hidden="true" />
        <div className="mc-auth__orb mc-auth__orb--two" aria-hidden="true" />
        <div className="mc-auth__visual-grid" aria-hidden="true" />

        <div className="mc-auth__visual-inner">
          <div className="mc-auth__brand-row">
            <Brand />
            <span className="mc-auth__brand-chip">
              <Leaf size={13} aria-hidden="true" />
              A little room to breathe
            </span>
          </div>

          <div className="mc-auth__story">
            <div className="mc-auth__eyebrow">
              <span className="mc-auth__eyebrow-dot" />
              {isLogin ? "YOUR SPACE IS HERE" : "START AT YOUR OWN PACE"}
            </div>
            <h1>
              {isLogin ? (
                <>Welcome back to <em>your space.</em></>
              ) : (
                <>Make a little room for <em>yourself.</em></>
              )}
            </h1>
            <p>
              {isLogin
                ? "Pick up where you left off. Take a breath, reflect on your day, and move forward one small step at a time."
                : "Build a gentle routine for checking in with yourself, exploring your feelings, and finding helpful resources."}
            </p>

            {isLogin ? <CheckInPreview /> : <WelcomeBenefits />}
          </div>

          <div className="mc-auth__visual-footer">
            <div className="mc-auth__footer-icon" aria-hidden="true">
              <HeartHandshake size={17} />
            </div>
            <p>
              Thoughtful tools for everyday wellbeing.
              <span>Not a replacement for professional care.</span>
            </p>
            <span className="mc-auth__footer-arrow" aria-hidden="true">
              <ArrowRight size={17} />
            </span>
          </div>
        </div>
      </aside>

      <section className="mc-auth__main" aria-label={isLogin ? "Sign in" : "Create account"}>
        <div className="mc-auth__main-top">
          <Link className="mc-auth__back" href="/">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Back to home</span>
          </Link>
          <div className="mc-auth__mobile-brand">
            <Brand compact />
          </div>
          <p className="mc-auth__top-note">
            {isLogin ? "New around here?" : "Already part of MindCare?"}{" "}
            <Link href={isLogin ? "/register" : "/login"}>
              {isLogin ? "Create an account" : "Sign in"}
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </p>
        </div>

        <div className="mc-auth__content-wrap">
          <div className="mc-auth__content-enter">{children}</div>
        </div>

        <footer className="mc-auth__bottom-note">
          <span>© {new Date().getFullYear()} MindCare</span>
          <span className="mc-auth__bottom-dot" aria-hidden="true" />
          <span>A supportive digital wellbeing space</span>
        </footer>
      </section>
    </main>
  );
}

function CheckInPreview() {
  return (
    <div className="mc-auth__preview" role="img" aria-label="Illustrative daily check-in preview with four example mood options. This is not saved user data.">
      <div className="mc-auth__preview-top">
        <div>
          <span className="mc-auth__preview-kicker">A MOMENT FOR YOU</span>
          <strong>How are you feeling today?</strong>
        </div>
        <span className="mc-auth__preview-sparkle" aria-hidden="true">
          <Sparkles size={18} />
        </span>
      </div>
      <div className="mc-auth__moods" aria-hidden="true">
        <span><i>☺</i><small>Good</small></span>
        <span><i>◡</i><small>Okay</small></span>
        <span><i>﹏</i><small>Low</small></span>
        <span><i>∿</i><small>Unsure</small></span>
      </div>
      <div className="mc-auth__preview-bottom">
        <span className="mc-auth__preview-status"><span /> A gentle check-in</span>
        <span className="mc-auth__preview-time">~ 1 min</span>
      </div>
      <p className="mc-auth__preview-disclaimer">Illustrative preview · Not saved data</p>
    </div>
  );
}

function WelcomeBenefits() {
  const benefits = [
    "Check in with your mood",
    "Reflect through guided journaling",
    "Explore supportive conversations",
  ];

  return (
    <div className="mc-auth__benefits">
      <div className="mc-auth__benefits-heading">
        <span className="mc-auth__benefits-icon" aria-hidden="true"><Sparkles size={17} /></span>
        <div>
          <strong>A space that starts with you</strong>
          <span>Small steps, at your pace</span>
        </div>
      </div>
      {benefits.map((benefit) => (
        <div className="mc-auth__benefit" key={benefit}>
          <span className="mc-auth__benefit-check" aria-hidden="true"><Check size={12} /></span>
          <span>{benefit}</span>
        </div>
      ))}
      <div className="mc-auth__benefits-note">
        <span aria-hidden="true">“</span>
        You don’t have to figure everything out today.
      </div>
    </div>
  );
}
