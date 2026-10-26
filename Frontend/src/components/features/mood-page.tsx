"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Check, Clock3, Heart, Trash2 } from "lucide-react";
import { SectionHeading } from "@/components/app/section-heading";
import { EmptyPanel, Feedback, LoadingPanel } from "@/components/app/feedback";
import { createMood, deleteMood, getMoods } from "@/lib/api/services";
import type { MoodEntry } from "@/lib/types/api";

const options = [
  { value: 1, label: "Very low", emoji: "😞", detail: "Everything feels heavy" },
  { value: 2, label: "Low", emoji: "😕", detail: "A little below your usual" },
  { value: 3, label: "Okay", emoji: "😐", detail: "Steady or somewhere in between" },
  { value: 4, label: "Good", emoji: "🙂", detail: "Things feel alright" },
  { value: 5, label: "Great", emoji: "😄", detail: "Feeling positive today" },
];
const dateOf = (item: MoodEntry) => item.createdAt ?? item.created_at ?? item.recordedAt ?? "";
const idOf = (item: MoodEntry) => item.id ?? item.moodId ?? "";
const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";

export function MoodPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try { setMoods((await getMoods()).slice().sort((a, b) => new Date(dateOf(b)).getTime() - new Date(dateOf(a)).getTime())); setError(""); }
    catch (caught) { setError(errorText(caught)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const chartData = useMemo(() => [...moods].filter((item) => dateOf(item) && Number.isFinite(Number(item.score))).sort((a, b) => new Date(dateOf(a)).getTime() - new Date(dateOf(b)).getTime()).slice(-14).map((item) => ({ score: Number(item.score), date: dateOf(item), label: new Date(dateOf(item)).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) })), [moods]);
  const average = chartData.length ? (chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length).toFixed(1) : "—";

  async function submit() {
    if (!selected) return;
    setSaving(true); setError(""); setSuccess("");
    try { await createMood({ score: selected, note: note.trim() || undefined }); setSelected(null); setNote(""); setSuccess("Your check-in is saved. Thank you for taking a moment for yourself."); await load(); }
    catch (caught) { setError(errorText(caught)); }
    finally { setSaving(false); }
  }
  async function removeMood(item: MoodEntry) {
    const id = idOf(item);
    if (!id || !window.confirm("Delete this mood check-in? This cannot be undone.")) return;
    setDeleting(id); setError("");
    try { await deleteMood(id); setMoods((current) => current.filter((row) => idOf(row) !== id)); setSuccess("Check-in deleted."); }
    catch (caught) { setError(errorText(caught)); }
    finally { setDeleting(""); }
  }

  return <div className="mc-mood-page">
    <SectionHeading eyebrow="CHECK IN WITH YOURSELF" title="How have you been feeling?" description="Your mood isn't a score to get right. It's simply a moment to notice where you are." />
    {error && <div className="mc-page-feedback"><Feedback kind="error">{error}</Feedback></div>}
    {success && <div className="mc-page-feedback"><Feedback kind="success">{success}</Feedback></div>}

    <div className="mc-grid mc-grid--2 mc-mood-main-grid">
      <section className="mc-card mc-card-body mc-mood-checkin-card">
        <div className="mc-card-heading"><div><h2>Your check-in</h2><p>Choose the option that feels closest right now.</p></div><span className="mc-card-icon"><Heart size={17} /></span></div>
        <div className="mc-mood-options" role="group" aria-label="Select your mood">
          {options.map((item) => <button className={`mc-mood-option${selected === item.value ? " is-selected" : ""}`} key={item.value} onClick={() => setSelected(item.value)} type="button" aria-pressed={selected === item.value}>
            {selected === item.value && <span className="mc-mood-option__mark"><Check size={12} /></span>}
            <span className="mc-mood-option__emoji">{item.emoji}</span><strong>{item.label}</strong><small>{item.detail}</small>
          </button>)}
        </div>
        <label className="mc-field mc-mood-note">Anything you&apos;d like to remember about today? <span className="mc-muted" style={{ fontWeight: 400 }}>(optional)</span>
          <textarea className="mc-textarea" rows={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="A few words for yourself…" />
        </label>
        <div className="mc-mood-form-bottom"><span>{note.length}/1000 characters</span><button type="button" className="mc-button mc-button--primary" onClick={submit} disabled={!selected || saving}>{saving ? <span className="mc-spinner" /> : <Check size={15} />}{saving ? "Saving…" : "Save check-in"}</button></div>
        <p className="mc-mood-privacy-note"><Heart size={13} /> Be honest with yourself. This check-in is for your personal reflection.</p>
      </section>

      <section className="mc-card mc-card-body">
        <div className="mc-card-heading"><div><h2>Your recent pattern</h2><p>Notice patterns gently, without judging them.</p></div><span className="mc-card-icon"><Activity size={17} /></span></div>
        {loading ? <LoadingPanel label="Loading your mood history…" /> : chartData.length ? <>
          <div className="mc-mood-average"><div><span>Average mood</span><strong>{average}<small> / 5</small></strong></div><span className="mc-tag">{chartData.length} recent entries</span></div>
          <div className="mc-mood-chart" role="img" aria-label={`Mood history chart, average score ${average} out of five`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <defs><linearGradient id="moodPageGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5e8567" stopOpacity={.22} /><stop offset="100%" stopColor="#5e8567" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="#e4e8df" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="label" tick={{ fill: "#8a9689", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "#8a9689", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ border: "1px solid #d9e0d6", borderRadius: 11, background: "#fffefa", fontSize: 12 }} formatter={(value) => [`${value} / 5`, "Mood"]} /><Area type="monotone" dataKey="score" stroke="#426e53" strokeWidth={2.5} fill="url(#moodPageGradient)" dot={{ r: 3.5, fill: "#fffefa", stroke: "#426e53", strokeWidth: 2 }} activeDot={{ r: 5 }} />
          </AreaChart></ResponsiveContainer></div>
          <div className="mc-mood-scale"><span>1 · Very low</span><span>5 · Great</span></div>
        </> : <EmptyPanel icon={<Activity size={20} />} title="Your history starts here" description="Save your first check-in. Over time, you'll have a clearer picture of your experiences." />}
      </section>
    </div>

    <section className="mc-card mc-mood-history-card">
      <div className="mc-card-heading"><div><h2>Recent check-ins</h2><p>Your saved entries, newest first.</p></div><span className="mc-tag"><Clock3 size={12} /> {moods.length} total</span></div>
      {loading ? <LoadingPanel label="Loading saved entries…" /> : moods.length ? <div className="mc-mood-history-list">{moods.slice(0, 12).map((item, index) => {
        const mood = options.find((option) => option.value === Number(item.score));
        return <article className="mc-mood-history-row" key={idOf(item) || `${dateOf(item)}-${index}`}><span className="mc-mood-history-emoji">{mood?.emoji ?? "•"}</span><div className="mc-mood-history-copy"><strong>{mood?.label ?? `Mood ${item.score}`}</strong>{item.note && <p>{item.note}</p>}<small>{dateOf(item) ? new Date(dateOf(item)).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Date not provided"}</small></div>{idOf(item) && <button className="mc-icon-button mc-mood-delete" type="button" onClick={() => removeMood(item)} aria-label="Delete check-in" disabled={deleting === idOf(item)}>{deleting === idOf(item) ? <span className="mc-loading-ring" /> : <Trash2 size={15} />}</button>}</article>;
      })}</div> : <EmptyPanel icon={<Heart size={20} />} title="Nothing recorded yet" description="A check-in doesn't need to take long. Start with how you're feeling in this moment." />}
    </section>
  </div>;
}
