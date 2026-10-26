"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, ChevronRight, Heart, LoaderCircle, LockKeyhole, RefreshCw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { SectionHeading } from "@/components/app/section-heading";
import { EmptyPanel, Feedback, LoadingPanel } from "@/components/app/feedback";
import { getConsents, updateConsent } from "@/lib/api/services";

const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";
const labels: Record<string, { title: string; description: string; icon: typeof Heart }> = {
  share_mood_data: { title: "Allow mood context in AI conversations", description: "Controls whether mood information may be included where supported by MindCare's backend.", icon: Heart },
  share_mood_with_ai: { title: "Allow mood context in AI conversations", description: "Controls whether mood information may be included where supported by MindCare's backend.", icon: Heart },
  shareMoodData: { title: "Allow mood context in AI conversations", description: "Controls whether mood information may be included where supported by MindCare's backend.", icon: Heart },
  notifications: { title: "Notifications", description: "Controls the notification preference supported by your account.", icon: Bell },
};
function formatPermission(permission: string) { return permission.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (char) => char.toUpperCase()); }

export function SettingsPage() {
  const [consents, setConsents] = useState<Array<{ permission: string; enabled: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try { setConsents(await getConsents()); setError(""); }
    catch (caught) { setError(errorText(caught)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function change(permission: string, enabled: boolean) {
    const previous = consents.find((item) => item.permission === permission)?.enabled ?? false;
    setConsents((current) => current.map((item) => item.permission === permission ? { ...item, enabled } : item));
    setUpdating(permission); setError(""); setSuccess("");
    try { await updateConsent({ permission, enabled }); setSuccess("Your preference has been updated."); }
    catch (caught) { setConsents((current) => current.map((item) => item.permission === permission ? { ...item, enabled: previous } : item)); setError(errorText(caught)); }
    finally { setUpdating(""); }
  }

  return <div className="mc-settings-page">
    <SectionHeading eyebrow="YOUR PREFERENCES" title="Make this space work for you." description="Manage the consent controls your MindCare backend exposes. Changes are saved to your account when the server confirms them." action={<button className="mc-button mc-button--secondary" type="button" onClick={() => { setLoading(true); void load(); }} disabled={loading}><RefreshCw size={14} /> Refresh</button>} />
    {error && <div className="mc-page-feedback"><Feedback kind="error">{error}</Feedback></div>}
    {success && <div className="mc-page-feedback"><Feedback kind="success">{success}</Feedback></div>}
    <div className="mc-settings-intro"><span><ShieldCheck size={19} /></span><div><strong>Your consent matters.</strong><p>MindCare should only use optional information in line with the preferences and permissions your account supports. If a control isn&apos;t listed, don&apos;t assume the setting is available.</p></div></div>
    <section className="mc-card mc-settings-card"><div className="mc-card-heading"><div><h2>Consent and preferences</h2><p>Only permissions returned by the API appear here.</p></div><span className="mc-card-icon"><SlidersHorizontal size={17} /></span></div>
      {loading ? <LoadingPanel label="Loading your preferences…" /> : consents.length ? <div className="mc-consent-list">{consents.map((item) => { const known = labels[item.permission]; const Icon = known?.icon ?? LockKeyhole; return <article className="mc-consent-row" key={item.permission}><span className="mc-consent-row__icon"><Icon size={17} /></span><span className="mc-consent-row__copy"><strong>{known?.title ?? formatPermission(item.permission)}</strong><small>{known?.description ?? "This preference is defined by your MindCare account settings."}</small></span><label className="mc-switch"><input type="checkbox" checked={item.enabled} disabled={updating === item.permission} onChange={(event) => void change(item.permission, event.target.checked)} aria-label={`Enable ${known?.title ?? formatPermission(item.permission)}`} /><span className="mc-switch__track"><span /></span></label>{updating === item.permission && <LoaderCircle size={15} className="mc-spin-icon" aria-label="Saving" />}</article>; })}</div> : <EmptyPanel icon={<SlidersHorizontal size={20} />} title="No consent controls returned" description="The settings screen is ready, but the API did not return any consent preferences. Confirm the GET /consents endpoint and seed the supported permissions." />}
    </section>
    <section className="mc-card mc-settings-security"><div className="mc-settings-security__icon"><LockKeyhole size={18} /></div><div><strong>Authentication and account security</strong><p>Sign-in is managed by Supabase. MindCare doesn&apos;t expose password changes here unless the backend and auth workflow explicitly support them.</p></div><a href="/forgot-password">Reset password <ChevronRight size={14} /></a></section>
  </div>;
}
