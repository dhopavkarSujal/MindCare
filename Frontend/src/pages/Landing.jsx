import {
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Brain,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F8FAFC] text-[#172033]">

      {/* Soft background decoration */}
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-[#DFF5F1] opacity-60 blur-3xl" />

      <div className="pointer-events-none absolute right-[-100px] top-[180px] h-80 w-80 rounded-full bg-[#E7F7F4] opacity-70 blur-3xl" />

      {/* Navbar */}
      <header className="relative z-10">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFF5F1]">
              <Sparkles
                size={20}
                className="text-[#0F766E]"
              />
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                MindCare
              </h1>

              <p className="text-[10px] text-slate-400">
                Your space to breathe
              </p>
            </div>

          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3" aria-label="Main navigation">

            <Link
              to="/login"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-[#0F766E] sm:px-4"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#115E59] active:scale-[0.98]"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>

          </nav>
        </div>

      </header>

      {/* Hero */}
      <main className="relative z-10">

        <section className="mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 lg:px-10 lg:pb-28 lg:pt-20">

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">

            {/* Left */}
            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#CDEDE8] bg-white px-3 py-1.5 shadow-sm">

                <span className="h-2 w-2 rounded-full bg-[#0F766E]" />

                <span className="text-xs font-medium text-[#0F766E]">
                  A private space for your wellbeing
                </span>

              </div>

              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-[#172033] sm:text-5xl lg:text-6xl">
                Your mental wellbeing
                <span className="block text-[#0F766E]">
                  deserves space.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#64748B] sm:text-lg">
                MindCare gives you a calm digital space to reflect,
                understand your mood, talk through what's on your mind,
                and discover helpful support.
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-900/10 transition hover:bg-[#115E59] hover:shadow-lg active:scale-[0.98]"
                >
                  Create your account
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-[#172033] transition hover:border-[#B8E4DE] hover:bg-[#F7FFFD]"
                >
                  Sign in
                </Link>

              </div>

              {/* Trust */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck
                    size={15}
                    className="text-[#0F766E]"
                  />
                  Private experience
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <HeartPulse
                    size={15}
                    className="text-[#0F766E]"
                  />
                  Wellbeing focused
                </div>

              </div>

            </div>

            {/* Right preview */}
            <div className="relative">

              {/* Main card */}
              <div className="relative mx-auto max-w-md rounded-[28px] border border-white bg-white p-4 shadow-[0_25px_70px_rgba(15,118,110,0.12)]">

                {/* Fake app header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-3 pb-4">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DFF5F1]">
                      <Sparkles
                        size={15}
                        className="text-[#0F766E]"
                      />
                    </div>

                    <span className="text-sm font-semibold">
                      MindCare
                    </span>

                  </div>

                  <div className="h-8 w-8 rounded-full bg-slate-100" />

                </div>

                {/* Preview content */}
                <div className="p-4">

                  <p className="text-xs font-medium text-[#0F766E]">
                    Good afternoon
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    How are you feeling?
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Take a moment to check in with yourself.
                  </p>

                  {/* Mood */}
                  <div className="mt-6 flex justify-between rounded-2xl bg-[#F8FAFC] p-3">

                    {["😞", "😕", "😐", "🙂", "😄"].map(
                      (emoji, index) => (
                        <div
                          key={emoji}
                          className={`
                            flex h-12 w-12 items-center justify-center rounded-xl text-2xl
                            ${
                              index === 3
                                ? "bg-[#DFF5F1] ring-2 ring-[#BCE7E1]"
                                : "bg-white"
                            }
                          `}
                        >
                          {emoji}
                        </div>
                      )
                    )}

                  </div>

                  {/* Chat preview */}
                  <div className="mt-5 rounded-2xl border border-slate-100 p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DFF5F1]">
                        <MessageCircle
                          size={17}
                          className="text-[#0F766E]"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#172033]">
                          Talk to MindCare
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          A private space to talk about what's on
                          your mind.
                        </p>
                      </div>

                    </div>

                    <div className="mt-4 flex items-center justify-between">

                      <span className="text-[10px] text-slate-400">
                        Available anytime
                      </span>

                      <span className="text-xs font-semibold text-[#0F766E]">
                        Open chat →
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* Floating card */}
              <div className="absolute -bottom-7 -left-4 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:block">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFF5F1]">
                    <CheckCircle2
                      size={18}
                      className="text-[#0F766E]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      A space for you
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Reflect • Talk • Understand
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Features */}
        <section className="border-y border-slate-200 bg-white">

          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">

            <div className="max-w-2xl">

              <p className="text-sm font-medium text-[#0F766E]">
                What you can do
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Simple tools for everyday wellbeing.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Everything is designed to keep the experience focused,
                calm, and easy to use.
              </p>

            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {[
                {
                  icon: MessageCircle,
                  title: "Talk",
                  text: "Have supportive conversations in your private space.",
                },
                {
                  icon: HeartPulse,
                  title: "Track",
                  text: "Record your mood and notice patterns over time.",
                },
                {
                  icon: Brain,
                  title: "Reflect",
                  text: "Use journaling to put your thoughts into words.",
                },
                {
                  icon: ShieldCheck,
                  title: "Find Support",
                  text: "Explore resources and professional support when needed.",
                },
              ].map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                  >

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DFF5F1]">
                      <Icon
                        size={20}
                        className="text-[#0F766E]"
                      />
                    </div>

                    <h3 className="mt-5 font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {feature.text}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">

          <div className="overflow-hidden rounded-3xl bg-[#0F766E] px-6 py-10 text-center sm:px-10">

            <Sparkles
              size={24}
              className="mx-auto text-teal-100"
            />

            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
              Start with one small check-in.
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-teal-50/80">
              Create your MindCare space and explore the experience
              at your own pace.
            </p>

            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0F766E] transition hover:bg-teal-50"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10 sm:text-left">

          <p className="text-xs text-slate-400">
            © 2026 MindCare. A digital wellbeing platform.
          </p>

          <p className="text-xs text-slate-400">
            Supportive technology, designed with care.
          </p>

        </div>

      </footer>

    </div>
  );
}