"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { getAuthCallbackUrl, getNextPathFromBrowser } from "@/lib/auth/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/auth-client";
import { verifyBackendProfile } from "@/lib/auth/verify-backend-profile";

function passwordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedNotice, setAcceptedNotice] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const strength = useMemo(() => passwordStrength(password), [password]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();

    const normalizedName = fullName.trim().replace(/\s+/g, " ");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setError("Fill in each field to create your account.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (normalizedName.length > 100) {
      setError("Please keep your name under 100 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Those passwords don't match yet. Check them and try again.");
      return;
    }
    if (!acceptedNotice) {
      setError("Please confirm that you understand what MindCare is designed to provide.");
      return;
    }

    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const nextPath = getNextPathFromBrowser();
      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: normalizedName },
          emailRedirectTo: getAuthCallbackUrl(nextPath),
        },
      });

      if (authError) throw authError;

      if (data.session?.access_token) {
        await verifyBackendProfile(data.session.access_token);
        router.replace(nextPath);
        router.refresh();
        return;
      }

      setSuccess(
        "Your account request is ready. Check your inbox for the verification email, then use the link to finish setting up your MindCare account.",
      );
      setPassword("");
      setConfirmPassword("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We couldn't create your account. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function validateNoticeForGoogle(): boolean {
    if (!acceptedNotice) {
      setError("Please confirm the wellbeing notice before continuing.");
      return false;
    }
    return true;
  }

  if (success) {
    return (
      <div className="mc-auth-form mc-auth-form--success">
        <div className="mc-auth__success-mark" aria-hidden="true"><Mail size={25} /></div>
        <span className="mc-auth-form__kicker">ONE SMALL STEP LEFT</span>
        <h2>Check your <em>inbox.</em></h2>
        <p className="mc-auth__success-copy" role="status">{success}</p>
        <div className="mc-auth__success-email"><Mail size={16} aria-hidden="true" /><span>{email.trim().toLowerCase()}</span></div>
        <Link className="mc-auth__submit mc-auth__submit--link" href="/login">
          <span>Return to sign in</span><ArrowRight size={17} aria-hidden="true" />
        </Link>
        <p className="mc-auth__form-note"><ShieldCheck size={14} aria-hidden="true" />If the message doesn&apos;t arrive, check your spam folder or your Supabase email settings.</p>
      </div>
    );
  }

  return (
    <div className="mc-auth-form mc-auth-form--register">
      <div className="mc-auth-form__intro">
        <span className="mc-auth-form__kicker">YOUR JOURNEY, YOUR PACE</span>
        <h2>Create your <em>space.</em></h2>
        <p>A few details to get your personal wellbeing space started.</p>
      </div>

      {error && <div className="mc-auth__alert mc-auth__alert--error" role="alert">{error}</div>}

      <form className="mc-auth-fields mc-auth-fields--register" onSubmit={handleSubmit} noValidate>
        <div className="mc-auth-field">
          <label htmlFor="register-name">Full name</label>
          <div className="mc-auth-input-wrap">
            <UserRound size={17} aria-hidden="true" />
            <input
              id="register-name"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="How should we address you?"
              value={fullName}
              onChange={(event) => { setFullName(event.target.value); clearMessages(); }}
              required
              maxLength={100}
              disabled={busy}
            />
          </div>
        </div>

        <div className="mc-auth-field">
          <label htmlFor="register-email">Email address</label>
          <div className="mc-auth-input-wrap">
            <Mail size={17} aria-hidden="true" />
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => { setEmail(event.target.value); clearMessages(); }}
              required
              maxLength={254}
              disabled={busy}
            />
          </div>
        </div>

        <div className="mc-auth-field">
          <div className="mc-auth-field__label-row">
            <label htmlFor="register-password">Password</label>
            <span>At least 6 characters</span>
          </div>
          <div className="mc-auth-input-wrap">
            <LockKeyhole size={17} aria-hidden="true" />
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); clearMessages(); }}
              required
              minLength={6}
              disabled={busy}
            />
            <button className="mc-auth__reveal" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} disabled={busy}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {password && (
            <div className="mc-auth__strength" aria-label={`Password strength ${strength} of 4`}>
              <div className="mc-auth__strength-bars" aria-hidden="true">
                {[1, 2, 3, 4].map((segment) => <span className={segment <= strength ? `is-active strength-${strength}` : ""} key={segment} />)}
              </div>
              <span>{strength <= 1 ? "Getting started" : strength === 2 ? "Fair" : strength === 3 ? "Good" : "Stronger password"}</span>
            </div>
          )}
        </div>

        <div className="mc-auth-field">
          <label htmlFor="register-confirm-password">Confirm password</label>
          <div className="mc-auth-input-wrap">
            <LockKeyhole size={17} aria-hidden="true" />
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter the same password again"
              value={confirmPassword}
              onChange={(event) => { setConfirmPassword(event.target.value); clearMessages(); }}
              required
              minLength={6}
              disabled={busy}
              aria-invalid={Boolean(confirmPassword && confirmPassword !== password)}
            />
            <button className="mc-auth__reveal" type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirmPassword} disabled={busy}>
              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {confirmPassword && confirmPassword === password && <p className="mc-auth__match"><Check size={13} aria-hidden="true" /> Passwords match</p>}
        </div>

        <label className="mc-auth__notice">
          <input type="checkbox" checked={acceptedNotice} onChange={(event) => { setAcceptedNotice(event.target.checked); clearMessages(); }} disabled={busy} />
          <span className="mc-auth__notice-box" aria-hidden="true"><Check size={12} /></span>
          <span>I understand MindCare offers supportive wellbeing tools and does not replace professional healthcare or emergency support.</span>
        </label>

        <button className="mc-auth__submit" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="mc-auth__button-spinner" size={17} aria-hidden="true" /> : null}
          <span>{busy ? "Creating your account…" : "Create my account"}</span>
          {!busy && <ArrowRight size={17} aria-hidden="true" />}
        </button>
      </form>

      <div className="mc-auth__divider"><span /> <span>or sign up with</span> <span /></div>
      <GoogleAuthButton onError={setError} beforeContinue={validateNoticeForGoogle} disabled={busy} label="Continue with Google" />

      <p className="mc-auth__mobile-switch">
        Already have an account? <Link href="/login">Sign in <ArrowRight size={14} /></Link>
      </p>
      <p className="mc-auth__form-note"><ShieldCheck size={14} aria-hidden="true" />Use an email address you can access to finish account verification.</p>
      <p className="mc-auth__form-note">By creating an account you agree to the <Link href="/terms">Terms</Link> and acknowledge the <Link href="/privacy">Privacy notice</Link>.</p>
    </div>
  );
}
