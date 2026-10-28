"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarCheck, CalendarPlus, CheckCircle2, Clock3, HeartHandshake, RefreshCw, ShieldCheck, Users, XCircle, ClipboardList } from "lucide-react";
import { RoleDashboardShell } from "@/components/roles/role-dashboard-shell";
import { Feedback } from "@/components/app/feedback";
import {
  completeCounsellorAppointment,
  createCounsellorAvailability,
  deactivateCounsellorAvailability,
  getCounsellorAppointments,
  getCounsellorAvailability,
  getCounsellorWorkspace,
} from "@/lib/api/services";
import type { CounsellorAppointment, CounsellorAvailabilitySlot, CounsellorWorkspace } from "@/lib/types/api";

type Props = { email: string; name: string };

function formatDate(value: string, timeZone: string) {
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

// Interpret datetime-local input as a wall-clock time in the profile timezone.
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

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "The counselor workspace could not be loaded.";
}

export function CounselorDashboard({ email, name }: Props) {
  const [profile, setProfile] = useState<CounsellorWorkspace | null>(null);
  const [appointments, setAppointments] = useState<CounsellorAppointment[]>([]);
  const [slots, setSlots] = useState<CounsellorAvailabilitySlot[]>([]);
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [slotBusy, setSlotBusy] = useState(false);
  const [busyAppointmentId, setBusyAppointmentId] = useState("");
  const [busySlotId, setBusySlotId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);
    setError("");
    setCurrentTime(Date.now());
    const profileResult = await getCounsellorWorkspace().then(
      (value) => ({ status: "fulfilled" as const, value }),
      (reason: unknown) => ({ status: "rejected" as const, reason }),
    );
    if (profileResult.status === "rejected") {
      setProfile(null);
      setAppointments([]);
      setSlots([]);
      setError(errorText(profileResult.reason));
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setProfile(profileResult.value);
    const [appointmentResult, slotResult] = await Promise.allSettled([
      getCounsellorAppointments(),
      getCounsellorAvailability(),
    ]);
    if (appointmentResult.status === "fulfilled") setAppointments(appointmentResult.value);
    else setError(errorText(appointmentResult.reason));
    if (slotResult.status === "fulfilled") setSlots(slotResult.value);
    else setError((current) => current || errorText(slotResult.reason));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void load(); });
    return () => window.cancelAnimationFrame(frame);
  }, [load]);

  const timeZone = profile?.timeZone || "Asia/Kolkata";
  const pendingCount = useMemo(() => appointments.filter((item) => item.status === "pending").length, [appointments]);
  const confirmedCount = useMemo(() => appointments.filter((item) => item.status === "confirmed").length, [appointments]);
  const availableCount = useMemo(() => slots.filter((slot) => slot.isAvailable).length, [slots]);

  async function addAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSlotBusy(true);
    setError("");
    setNotice("");
    try {
      const startsAt = dateTimeInZoneToIso(slotStart, timeZone);
      const endsAt = dateTimeInZoneToIso(slotEnd, timeZone);
      if (new Date(endsAt) <= new Date(startsAt)) throw new Error("The end time must be later than the start time.");
      await createCounsellorAvailability({ startsAt, endsAt });
      setSlotStart("");
      setSlotEnd("");
      setNotice("Availability added to your schedule.");
      await load(true);
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setSlotBusy(false);
    }
  }

  async function removeSlot(slot: CounsellorAvailabilitySlot) {
    if (!window.confirm("Remove this time from your availability? Slots with pending or confirmed appointments cannot be removed.")) return;
    setBusySlotId(slot.id);
    setError("");
    setNotice("");
    try {
      await deactivateCounsellorAvailability(slot.id);
      setNotice("Availability removed.");
      await load(true);
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setBusySlotId("");
    }
  }

  async function completeAppointment(appointment: CounsellorAppointment) {
    if (!window.confirm("Mark this confirmed appointment as completed?")) return;
    setBusyAppointmentId(appointment.appointmentId);
    setError("");
    setNotice("");
    try {
      await completeCounsellorAppointment(appointment.appointmentId);
      setNotice("Appointment marked completed.");
      await load(true);
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setBusyAppointmentId("");
    }
  }

  const greeting = (profile?.name || name).trim() || "there";

  return (
    <RoleDashboardShell role="COUNSELOR" email={email}>
      <div className="mc-role-heading">
        <div><div className="mc-eyebrow">COUNSELOR WORKSPACE</div><h1 className="mc-page-title">Welcome, {greeting}.</h1><p>Manage your availability and view appointments assigned to your profile.</p></div>
        <button className="mc-button mc-button--secondary" type="button" onClick={() => void load(true)} disabled={refreshing || loading}><RefreshCw size={15} className={refreshing ? "mc-role-spinning" : ""} />{refreshing ? "Refreshing…" : "Refresh data"}</button>
      </div>

      {error && <div className="mc-role-feedback"><Feedback kind="error">{error}</Feedback></div>}
      {notice && <div className="mc-role-feedback"><Feedback kind="success">{notice}</Feedback></div>}

      {!profile && !loading ? (
        <section className="mc-role-card">
          <div className="mc-role-empty mc-role-empty--large"><span className="mc-role-empty__large-icon"><ShieldCheck size={24} /></span><strong>Your counselor account needs to be linked</strong><span>Sign-in is working, but this login is not linked to one of the five counselor profiles. An administrator must open the Admin dashboard, select the matching counselor account, and save the link. No appointment data is shown until that relationship is configured.</span></div>
        </section>
      ) : (
        <>
          <section className="mc-role-stats" aria-label="Counselor workspace summary">
            <article className="mc-role-stat"><span className="mc-role-stat__icon"><CalendarCheck size={19} /></span><div><span>Pending requests</span><strong>{loading ? "—" : pendingCount}</strong><small>Awaiting admin review</small></div></article>
            <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--green"><CheckCircle2 size={19} /></span><div><span>Confirmed sessions</span><strong>{loading ? "—" : confirmedCount}</strong><small>Sessions assigned to you</small></div></article>
            <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--amber"><Clock3 size={19} /></span><div><span>Open slots</span><strong>{loading ? "—" : availableCount}</strong><small>Future bookable time slots</small></div></article>
            <article className="mc-role-stat"><span className="mc-role-stat__icon mc-role-stat__icon--violet"><Users size={19} /></span><div><span>Profile status</span><strong>{loading ? "—" : profile?.isActive ? "Active" : "Hidden"}</strong><small>{profile?.timeZone || "Asia/Kolkata"}</small></div></article>
          </section>

          <section className="mc-role-card" id="schedule">
            <div className="mc-role-card__heading"><div><h2><CalendarPlus size={18} /> Add availability</h2><p>Choose a future time window in your profile timezone ({timeZone}).</p></div></div>
            {!profile?.isActive && <div className="mc-role-inline-note"><ShieldCheck size={16} /> Your directory profile is hidden. Ask an administrator to publish it before adding new slots.</div>}
            <form className="mc-role-form" onSubmit={(event) => void addAvailability(event)}>
              <div className="mc-role-form-grid">
                <label className="mc-role-field">Starts at<input className="mc-role-input" type="datetime-local" value={slotStart} onChange={(event) => setSlotStart(event.target.value)} required /></label>
                <label className="mc-role-field">Ends at<input className="mc-role-input" type="datetime-local" value={slotEnd} onChange={(event) => setSlotEnd(event.target.value)} required /></label>
              </div>
              <div className="mc-role-form-actions"><button className="mc-button mc-button--primary" type="submit" disabled={slotBusy || loading || !profile?.isActive || !slotStart || !slotEnd}><CalendarPlus size={15} />{slotBusy ? "Saving slot…" : "Add availability"}</button></div>
            </form>
            {loading ? <div className="mc-role-empty">Loading your availability…</div> : slots.length === 0 ? <div className="mc-role-empty"><Clock3 size={22} /><strong>No future availability</strong><span>Add a time slot above. Students can request appointments only for published, available slots.</span></div> : (
              <div className="mc-role-table-wrap"><table className="mc-role-table"><thead><tr><th>Start</th><th>End</th><th>Availability</th><th>Action</th></tr></thead><tbody>
                {slots.map((slot) => <tr key={slot.id}>
                  <td>{formatDate(slot.startTime, timeZone)}</td>
                  <td>{formatDate(slot.endTime, timeZone)}</td>
                  <td>{slot.bookingStatus ? <span className={`mc-role-status mc-role-status--${slot.bookingStatus}`}>{statusLabel(slot.bookingStatus)}</span> : slot.isAvailable ? <span className="mc-role-status mc-role-status--confirmed">Available</span> : <span className="mc-role-status mc-role-status--pending">Reserved</span>}</td>
                  <td>{slot.isAvailable ? <button type="button" className="mc-role-action mc-role-action--cancel" onClick={() => void removeSlot(slot)} disabled={busySlotId === slot.id}><XCircle size={14} />{busySlotId === slot.id ? "Removing…" : "Remove slot"}</button> : <span className="mc-role-muted">Resolve booking first</span>}</td>
                </tr>)}
              </tbody></table></div>
            )}
          </section>

          <section className="mc-role-card" id="appointments">
            <div className="mc-role-card__heading"><div><h2><CalendarCheck size={18} /> Your appointments</h2><p>Only appointments assigned to your linked profile are returned.</p></div><span className="mc-role-count">{appointments.length} records</span></div>
            {loading ? <div className="mc-role-empty">Loading your appointments…</div> : appointments.length === 0 ? (
              <div className="mc-role-empty"><ClipboardList size={22} /><strong>No appointments assigned yet</strong><span>New student requests will appear once they are booked for your available slots.</span></div>
            ) : (
              <div className="mc-role-table-wrap"><table className="mc-role-table"><thead><tr><th>Student</th><th>Session time</th><th>Student note</th><th>Status</th><th>Action</th></tr></thead><tbody>
                {appointments.map((appointment) => <tr key={appointment.appointmentId}>
                  <td><strong>{appointment.studentName || "Student"}</strong><small>{appointment.studentEmail}</small></td>
                  <td>{formatDate(appointment.startsAt, timeZone)}<small>Ends {formatDate(appointment.endsAt, timeZone)}</small></td>
                  <td>{appointment.reason || <span className="mc-role-muted">No note shared</span>}</td>
                  <td><span className={`mc-role-status mc-role-status--${appointment.status}`}>{statusLabel(appointment.status)}</span></td>
                  <td>{appointment.status === "confirmed" && currentTime > 0 && new Date(appointment.endsAt).getTime() <= currentTime ? <button type="button" className="mc-role-action mc-role-action--confirm" onClick={() => void completeAppointment(appointment)} disabled={busyAppointmentId === appointment.appointmentId}><CheckCircle2 size={14} />{busyAppointmentId === appointment.appointmentId ? "Saving…" : "Mark completed"}</button> : <span className="mc-role-muted">{appointment.status === "confirmed" ? "Session not finished" : "No action available"}</span>}</td>
                </tr>)}
              </tbody></table></div>
            )}
          </section>

          <section className="mc-role-card" id="workspace-guide">
            <div className="mc-role-card__heading"><div><h2><HeartHandshake size={18} /> Confidentiality and care</h2><p>Only the minimum details needed for the assigned appointment are displayed.</p></div></div>
            <div className="mc-role-guide-grid">
              <article><span><ShieldCheck size={17} /></span><h3>Protect privacy</h3><p>Booking notes are shared for session preparation. Student journals and mood history remain private.</p></article>
              <article><span><CalendarCheck size={17} /></span><h3>Keep availability accurate</h3><p>Do not remove a time slot while it has a pending or confirmed appointment.</p></article>
              <article><span><Users size={17} /></span><h3>Use supportive language</h3><p>Provide respectful, non-judgmental support and follow your organization&apos;s safety procedures.</p></article>
            </div>
          </section>
        </>
      )}
    </RoleDashboardShell>
  );
}
