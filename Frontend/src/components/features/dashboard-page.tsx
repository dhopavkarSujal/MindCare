"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowRight, BookOpenText, CalendarCheck, Check, Compass, Leaf, MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/app/section-heading";
import { EmptyPanel, Feedback, LoadingPanel } from "@/components/app/feedback";
import { createMood, getConversations, getMoods } from "@/lib/api/services";
import { getSupabaseBrowserClient } from "@/lib/supabase/auth-client";
import type { Conversation, MoodEntry } from "@/lib/types/api";

const moodOptions = [
  { value: 1, label: "Very low", emoji: "😞", note: "A difficult day" },
  { value: 2, label: "Low", emoji: "😕", note: "Feeling a little down" },
  { value: 3, label: "Okay", emoji: "😐", note: "Somewhere in between" },
  { value: 4, label: "Good", emoji: "🙂", note: "Things feel alright" },
  { value: 5, label: "Great", emoji: "😄", note: "Feeling positive" },
];

function dateOf(item: MoodEntry) { return item.createdAt ?? item.created_at ?? item.recordedAt ?? ""; }
function moodChartData(moods: MoodEntry[]) {
  return [...moods].filter((m) => Number.isFinite(Number(m.score)) && dateOf(m)).sort((a, b) => new Date(dateOf(a)).getTime() - new Date(dateOf(b)).getTime()).slice(-7).map((item) => ({
    score: Number(item.score), date: dateOf(item), label: new Date(dateOf(item)).toLocaleDateString("en-IN", { weekday: "short" }),
  }));
}
function friendlyError(error: unknown) { return error instanceof Error ? error.message : "Something went wrong. Please try again."; }

export function DashboardPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const chartData = useMemo(() => moodChartData(moods), [moods]);
  const average = chartData.length ? (chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length).toFixed(1) : "—";
  const todayCount = moods.filter((item) => dateOf(item) && new Date(dateOf(item)).toDateString() === new Date().toDateString()).length;

  const loadData = useCallback(async () => {
    const [moodResult, conversationResult] = await Promise.allSettled([getMoods(), getConversations()]);
    const errors: string[] = [];
    if (moodResult.status === "fulfilled") setMoods(moodResult.value);
    else errors.push(`Mood history: ${friendlyError(moodResult.reason)}`);
    if (conversationResult.status === "fulfilled") setConversations(conversationResult.value);
    else errors.push(`Conversations: ${friendlyError(conversationResult.reason)}`);
    setError(errors.join(" "));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
    try { void getSupabaseBrowserClient().auth.getUser().then((result: { data: { user: { user_metadata?: Record<string, unknown> } | null } }) => setName(String(result.data.user?.user_metadata?.full_name ?? ""))).catch(() => undefined); } catch { /* Show a neutral greeting when the browser client isn't configured. */ }
  }, [loadData]);

  async function saveMood() {
    if (!selectedMood) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await createMood({ score: selectedMood, note: note.trim() || undefined });
      setSuccess("Your check-in has been saved."); setSelectedMood(null); setNote("");
      await loadData();
    } catch (caught) { setError(friendlyError(caught)); }
    finally { setSaving(false); }
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return <div className="mc-dashboard-page">
    <SectionHeading eyebrow="A MOMENT FOR YOU" title={`${greeting}${name ? `, ${name.split(" ")[0]}` : ""}.`} description="You don't need to have it all figured out today. Check in with yourself, take a breath, and start where you are." action={<Link className="mc-button mc-button--primary" href="/chat"><MessageCircle size={16} /> Start a conversation <ArrowRight size={15} /></Link>} />
    {error && <div className="mb-4"><Feedback kind="error">{error}</Feedback></div>}
    {success && <div className="mb-4"><Feedback kind="success">{success}</Feedback></div>}

    <div className="mc-grid mc-grid--4 mc-dashboard-stats mc-enter mc-enter-delay-1">
      <Stat icon={<Activity size={17} />} label="Mood check-ins" value={loading ? "…" : String(moods.length)} foot="Your recorded reflections" />
      <Stat icon={<MessageCircle size={17} />} label="Conversations" value={loading ? "…" : String(conversations.length)} foot="Space to talk things through" />
      <Stat icon={<Activity size={17} />} label="Weekly mood" value={loading ? "…" : average} foot={chartData.length ? "Average of your last 7 entries" : "Build a picture over time"} />
      <Stat icon={<Leaf size={17} />} label="Today" value={loading ? "…" : todayCount ? "Checked in" : "A fresh start"} foot={todayCount ? "You've made time for yourself" : "There's room for one small step"} />
    </div>

    <div className="mc-grid mc-grid--2 mc-dashboard-main-grid mc-enter mc-enter-delay-2">
      <section className="mc-card mc-card-body">
        <div className="mc-card-heading"><div><h2>How are you feeling?</h2><p>Choose what feels closest. There&apos;s no right answer.</p></div><span className="mc-card-icon"><Activity size={17} /></span></div>
        <div className="mc-dashboard-moods" role="group" aria-label="Choose your mood">
          {moodOptions.map((mood) => <button key={mood.value} type="button" className={`mc-dashboard-mood${selectedMood === mood.value ? " is-selected" : ""}`} onClick={() => setSelectedMood(mood.value)} aria-pressed={selectedMood === mood.value}>
            {selectedMood === mood.value && <span className="mc-dashboard-mood__check"><Check size={12} /></span>}
            <span className="mc-dashboard-mood__emoji">{mood.emoji}</span><span className="mc-dashboard-mood__label">{mood.label}</span>
          </button>)}
        </div>
        <label className="mc-field mc-dashboard-note">A note for yourself <span className="mc-muted" style={{ fontWeight: 400 }}>(optional)</span>
          <textarea className="mc-textarea" rows={2} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What might be contributing to this feeling?" />
        </label>
        <div className="mc-dashboard-checkin-bottom"><span className="mc-muted">Your check-in is personal to you.</span><button className="mc-button mc-button--primary" type="button" disabled={!selectedMood || saving} onClick={saveMood}>{saving ? <span className="mc-spinner" /> : <Check size={15} />}{saving ? "Saving…" : "Save check-in"}</button></div>
      </section>

      <section className="mc-card mc-card-body">
        <div className="mc-card-heading"><div><h2>Your mood, over time</h2><p>A gentle view of your recent check-ins.</p></div><span className="mc-card-icon"><Activity size={17} /></span></div>
        {loading ? <LoadingPanel label="Loading your mood history…" /> : chartData.length ? <>
          <div className="mc-chart-summary"><strong>{average}<span> / 5</span></strong><span className="mc-tag">Last {chartData.length} entries</span></div>
          <div className="mc-dashboard-chart" role="img" aria-label={`Mood trend with ${chartData.length} entries; average ${average} out of 5`}>
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 5, left: -22, bottom: 0 }}>
              <defs><linearGradient id="mcMoodFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#679074" stopOpacity={0.23} /><stop offset="95%" stopColor="#679074" stopOpacity={0.01} /></linearGradient></defs>
              <CartesianGrid stroke="#e4e8df" strokeDasharray="4 5" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#8a9689", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "#8a9689", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "1px solid #d9e0d6", borderRadius: 11, background: "#fffefa", color: "#314d3b", fontSize: 12 }} formatter={(value) => [`${value} / 5`, "Mood"]} />
              <Area type="monotone" dataKey="score" stroke="#426e53" strokeWidth={2.5} fill="url(#mcMoodFill)" dot={{ r: 3.5, fill: "#fffefa", stroke: "#426e53", strokeWidth: 2 }} activeDot={{ r: 5 }} />
            </AreaChart></ResponsiveContainer>
          </div>
          <div className="mc-chart-footer"><span>Each check-in is one point in time.</span><Link href="/mood" className="mc-inline-link">View history <ArrowRight size={14} /></Link></div>
        </> : <EmptyPanel icon={<Activity size={20} />} title="Your trend will grow with you" description="When you record a few check-ins, your mood history will appear here." action={<Link href="/mood" className="mc-button mc-button--secondary">Explore mood tracking <ArrowRight size={14} /></Link>} />}
      </section>
    </div>

    <div className="mc-grid mc-grid--3 mc-dashboard-shortcuts mc-enter mc-enter-delay-3">
      <Shortcut href="/journal" icon={<BookOpenText size={18} />} eyebrow="REFLECT" title="Write it out" body="Give your thoughts a little room on the page." />
      <Shortcut href="/app/resources" icon={<Compass size={18} />} eyebrow="EXPLORE" title="Find a helpful resource" body="Browse practical, curated wellbeing information." />
      <Shortcut href="/counselling" icon={<CalendarCheck size={18} />} eyebrow="CONNECT" title="Explore counselling" body="See available support options in one place." />
    </div>
  </div>;
}

function Stat({ icon, label, value, foot }: { icon: React.ReactNode; label: string; value: string; foot: string }) {
  return <article className="mc-card mc-stat-card"><div className="mc-stat-card__top"><span className="mc-stat-card__label">{label}</span><span className="mc-card-icon">{icon}</span></div><div className="mc-stat-card__value">{value}</div><div className="mc-stat-card__foot">{foot}</div><span className="mc-stat-card__decoration" aria-hidden="true" /></article>;
}
function Shortcut({ href, icon, eyebrow, title, body }: { href: string; icon: React.ReactNode; eyebrow: string; title: string; body: string }) {
  return <Link className="mc-shortcut" href={href}><span className="mc-shortcut__icon">{icon}</span><span className="mc-eyebrow">{eyebrow}</span><strong>{title}</strong><span className="mc-shortcut__body">{body}</span><span className="mc-shortcut__arrow"><ArrowRight size={16} /></span></Link>;
}
