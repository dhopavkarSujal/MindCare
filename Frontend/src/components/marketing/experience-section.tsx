import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Compass,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { SectionLabel } from "@/components/marketing/section-label";

const week = [
  { day: "M", height: 42 },
  { day: "T", height: 63 },
  { day: "W", height: 49 },
  { day: "T", height: 75 },
  { day: "F", height: 55 },
  { day: "S", height: 84 },
  { day: "S", height: 60 },
];

const sidebarItems = [
  { label: "Overview", icon: Home, active: true },
  { label: "Mood tracker", icon: Activity, active: false },
  { label: "Journal", icon: BookOpen, active: false },
  { label: "AI companion", icon: MessageCircle, active: false },
  { label: "Resources", icon: Compass, active: false },
];

export function ExperienceSection() {
  return (
    <section className="mc-section mc-experience" id="inside-mindcare">
      <div className="mc-container">
        <div className="mc-experience__heading" data-reveal="up">
          <SectionLabel><Sparkles size={14} /> A look inside your space</SectionLabel>
          <h2>Not another thing to keep up with. <span>A place to check in with yourself.</span></h2>
          <p>MindCare brings a few thoughtful wellbeing tools together, so you can choose what feels useful today and leave the rest for later.</p>
        </div>

        <div className="mc-experience__layout">
          <div className="mc-experience__copy" data-reveal="left">
            <div className="mc-experience__eyebrow"><span className="mc-experience__eyebrow-dot" /> YOUR SPACE, YOUR PACE</div>
            <h3>A little more aware of how you feel.</h3>
            <p>Check in, notice what is on your mind, and explore small ways to care for yourself. No streaks to protect, no perfect answers to find.</p>
            <div className="mc-experience__benefits">
              <div><span><Check size={15} /></span><p><strong>Start with one small moment</strong><small>A mood check-in can be enough for today.</small></p></div>
              <div><span><Check size={15} /></span><p><strong>Choose a tool that fits</strong><small>Reflect, write, talk, or explore a resource.</small></p></div>
              <div><span><Check size={15} /></span><p><strong>Come back when it helps</strong><small>Your wellbeing does not need another deadline.</small></p></div>
            </div>
            <Link className="mc-experience__link" href="/register">Explore your space <ArrowRight size={16} /></Link>
          </div>

          <div className="mc-dashboard-wrap" data-reveal="right" aria-label="Illustrative preview of the MindCare dashboard">
            <div className="mc-dashboard-orbit mc-dashboard-orbit--one" aria-hidden="true" />
            <div className="mc-dashboard-orbit mc-dashboard-orbit--two" aria-hidden="true" />
            <div className="mc-dashboard">
              <aside className="mc-dashboard__sidebar" aria-label="Preview navigation">
                <div className="mc-dashboard__brand"><span><Heart size={15} fill="currentColor" /></span><b>MindCare</b></div>
                <span className="mc-dashboard__sidebar-label">YOUR SPACE</span>
                <div className="mc-dashboard__menu">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div className={`mc-dashboard__menu-item${item.active ? " is-active" : ""}`} key={item.label}>
                        <Icon size={15} /><span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mc-dashboard__sidebar-note"><span><CircleHelp size={15} /></span><small>Need a little support?<br /><b>Explore resources</b></small></div>
              </aside>

              <div className="mc-dashboard__main">
                <div className="mc-dashboard__topbar">
                  <div><span className="mc-dashboard__breadcrumb">My space</span><span className="mc-dashboard__slash">/</span><b>Overview</b></div>
                  <span className="mc-dashboard__demo-pill"><span /> PREVIEW</span>
                </div>

                <div className="mc-dashboard__welcome">
                  <div><p>YOUR PERSONAL WELLBEING SPACE</p><h3>A moment for yourself.</h3><span>Start wherever you are today.</span></div>
                  <div className="mc-dashboard__sun" aria-hidden="true"><span /><i /><b /></div>
                </div>

                <div className="mc-dashboard__top-cards">
                  <div className="mc-mini-card mc-mini-card--mood">
                    <div className="mc-mini-card__label"><span><Activity size={14} /></span> Mood check-in</div>
                    <div className="mc-mini-card__value">How are you <em>feeling?</em></div>
                    <div className="mc-mini-card__footer"><span className="mc-mini-dots"><i /><i /><i /><i /><i /></span><span>Take a moment <ArrowRight size={12} /></span></div>
                  </div>
                  <div className="mc-mini-card mc-mini-card--journal">
                    <div className="mc-mini-card__label"><span><BookOpen size={14} /></span> Journal prompt</div>
                    <p>What is one thing you need a little more of today?</p>
                    <span className="mc-mini-card__quiet">A gentle place to begin</span>
                  </div>
                </div>

                <div className="mc-dashboard__chart-card">
                  <div className="mc-dashboard__chart-head"><div><b>Your week, at a glance</b><span>Illustrative preview · not personal data</span></div><span className="mc-dashboard__chart-more" aria-hidden="true"><MoreHorizontal size={18} /></span></div>
                  <div className="mc-dashboard__chart">
                    <div className="mc-dashboard__y-labels" aria-hidden="true"><span>Good</span><span>Okay</span><span>Low</span></div>
                    <div className="mc-dashboard__bars" role="img" aria-label="Illustrative mood chart for seven sample days; no personal data is displayed">
                      {week.map((item, index) => (
                        <div className={`mc-dashboard__bar-col${index === 5 ? " is-highlighted" : ""}`} key={`${item.day}-${index}`}>
                          <div className="mc-dashboard__bar-track"><span style={{ height: `${item.height}%`, animationDelay: `${index * 70}ms` }} /></div>
                          <small>{item.day}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mc-dashboard__bottom-row">
                  <div className="mc-dashboard__reflection"><span className="mc-dashboard__reflection-icon"><Sparkles size={14} /></span><div><b>A thought to explore</b><p>What felt a little lighter today?</p></div></div>
                  <div className="mc-dashboard__progress"><span className="mc-dashboard__progress-mark"><Check size={14} /></span><div><b>Small steps count</b><span>There is no perfect pace.</span></div></div>
                </div>
              </div>
            </div>
            <div className="mc-dashboard-float"><span><Sparkles size={15} /></span><div><b>One moment is enough</b><small>A little progress, on your terms</small></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
