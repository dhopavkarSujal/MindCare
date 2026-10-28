"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarCheck, Check, Clock3, RefreshCw, ShieldCheck, Users, X, UserRoundCheck, Plus, Eye, EyeOff } from "lucide-react";
import { RoleDashboardShell } from "@/components/roles/role-dashboard-shell";
import { Feedback } from "@/components/app/feedback";
import {
  createAdminCounsellorSlot,
  getAdminAppointments,
  getAdminCounsellorUsers,
  getAdminCounsellors,
  linkAdminCounsellorAccount,
  updateAdminAppointmentStatus,
  updateAdminCounsellor,
} from "@/lib/api/services";
import type { AdminAppointment, AdminCounsellor, CounsellorAccount } from "@/lib/types/api";

type Props = { email: string };

function formatDate(value?: string | null, timeZone = "Asia/Kolkata") {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// Convert a datetime-local wall-clock value in the counsellor's IANA timezone to a UTC instant.
function dateTimeInZoneToIso(value: string, timeZone: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Choose a valid start and end date and time.");
  const [, year, month, day, hour, minute] = match;
  const wallTimeAsUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });

  let candidate = wallTimeAsUtc;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(candidate))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]));
    const representedAsUtc = Date.UTC(
      parts.year as number, (parts.month as number) - 1, parts.day as number,
      parts.hour as number, parts.minute as number, parts.second as number,
    );
    const nextCandidate = wallTimeAsUtc - (representedAsUtc - candidate);
    if (nextCandidate === candidate) break;
    candidate = nextCandidate;
  }
  return new Date(candidate).toISOString();
}

export function AdminDashboard({ email }: Props) {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [counsellors, setCounsellors] = useState<AdminCounsellor[]>([]);
  const [counsellorAccounts, setCounsellorAccounts] = useState<CounsellorAccount[]>([]);
  const [accountSelection, setAccountSelection] = useState<Record<string, string>>({});
  const [slotCounsellorId, setSlotCounsellorId] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [accountBusyId, setAccountBusyId] = useState("");
  const [slotBusy, setSlotBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);
    setError("");
    const [appointmentResult, counsellorResult, accountResult] = await Promise.allSettled([
      getAdminAppointments(),
      getAdminCounsellors(),
      getAdminCounsellorUsers(),
    ]);
    if (appointmentResult.status === "fulfilled") {
      setAppointments(appointmentResult.value);
    } else {
      setError(appointmentResult.reason instanceof Error ? appointmentResult.reason.message : "Appointments could not be loaded.");
    }
    if (counsellorResult.status === "fulfilled") {
      setCounsellors(counsellorResult.value);
      setAccountSelection(Object.fromEntries(counsellorResult.value.map((person) => [person.id, person.userId ?? ""])));
      setSlotCounsellorId((current) => current || counsellorResult.value[0]?.id || "");
    } else {
      setError((current) => current || (counsellorResult.reason instanceof Error ? counsellorResult.reason.message : "Counsellor listings could not be loaded."));
    }
    if (accountResult.status === "fulfilled") {
      setCounsellorAccounts(accountResult.value);
    } else {
      setError((current) => current || (accountResult.reason instanceof Error ? accountResult.reason.message : "Counsellor accounts could not be loaded."));
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void load(); });
    return () => window.cancelAnimationFrame(frame);
  }, [load]);

  const pendingCount = useMemo(() => appointments.filter((item) => item.status === "pending").length, [appointments]);
  const confirmedCount = useMemo(() => appointments.filter((item) => item.status === "confirmed").length, [appointments]);
  const activeCounsellorCount = useMemo(() => counsellors.filter((item) => item.isActive).length, [counsellors]);

  async function changeStatus(appointment: AdminAppointment, status: "confirmed" | "cancelled" | "rejected") {
    const person = appointment.userName || appointment.userEmail || "this student";
    const action = status === "confirmed" ? "confirm" : status === "rejected" ? "reject" : "cancel";
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

  async function saveAccount(person: AdminCounsellor) {
    setAccountBusyId(person.id);
    setError("");
    setNotice("");
    try {
      await linkAdminCounsellorAccount(person.id, accountSelection[person.id] || null);
      setNotice(accountSelection[person.id] ? `Account linked to ${person.name}.` : `Account unlinked from ${person.name}.`);
      await load(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The account link could not be saved.");
    } finally {
      setAccountBusyId("");
    }
  }

  async function toggleListing(person: AdminCounsellor) {
    setBusyId(`profile:${person.id}`);
    setError("");
    setNotice("");
    try {
      await updateAdminCounsellor(person.id, !person.isActive);
      setNotice(`${person.name} is now ${person.isActive ? "hidden from" : "published in"} the student directory.`);
      await load(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The counsellor profile could not be updated.");
    } finally {
      setBusyId("");
    }
  }

  async function addSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const person = counsellors.find((item) => item.id === slotCounsellorId);
    if (!person) {
      setError("Select a counsellor before creating availability.");
      return;
    }
    setSlotBusy(true);
    setError("");
    setNotice("");
    try {
      const timeZone = person.timeZone || "Asia/Kolkata";
      const startsAt = dateTimeInZoneToIso(slotStart, timeZone);
      const endsAt = dateTimeInZoneToIso(slotEnd, timeZone);
      if (new Date(endsAt) <= new Date(startsAt)) throw new Error("The end time must be later than the start time.");
      await createAdminCounsellorSlot(person.id, { startsAt, endsAt });
      setNotice(`Availability added for ${person.name}.`);
      setSlotStart("");
      setSlotEnd("");
      await load(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Availability could not be created.");
    } finally {
      setSlotBusy(false);
    }
  }

  return (
    <RoleDashboardShell role="ADMIN" email={email}>
      <div className="mc-role-heading">
        <div><div className="mc-eyebrow">ADMINISTRATION</div><h1 className="mc-page-title">MindCare overview</h1><p>Review bookings, connect counsellor accounts, and manage available session times.</p></div>
        <button className="mc-button mc-button--secondary" type="button" onClick={() => void load(true)} disabled={refreshing || loading}><RefreshCw size={15} className={refreshing ? "mc-role-spinning" : ""} />{refreshing ? "Refreshing…" : "Refresh data"}</button>
      </div>

      {error && <div className="mc-role-feedback"><Feedback kind="error">{error}</Feedback></div>}
      {notice && <div className="mc-role-feedback"><Feedback kind="success">{notice}</Feedback></div>}

      <section className="mc-role-stats" aria-label="Administrative summary">
        <article className="mc-role-stat"><span className="mc-role-stat__icon"><CalendarCheck size={19} /></span><div><span>Total appointments</span><strong>{loading ? "—" : appointments.length}</strong><small>Bookings across all status values</small></div></article>
        <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--amber"><Clock3 size={19} /></span><div><span>Awaiting review</span><strong>{loading ? "—" : pendingCount}</strong><small>Pending booking requests</small></div></article>
        <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--green"><Check size={19} /></span><div><span>Confirmed</span><strong>{loading ? "—" : confirmedCount}</strong><small>Scheduled sessions</small></div></article>
        <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--violet"><Users size={19} /></span><div><span>Active counsellors</span><strong>{loading ? "—" : activeCounsellorCount}</strong><small>Published directory listings</small></div></article>
      </section>

      <section className="mc-role-card" id="appointments">
        <div className="mc-role-card__heading"><div><h2><CalendarCheck size={18} /> Appointment management</h2><p>Confirm or reject pending requests. Cancellation keeps the record for history.</p></div><span className="mc-role-count">{appointments.length} records</span></div>
        {loading ? <div className="mc-role-empty">Loading appointment records…</div> : appointments.length === 0 ? (
          <div className="mc-role-empty"><CalendarCheck size={22} /><strong>No appointments yet</strong><span>Student booking requests will appear here when they are submitted.</span></div>
        ) : (
          <div className="mc-role-table-wrap"><table className="mc-role-table"><thead><tr><th>Student</th><th>Counsellor</th><th>Appointment time</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {appointments.map((appointment) => <tr key={appointment.appointmentId}>
              <td><strong>{appointment.userName || "Student"}</strong><small>{appointment.userEmail || "Email not provided"}</small>{appointment.reason && <span className="mc-role-reason" title={appointment.reason}>{appointment.reason}</span>}</td>
              <td>{appointment.counsellorName || "Counsellor"}</td>
              <td>{formatDate(appointment.startsAt)}</td>
              <td><span className={`mc-role-status mc-role-status--${appointment.status}`}>{statusLabel(appointment.status)}</span></td>
              <td><div className="mc-role-actions">
                {appointment.status === "pending" && <>
                  <button type="button" className="mc-role-action mc-role-action--confirm" onClick={() => void changeStatus(appointment, "confirmed")} disabled={Boolean(busyId)}><Check size={14} />{busyId === appointment.appointmentId ? "Saving…" : "Confirm"}</button>
                  <button type="button" className="mc-role-action mc-role-action--cancel" onClick={() => void changeStatus(appointment, "rejected")} disabled={Boolean(busyId)}><X size={14} />Reject</button>
                </>}
                {appointment.status === "confirmed" && <button type="button" className="mc-role-action mc-role-action--cancel" onClick={() => void changeStatus(appointment, "cancelled")} disabled={Boolean(busyId)}><X size={14} />Cancel</button>}
                {!["pending", "confirmed"].includes(appointment.status) && <span className="mc-role-muted">{busyId === appointment.appointmentId ? "Saving…" : "Closed"}</span>}
              </div></td>
            </tr>)}
          </tbody></table></div>
        )}
      </section>

      <section className="mc-role-card" id="counsellors">
        <div className="mc-role-card__heading"><div><h2><Users size={18} /> Counsellor directory and accounts</h2><p>Link each profile to a Supabase-authenticated user whose application role is COUNSELOR.</p></div><span className="mc-role-count">{counsellors.length} profiles</span></div>
        {loading ? <div className="mc-role-empty">Loading counsellor listings…</div> : counsellors.length === 0 ? (
          <div className="mc-role-empty"><Users size={22} /><strong>No counsellor listings returned</strong><span>Check the admin API connection and database records.</span></div>
        ) : (
          <div className="mc-role-counsellor-grid">{counsellors.map((person) => {
            const eligibleAccounts = counsellorAccounts.filter((account) => !account.linkedCounsellorId || account.linkedCounsellorId === person.id);
            return <article className="mc-role-counsellor" key={person.id}>
              <div className="mc-role-counsellor__top"><span className="mc-role-counsellor__avatar"><Users size={19} /></span><span className={person.isActive ? "mc-role-status mc-role-status--confirmed" : "mc-role-status mc-role-status--cancelled"}>{person.isActive ? "Published" : "Hidden"}</span></div>
              <h3>{person.name}</h3><p>{person.specialty || "Wellbeing support"}</p>
              {person.bio && <p className="mc-role-bio">{person.bio}</p>}
              <div className="mc-role-counsellor__meta"><span><CalendarCheck size={14} />{person._count?.appointments ?? 0} appointments</span><span><Clock3 size={14} />{person._count?.availabilitySlots ?? 0} slots</span></div>
              <label className="mc-role-field">Counsellor login
                <select className="mc-role-select" value={accountSelection[person.id] ?? person.userId ?? ""} onChange={(event) => setAccountSelection((current) => ({ ...current, [person.id]: event.target.value }))}>
                  <option value="">Not linked</option>
                  {eligibleAccounts.map((account) => <option key={account.id} value={account.id}>{account.name || account.email} — {account.email}</option>)}
                </select>
              </label>
              <div className="mc-role-card-actions">
                <button className="mc-button mc-button--secondary" type="button" onClick={() => void saveAccount(person)} disabled={accountBusyId === person.id || (accountSelection[person.id] ?? person.userId ?? "") === (person.userId ?? "")}><UserRoundCheck size={14} />{accountBusyId === person.id ? "Saving…" : "Save account"}</button>
                <button className="mc-role-action" type="button" onClick={() => void toggleListing(person)} disabled={busyId === `profile:${person.id}`}>{person.isActive ? <><EyeOff size={14} />Hide</> : <><Eye size={14} />Publish</>}</button>
              </div>
            </article>;
          })}</div>
        )}
        {counsellorAccounts.length === 0 && !loading && <div className="mc-role-privacy-note mc-role-privacy-note--inset"><ShieldCheck size={17} /><p>No eligible counsellor login accounts were found. Create the account in Supabase Auth, create/link its row in public.&quot;User&quot; with role COUNSELOR, then refresh this page.</p></div>}
      </section>

      <section className="mc-role-card" id="availability">
        <div className="mc-role-card__heading"><div><h2><Plus size={18} /> Add availability</h2><p>Times are interpreted in the selected counsellor&apos;s timezone. Slots must be in the future and 15–180 minutes long.</p></div></div>
        <form className="mc-role-form" onSubmit={(event) => void addSlot(event)}>
          <label className="mc-role-field">Counsellor
            <select className="mc-role-select" value={slotCounsellorId} onChange={(event) => setSlotCounsellorId(event.target.value)} required>
              {counsellors.map((person) => <option key={person.id} value={person.id}>{person.name}{person.isActive ? "" : " (hidden from students)"}</option>)}
            </select>
          </label>
          <div className="mc-role-form-grid">
            <label className="mc-role-field">Starts at<input className="mc-role-input" type="datetime-local" value={slotStart} onChange={(event) => setSlotStart(event.target.value)} required /></label>
            <label className="mc-role-field">Ends at<input className="mc-role-input" type="datetime-local" value={slotEnd} onChange={(event) => setSlotEnd(event.target.value)} required /></label>
          </div>
          <div className="mc-role-form-actions"><button className="mc-button mc-button--primary" type="submit" disabled={slotBusy || !slotCounsellorId || !slotStart || !slotEnd}><Plus size={15} />{slotBusy ? "Creating slot…" : "Create slot"}</button></div>
        </form>
      </section>

      <div className="mc-role-privacy-note"><ShieldCheck size={17} /><p><strong>Privacy by design.</strong> Student booking notes are visible to the assigned counsellor for session preparation; journal entries and mood notes remain private. Only authorized appointment fields are displayed here.</p></div>
    </RoleDashboardShell>
  );
}
