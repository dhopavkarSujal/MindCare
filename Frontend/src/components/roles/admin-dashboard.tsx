"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck, Check, Clock3, RefreshCw, ShieldCheck, Users, X } from "lucide-react";
import { RoleDashboardShell } from "@/components/roles/role-dashboard-shell";
import { Feedback } from "@/components/app/feedback";
import { getAdminAppointments, getAdminCounsellors, updateAdminAppointmentStatus } from "@/lib/api/services";
import type { AdminAppointment, AdminCounsellor } from "@/lib/types/api";

type Props = { email: string };

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function AdminDashboard({ email }: Props) {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [counsellors, setCounsellors] = useState<AdminCounsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);
    setError("");
    const [appointmentResult, counsellorResult] = await Promise.allSettled([
      getAdminAppointments(),
      getAdminCounsellors(),
    ]);
    if (appointmentResult.status === "fulfilled") {
      setAppointments(appointmentResult.value);
    } else {
      setError(appointmentResult.reason instanceof Error ? appointmentResult.reason.message : "Appointments could not be loaded.");
    }
    if (counsellorResult.status === "fulfilled") {
      setCounsellors(counsellorResult.value);
    } else {
      setError((current) => current || (counsellorResult.reason instanceof Error ? counsellorResult.reason.message : "Counselor listings could not be loaded."));
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const pendingCount = useMemo(() => appointments.filter((item) => item.status === "pending").length, [appointments]);
  const confirmedCount = useMemo(() => appointments.filter((item) => item.status === "confirmed").length, [appointments]);
  const activeCounsellorCount = useMemo(() => counsellors.filter((item) => item.isActive).length, [counsellors]);

  async function changeStatus(appointment: AdminAppointment, status: "confirmed" | "cancelled") {
    const person = appointment.userName || appointment.userEmail || "this student";
    const action = status === "confirmed" ? "confirm" : "cancel";
    if (!window.confirm(`Are you sure you want to ${action} the appointment for ${person}?`)) return;
    setBusyId(appointment.appointmentId);
    setError("");
    setNotice("");
    try {
      await updateAdminAppointmentStatus(appointment.appointmentId, status);
      setNotice(`Appointment ${status}.`);
      await load(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The appointment status could not be updated.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <RoleDashboardShell role="ADMIN" email={email}>
      <div className="mc-role-heading">
        <div><div className="mc-eyebrow">ADMINISTRATION</div><h1 className="mc-page-title">MindCare overview</h1><p>Monitor appointment activity and manage the counselor directory.</p></div>
        <button className="mc-button mc-button--secondary" type="button" onClick={() => void load(true)} disabled={refreshing || loading}><RefreshCw size={15} className={refreshing ? "mc-role-spinning" : ""} />{refreshing ? "Refreshing…" : "Refresh data"}</button>
      </div>

      {error && <div className="mc-role-feedback"><Feedback kind="error">{error}</Feedback></div>}
      {notice && <div className="mc-role-feedback"><Feedback kind="success">{notice}</Feedback></div>}

      <section className="mc-role-stats" aria-label="Administrative summary">
        <article className="mc-role-stat"><span className="mc-role-stat__icon"><CalendarCheck size={19} /></span><div><span>Total appointments</span><strong>{loading ? "—" : appointments.length}</strong><small>Records returned by the admin API</small></div></article>
        <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--amber"><Clock3 size={19} /></span><div><span>Awaiting review</span><strong>{loading ? "—" : pendingCount}</strong><small>Pending booking requests</small></div></article>
        <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--green"><Check size={19} /></span><div><span>Confirmed</span><strong>{loading ? "—" : confirmedCount}</strong><small>Confirmed appointments</small></div></article>
        <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--violet"><Users size={19} /></span><div><span>Active counselors</span><strong>{loading ? "—" : activeCounsellorCount}</strong><small>Published directory listings</small></div></article>
      </section>

      <section className="mc-role-card" id="appointments">
        <div className="mc-role-card__heading"><div><h2><CalendarCheck size={18} /> Appointment management</h2><p>Review requests and update booking status.</p></div><span className="mc-role-count">{appointments.length} records</span></div>
        {loading ? <div className="mc-role-empty">Loading appointment records…</div> : appointments.length === 0 ? (
          <div className="mc-role-empty"><CalendarCheck size={22} /><strong>No appointments yet</strong><span>Student booking requests will appear here when they are submitted.</span></div>
        ) : (
          <div className="mc-role-table-wrap"><table className="mc-role-table"><thead><tr><th>Student</th><th>Counselor</th><th>Appointment time</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {appointments.map((appointment) => <tr key={appointment.appointmentId}>
              <td><strong>{appointment.userName || "Student"}</strong><small>{appointment.userEmail || "Email not provided"}</small></td>
              <td>{appointment.counsellorName || "Counselor"}</td>
              <td>{formatDate(appointment.startsAt)}</td>
              <td><span className={`mc-role-status mc-role-status--${appointment.status}`}>{statusLabel(appointment.status)}</span></td>
              <td><div className="mc-role-actions">
                {appointment.status === "pending" && <><button type="button" className="mc-role-action mc-role-action--confirm" onClick={() => void changeStatus(appointment, "confirmed")} disabled={Boolean(busyId)} aria-label="Confirm appointment"><Check size={14} />{busyId === appointment.appointmentId ? "Saving…" : "Confirm"}</button><button type="button" className="mc-role-action mc-role-action--cancel" onClick={() => void changeStatus(appointment, "cancelled")} disabled={Boolean(busyId)} aria-label="Cancel appointment"><X size={14} />Cancel</button></>}
                {appointment.status !== "pending" && <span className="mc-role-muted">{busyId === appointment.appointmentId ? "Saving…" : "No action needed"}</span>}
              </div></td>
            </tr>)}
          </tbody></table></div>
        )}
      </section>

      <section className="mc-role-card" id="counsellors">
        <div className="mc-role-card__heading"><div><h2><Users size={18} /> Counselor directory</h2><p>Review the active and inactive provider listings.</p></div><span className="mc-role-count">{counsellors.length} listings</span></div>
        {loading ? <div className="mc-role-empty">Loading counselor listings…</div> : counsellors.length === 0 ? (
          <div className="mc-role-empty"><Users size={22} /><strong>No counselor listings returned</strong><span>Check the admin API connection and database records.</span></div>
        ) : (
          <div className="mc-role-counsellor-grid">{counsellors.map((person) => <article className="mc-role-counsellor" key={person.id}>
            <div className="mc-role-counsellor__top"><span className="mc-role-counsellor__avatar"><Users size={19} /></span><span className={person.isActive ? "mc-role-status mc-role-status--confirmed" : "mc-role-status mc-role-status--cancelled"}>{person.isActive ? "Active" : "Inactive"}</span></div>
            <h3>{person.name}</h3><p>{person.specialty || "Wellbeing support"}</p>
            <div className="mc-role-counsellor__meta"><span><CalendarCheck size={14} />{person._count?.appointments ?? 0} appointments</span><span><Clock3 size={14} />{person._count?.availabilitySlots ?? 0} slots</span></div>
          </article>)}</div>
        )}
      </section>

      <div className="mc-role-privacy-note"><ShieldCheck size={17} /><p><strong>Privacy by design.</strong> Use dashboard summaries to monitor service operations. Student journal contents and personal mood notes should remain private unless a clearly authorized and appropriately consented process applies.</p></div>
    </RoleDashboardShell>
  );
}
