import { CalendarCheck, ClipboardList, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { RoleDashboardShell } from "@/components/roles/role-dashboard-shell";

type Props = { email: string; name: string };

export function CounselorDashboard({ email, name }: Props) {
  const greeting = name.trim() || "there";

  return (
    <RoleDashboardShell role="COUNSELOR" email={email}>
      <div className="mc-role-heading">
        <div><div className="mc-eyebrow">COUNSELOR WORKSPACE</div><h1 className="mc-page-title">Welcome, {greeting}.</h1><p>Your dedicated workspace for student support and appointment coordination.</p></div>
        <span className="mc-role-status mc-role-status--confirmed"><ShieldCheck size={13} /> Counselor access verified</span>
      </div>

      <section className="mc-role-stats" aria-label="Counselor workspace summary">
        <article className="mc-role-stat"><span className="mc-role-stat__icon"><CalendarCheck size={19} /></span><div><span>Assigned appointments</span><strong>Not connected</strong><small>Requires a counselor profile link</small></div></article>
        <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--amber"><Clock3Icon /></span><div><span>Availability</span><strong>Not configured</strong><small>Schedule management is not linked yet</small></div></article>
        <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--green"><Users size={19} /></span><div><span>Student sessions</span><strong>Not available</strong><small>Will appear after secure assignment</small></div></article>
      </section>

      <section className="mc-role-card" id="schedule">
        <div className="mc-role-card__heading"><div><h2><CalendarCheck size={18} /> Your schedule</h2><p>Assigned appointments will appear here once your staff profile is connected.</p></div></div>
        <div className="mc-role-empty mc-role-empty--large"><span className="mc-role-empty__large-icon"><ClipboardList size={24} /></span><strong>Your counselor schedule is ready for integration</strong><span>MindCare currently stores counselor directory listings separately from authenticated user accounts. The backend does not yet link your counselor login to a specific counselor record or provide counselor-scoped appointment endpoints, so this page intentionally does not show another student's bookings.</span></div>
      </section>

      <section className="mc-role-card" id="workspace-guide">
        <div className="mc-role-card__heading"><div><h2><HeartHandshake size={18} /> Workspace guide</h2><p>Keep student wellbeing and privacy at the center of every interaction.</p></div></div>
        <div className="mc-role-guide-grid">
          <article><span><ShieldCheck size={17} /></span><h3>Protect confidentiality</h3><p>Only open personal records that you are explicitly authorized to access for a valid support purpose.</p></article>
          <article><span><CalendarCheck size={17} /></span><h3>Keep appointments clear</h3><p>Once scheduling is connected, use the assigned schedule to review session times and availability.</p></article>
          <article><span><Users size={17} /></span><h3>Offer supportive guidance</h3><p>Use respectful, non-judgmental communication and follow your organization's referral and safety procedures.</p></article>
        </div>
      </section>

      <div className="mc-role-privacy-note"><ShieldCheck size={17} /><p><strong>Next integration step:</strong> an administrator needs to link this account to a counselor record. The backend should then expose counselor-only endpoints for the counselor's own appointments and availability before those controls are enabled here.</p></div>
    </RoleDashboardShell>
  );
}

function Clock3Icon() {
  return <CalendarCheck size={19} />;
}
