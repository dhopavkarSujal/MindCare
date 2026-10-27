"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Activity, CalendarCheck, ClipboardList, Leaf, LogOut, ShieldCheck, Users } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/auth-client";
import type { MindCareRole } from "@/lib/auth/roles";

type Props = {
  role: Extract<MindCareRole, "ADMIN" | "COUNSELOR">;
  email: string;
  children: ReactNode;
};

export function RoleDashboardShell({ role, email, children }: Props) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const isAdmin = role === "ADMIN";

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
      window.alert("We couldn't sign you out just now. Please try again.");
    }
  }

  return (
    <div className="mc-role-frame">
      <header className="mc-role-header">
        <Link href={isAdmin ? "/admin" : "/counselor"} className="mc-role-brand">
          <span className="mc-role-brand__mark"><Leaf size={20} aria-hidden="true" /></span>
          <span><strong>MindCare</strong><small>{isAdmin ? "ADMIN CONSOLE" : "COUNSELOR WORKSPACE"}</small></span>
        </Link>
        <div className="mc-role-header__right">
          <span className="mc-role-account"><span className="mc-role-account__icon">{isAdmin ? <ShieldCheck size={16} /> : <Users size={16} />}</span><span><strong>{isAdmin ? "Administrator" : "Counselor"}</strong><small>{email}</small></span></span>
          <button type="button" className="mc-button mc-button--secondary mc-role-signout" onClick={signOut} disabled={signingOut}>
            <LogOut size={15} aria-hidden="true" /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </header>

      <div className="mc-role-nav-wrap">
        <nav className="mc-role-nav" aria-label="Workspace navigation">
          <Link href={isAdmin ? "/admin" : "/counselor"}><Activity size={16} /> Overview</Link>
          {isAdmin ? (
            <>
              <a href="#appointments"><CalendarCheck size={16} /> Appointments</a>
              <a href="#counsellors"><ClipboardList size={16} /> Counselor directory</a>
              <a href="#availability"><CalendarCheck size={16} /> Availability</a>
            </>
          ) : (
            <>
              <a href="#schedule"><CalendarCheck size={16} /> Availability</a>
              <a href="#appointments"><ClipboardList size={16} /> Appointments</a>
              <a href="#workspace-guide"><ShieldCheck size={16} /> Workspace guide</a>
            </>
          )}
        </nav>
      </div>

      <main className="mc-role-main">{children}</main>
      <footer className="mc-role-footer"><span><Leaf size={13} /> MindCare</span><span>{isAdmin ? "Administrative access is monitored and role-restricted." : "Protect student privacy and handle every conversation with care."}</span></footer>
    </div>
  );
}
