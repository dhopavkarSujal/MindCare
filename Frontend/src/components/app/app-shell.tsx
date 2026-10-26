"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity, BookOpenText, CalendarCheck, ChevronDown, CircleHelp, Compass,
  LayoutDashboard, Leaf, LogOut, Menu, MessageCircle, Settings2, ShieldCheck,
  SlidersHorizontal, UserRound, X,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/auth-client";

type Props = { children: React.ReactNode; user: { email: string; name: string } };
const primaryNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/chat", label: "AI companion", icon: MessageCircle },
  { href: "/mood", label: "Mood check-in", icon: Activity },
  { href: "/journal", label: "Journal", icon: BookOpenText },
  { href: "/app/resources", label: "Resources", icon: Compass },
  { href: "/counselling", label: "Counselling", icon: CalendarCheck },
];
const secondaryNav = [
  { href: "/profile", label: "Your profile", icon: UserRound },
  { href: "/settings", label: "Preferences", icon: SlidersHorizontal },
];
const titleByPath: Record<string, string> = {
  "/dashboard": "Your space", "/chat": "AI companion", "/mood": "Mood check-in",
  "/journal": "Private journal", "/app/resources": "Wellbeing library", "/counselling": "Counselling",
  "/profile": "Your profile", "/settings": "Preferences",
};

export function AppShell({ children, user }: Props) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const displayName = user.name.trim() || user.email.split("@")[0] || "there";
  const initials = displayName.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "M";

  useEffect(() => {
    // Close overlays after navigation changes without updating state during the effect itself.
    const frame = window.requestAnimationFrame(() => {
      setMobileOpen(false);
      setProfileOpen(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/");
      router.refresh();
    } catch {
      setSigningOut(false);
      window.alert("We couldn't sign you out just now. Please try again.");
    }
  }

  const renderLinks = (items: typeof primaryNav) => items.map(({ href, label, icon: Icon }) => {
    const active = pathname === href || (href === "/chat" && pathname.startsWith("/chat/"));
    return <Link key={href} href={href} onClick={() => { setMobileOpen(false); setProfileOpen(false); }} className={`mc-nav-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
      <Icon size={17} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>{active && <span className="mc-nav-link__active-dot" aria-hidden="true" />}
    </Link>;
  });

  return (
    <div className="mc-app-frame">
      {mobileOpen && <button aria-label="Close navigation" className="mc-mobile-scrim" onClick={() => setMobileOpen(false)} />}
      <aside className={`mc-sidebar${mobileOpen ? " is-open" : ""}`} aria-label="Main navigation">
        <div className="mc-sidebar__brand-row">
          <Link href="/dashboard" onClick={() => { setMobileOpen(false); setProfileOpen(false); }} className="mc-app-brand"><span className="mc-app-brand__mark"><Leaf size={19} /></span><span><strong>MindCare</strong><small>YOUR SPACE TO BREATHE</small></span></Link>
          <button className="mc-icon-button mc-sidebar__close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="mc-sidebar__caption">YOUR WELLBEING</div>
        <nav className="mc-sidebar__nav">{renderLinks(primaryNav)}</nav>
        <div className="mc-sidebar__separator" />
        <div className="mc-sidebar__caption">ACCOUNT</div>
        <nav className="mc-sidebar__nav">{renderLinks(secondaryNav)}</nav>
        <div className="mc-sidebar__bottom">
          <div className="mc-sidebar__care-card"><span className="mc-sidebar__care-icon"><ShieldCheck size={16} /></span><div><strong>A gentle reminder</strong><p>MindCare supports wellbeing. It isn&apos;t emergency or medical care.</p></div></div>
          <Link href="/resources" onClick={() => { setMobileOpen(false); setProfileOpen(false); }} className="mc-sidebar__help"><CircleHelp size={15} /> <span>Explore support resources</span></Link>
          <div className="mc-sidebar__version">MINDCARE · V2</div>
        </div>
      </aside>

      <div className="mc-app-main">
        <header className="mc-app-topbar">
          <div className="mc-app-topbar__left">
            <button className="mc-icon-button mc-app-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation" aria-expanded={mobileOpen}><Menu size={19} /></button>
            <div className="mc-app-breadcrumb"><span>MindCare</span><span className="mc-breadcrumb-slash">/</span><strong>{titleByPath[pathname] ?? (pathname.startsWith("/chat/") ? "Conversation" : "Your space")}</strong></div>
          </div>
          <div className="mc-app-topbar__right">
            <span className="mc-app-topbar__quiet"><span />A space for you</span>
            <div className="mc-profile-control">
              <button className="mc-profile-button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-haspopup="menu">
                <span className="mc-avatar">{initials}</span><span className="mc-profile-button__text"><strong>{displayName}</strong><small>{user.email || "MindCare member"}</small></span><ChevronDown size={15} />
              </button>
              {profileOpen && <div className="mc-profile-menu" role="menu"><Link href="/profile" onClick={() => { setMobileOpen(false); setProfileOpen(false); }} role="menuitem"><UserRound size={15} /> Profile</Link><Link href="/settings" onClick={() => { setMobileOpen(false); setProfileOpen(false); }} role="menuitem"><Settings2 size={15} /> Preferences</Link><button role="menuitem" onClick={signOut} disabled={signingOut}><LogOut size={15} />{signingOut ? "Signing out…" : "Sign out"}</button></div>}
            </div>
          </div>
        </header>
        <main className="mc-app-content" id="main-content">{children}</main>
        <footer className="mc-app-footer"><span><Leaf size={13} /> MindCare</span><span>Small steps count. Take them at your own pace.</span><span>Not a substitute for professional care.</span></footer>
      </div>
    </div>
  );
}
