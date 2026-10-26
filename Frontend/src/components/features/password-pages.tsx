"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/auth-client";
import { AuthShell } from "@/components/auth/auth-shell";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) { setError("Enter a valid email address."); return; }
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=%2Freset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalized, { redirectTo });
      if (resetError) throw resetError;
      setSent(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn't send a reset link. Please try again."); }
    finally { setBusy(false); }
  }

  return <AuthShell mode="login"><div className="mc-password-form"><span className="mc-auth-form__kicker">ACCOUNT RECOVERY</span><h2>Let&apos;s get you <em>back in.</em></h2><p>Enter the email for your MindCare account. We&apos;ll request a password reset link from Supabase.</p>{error && <div className="mc-auth__alert mc-auth__alert--error" role="alert">{error}</div>}{sent ? <div className="mc-password-success" role="status"><span><CheckCircle2 size={23} /></span><strong>Check your inbox.</strong><p>If the address is registered and your email provider allows it, a reset message should arrive shortly. Follow the link to set a new password.</p><Link href="/login" className="mc-button mc-button--primary">Return to sign in <ArrowRight size={15} /></Link></div> : <form onSubmit={submit} className="mc-password-fields"><label className="mc-field">Email address<span className="mc-password-input"><Mail size={16} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required maxLength={254} /></span></label><button className="mc-button mc-button--primary" type="submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="mc-spin-icon" /> : <ArrowRight size={16} />}{busy ? "Requesting link…" : "Send reset link"}</button></form>}<Link href="/login" className="mc-password-back"><ArrowLeft size={14} /> Back to sign in</Link></div></AuthShell>;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (password.length < 6) { setError("Use at least 6 characters for your new password."); return; }
    if (password !== confirm) { setError("Those passwords don't match."); return; }
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("This password-reset session is missing or expired. Request a new reset link.");
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn't update your password. Please request a fresh link."); }
    finally { setBusy(false); }
  }
  return <AuthShell mode="login"><div className="mc-password-form"><span className="mc-auth-form__kicker">NEW PASSWORD</span><h2>Choose a <em>new password.</em></h2><p>Use a password that you don&apos;t use on other sites.</p>{error && <div className="mc-auth__alert mc-auth__alert--error" role="alert">{error}</div>}{success ? <div className="mc-password-success" role="status"><span><CheckCircle2 size={23} /></span><strong>Password updated.</strong><p>You can now sign in using your new password.</p><button className="mc-button mc-button--primary" onClick={() => { router.replace("/login"); router.refresh(); }} type="button">Continue to sign in <ArrowRight size={15} /></button></div> : <form className="mc-password-fields" onSubmit={submit}><label className="mc-field">New password<span className="mc-password-input"><LockKeyhole size={16} /><input type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} autoComplete="new-password" required /></span></label><label className="mc-field">Confirm new password<span className="mc-password-input"><LockKeyhole size={16} /><input type={show ? "text" : "password"} value={confirm} onChange={(event) => setConfirm(event.target.value)} minLength={6} autoComplete="new-password" required /></span></label><button type="button" className="mc-password-show" onClick={() => setShow((value) => !value)}>{show ? <EyeOff size={14} /> : <Eye size={14} />}{show ? "Hide passwords" : "Show passwords"}</button><button className="mc-button mc-button--primary" type="submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="mc-spin-icon" /> : <CheckCircle2 size={16} />}{busy ? "Updating…" : "Update password"}</button></form>}<Link href="/login" className="mc-password-back"><ArrowLeft size={14} /> Back to sign in</Link></div></AuthShell>;
}
