"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleUserRound, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { SectionHeading } from "@/components/app/section-heading";
import { Feedback, LoadingPanel } from "@/components/app/feedback";
import { getProfile, updateProfile } from "@/lib/api/services";

const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";

export function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      const profile = await getProfile();
      const nextName = String(profile.name ?? profile.fullName ?? profile.full_name ?? "");
      setName(nextName); setOriginalName(nextName); setEmail(String(profile.email ?? "")); setRole(String(profile.role ?? "")); setError("");
    } catch (caught) { setError(errorText(caught)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = name.trim();
    if (!normalized) { setError("Please enter a name."); return; }
    setSaving(true); setError(""); setSuccess("");
    try { await updateProfile({ name: normalized }); setName(normalized); setOriginalName(normalized); setSuccess("Your profile changes have been saved."); }
    catch (caught) { setError(errorText(caught)); }
    finally { setSaving(false); }
  }

  return <div className="mc-profile-page">
    <SectionHeading eyebrow="YOUR ACCOUNT" title="Your profile, your details." description="Keep your basic account information up to date. Your sign-in email is managed through your authentication provider." />
    {error && <div className="mc-page-feedback"><Feedback kind="error">{error}</Feedback></div>}
    {success && <div className="mc-page-feedback"><Feedback kind="success">{success}</Feedback></div>}
    {loading ? <div className="mc-card"><LoadingPanel label="Loading your profile…" /></div> : <div className="mc-profile-layout">
      <aside className="mc-card mc-profile-summary"><span className="mc-profile-summary__avatar"><CircleUserRound size={34} /></span><h2>{name || "MindCare member"}</h2><p>{email || "Email not returned by the API"}</p>{role && <span className="mc-tag">{role}</span>}<div className="mc-divider-row" /><div className="mc-profile-assurance"><ShieldCheck size={16} /><span>Profile information is retrieved from your MindCare backend.</span></div></aside>
      <form className="mc-card mc-profile-form" onSubmit={save}>
        <div className="mc-card-heading"><div><h2>Personal information</h2><p>Only the fields supported by your current profile endpoint are editable here.</p></div><span className="mc-card-icon"><UserRound size={17} /></span></div>
        <label className="mc-field">Display name<input className="mc-input" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="Enter your name" /></label>
        <label className="mc-field">Email address<span className="mc-profile-email"><Mail size={15} /><input className="mc-input" type="email" value={email} readOnly aria-readonly="true" /><span>Managed by auth</span></span></label>
        <div className="mc-profile-form__foot"><p>{name !== originalName ? "You have unsaved changes." : "Your details are up to date."}</p><button className="mc-button mc-button--primary" type="submit" disabled={saving || name.trim() === originalName.trim()}>{saving ? <span className="mc-spinner" /> : <Save size={14} />}{saving ? "Saving…" : "Save changes"}</button></div>
      </form>
    </div>}
  </div>;
}
