"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, HeartHandshake, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { SectionHeading } from "@/components/app/section-heading";
import { EmptyPanel, Feedback, LoadingPanel } from "@/components/app/feedback";
import { bookAppointment, cancelAppointment, getAppointments, getCounsellorSlots, getCounsellors } from "@/lib/api/services";
import type { Appointment, AppointmentSlot, Counsellor } from "@/lib/types/api";

const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";
const todayString = () => { const today = new Date(); const year = today.getFullYear(); const month = String(today.getMonth() + 1).padStart(2, "0"); const day = String(today.getDate()).padStart(2, "0"); return `${year}-${month}-${day}`; };

export function CounsellingPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    // Resolve browser-local date and clock after hydration to avoid server/client differences.
    const frame = window.requestAnimationFrame(() => {
      setDate(todayString());
      setCurrentTime(Date.now());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const load = useCallback(async () => {
    const [counsellorResult, appointmentResult] = await Promise.allSettled([getCounsellors(), getAppointments()]);
    if (counsellorResult.status === "fulfilled") setCounsellors(counsellorResult.value);
    else setError(errorText(counsellorResult.reason));
    if (appointmentResult.status === "fulfilled") setAppointments(appointmentResult.value);
    else setAppointmentError(errorText(appointmentResult.reason));
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const loadSlots = useCallback(async (id: string, day: string) => {
    if (!id || !day) return;
    try {
      const availableSlots = await getCounsellorSlots(id, day);
      setSlots(availableSlots);
      setError("");
    } catch (caught) {
      setError(errorText(caught));
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);
  useEffect(() => { if (selected && date) void loadSlots(selected, date); }, [selected, date, loadSlots]);

  const selectedCounsellor = counsellors.find((person) => person.id === selected);
  const upcoming = useMemo(() => currentTime === null ? [] : [...appointments].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()), [appointments, currentTime]);

  async function book() {
    if (!selected || !selectedSlot) { setError("Choose a counsellor and an available time first."); return; }
    setBooking(true); setError(""); setSuccess("");
    try { await bookAppointment({ counsellorId: selected, startTime: selectedSlot, reason: reason.trim() || undefined }); setSuccess("Your booking request was received. Check the appointment status below."); setSelectedSlot(""); setReason(""); setLoadingSlots(true); const [a] = await Promise.all([getAppointments(), loadSlots(selected, date)]); setAppointments(a); }
    catch (caught) { setError(errorText(caught)); }
    finally { setBooking(false); }
  }

  async function cancel(id: string) {
    if (!window.confirm("Cancel this appointment?")) return;
    setCancelling(id); setAppointmentError("");
    try { await cancelAppointment(id); setAppointments(await getAppointments()); }
    catch (caught) { setAppointmentError(errorText(caught)); }
    finally { setCancelling(""); }
  }

  return <div className="mc-counselling-page">
    <SectionHeading eyebrow="HUMAN SUPPORT, WHEN YOU NEED IT" title="Explore your options for support." description="Browse the counsellors available through MindCare and review appointment slots. An appointment is only confirmed by the backend." />
    <div className="mc-counselling-care-note"><span><HeartHandshake size={18} /></span><div><strong>You&apos;re allowed to ask for support.</strong><p>MindCare offers wellbeing tools, not emergency care. If you&apos;re in immediate danger, contact your local emergency service or a trusted person now.</p></div></div>
    {error && <div className="mc-page-feedback"><Feedback kind="error">{error}</Feedback></div>}
    {success && <div className="mc-page-feedback"><Feedback kind="success">{success}</Feedback></div>}
    <div className="mc-grid mc-grid--2 mc-counselling-grid">
      <section className="mc-card mc-card-body"><div className="mc-card-heading"><div><h2>Available counsellors</h2><p>Choose a listing to view appointment times.</p></div><span className="mc-card-icon"><UserRound size={17} /></span></div>
        {loading ? <LoadingPanel label="Loading counsellors…" /> : counsellors.length ? <div className="mc-counsellor-list">{counsellors.map((person) => <button type="button" key={person.id} className={`mc-counsellor-card${selected === person.id ? " is-selected" : ""}`} onClick={() => { if (person.id !== selected) { setSelected(person.id); setLoadingSlots(Boolean(date)); setSelectedSlot(""); setError(""); } }} aria-pressed={selected === person.id}><span className="mc-counsellor-avatar"><UserRound size={20} /></span><span className="mc-counsellor-card__copy"><strong>{person.name}</strong><span>{person.specialty || "Counselling support"}</span>{person.bio && <small>{person.bio}</small>}</span><span className="mc-counsellor-card__radio" /></button>)}</div> : <EmptyPanel icon={<UserRound size={20} />} title="No counsellors listed yet" description="This section will show providers when they are published by the MindCare backend." />}
      </section>

      <section className="mc-card mc-card-body"><div className="mc-card-heading"><div><h2>Choose a time</h2><p>{selectedCounsellor ? `Availability for ${selectedCounsellor.name}.` : "Select a counsellor to continue."}</p></div><span className="mc-card-icon"><CalendarDays size={17} /></span></div>
        <label className="mc-field">Appointment date<input className="mc-input" type="date" min={date || undefined} value={date} onChange={(event) => { setDate(event.target.value); setLoadingSlots(Boolean(selected && event.target.value)); setSelectedSlot(""); setError(""); }} disabled={!selected} /></label>
        {!selected ? <div className="mc-slot-placeholder"><CalendarDays size={22} /><p>Choose a counsellor on the left to check availability.</p></div> : loadingSlots ? <LoadingPanel label="Checking availability…" /> : slots.filter((slot) => slot.isAvailable).length ? <div className="mc-slot-grid">{slots.filter((slot) => slot.isAvailable).map((slot) => { const time = new Date(slot.startTime); const label = Number.isNaN(time.getTime()) ? slot.startTime : time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); return <button key={slot.startTime} type="button" className={`mc-slot-button${selectedSlot === slot.startTime ? " is-selected" : ""}`} onClick={() => setSelectedSlot(slot.startTime)} aria-pressed={selectedSlot === slot.startTime}><Clock size={13} /> {label}</button>; })}</div> : <EmptyPanel icon={<CalendarDays size={20} />} title="No slots shown for this date" description="Try another date or select a different counsellor." />}
        {selected && <div className="mc-booking-form"><label className="mc-field">Anything you&apos;d like to share beforehand? <span className="mc-muted" style={{ fontWeight: 400 }}>(optional)</span><textarea className="mc-textarea" rows={3} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="A short note for the counsellor…" /></label><button type="button" className="mc-button mc-button--primary mc-booking-submit" disabled={booking || !selectedSlot} onClick={book}>{booking ? <span className="mc-spinner" /> : <CheckCircle2 size={15} />}{booking ? "Sending request…" : "Request appointment"}<ArrowRight size={14} /></button><p className="mc-booking-disclaimer"><ShieldCheck size={12} /> The server determines availability and booking status.</p></div>}
      </section>
    </div>

    <section className="mc-card mc-appointments-card"><div className="mc-card-heading"><div><h2>Your appointments</h2><p>Upcoming bookings and prior appointment outcomes are shown here.</p></div><button className="mc-icon-button" type="button" onClick={() => void load()} aria-label="Refresh appointments"><RefreshCw size={15} /></button></div>
      {appointmentError && <Feedback kind="error">{appointmentError}</Feedback>}
      {upcoming.length ? <div className="mc-appointment-list">{upcoming.map((appointment) => <article key={appointment.appointmentId} className="mc-appointment-row"><span className="mc-appointment-icon"><CalendarDays size={16} /></span><div className="mc-appointment-main"><strong>{appointment.counsellorName || "Counselling appointment"}</strong><span>{new Date(appointment.startsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span></div><span className={`mc-appointment-status is-${appointment.status}`}>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>{appointment.status !== "cancelled" && <button className="mc-button mc-button--secondary" type="button" onClick={() => void cancel(appointment.appointmentId)} disabled={cancelling === appointment.appointmentId}>{cancelling === appointment.appointmentId ? "Cancelling…" : "Cancel"}</button>}</article>)}</div> : <EmptyPanel icon={<CalendarDays size={20} />} title="No appointments yet" description="Your booking requests and appointment history will appear here." />}
    </section>
  </div>;
}
