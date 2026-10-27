"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, LoaderCircle, ShieldCheck } from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { getNextPathFromBrowser } from "@/lib/auth/navigation";
import { getRoleDestination } from "@/lib/auth/roles";
import { getSupabaseBrowserClient } from "@/lib/supabase/auth-client";
import { verifyBackendProfile } from "@/lib/auth/verify-backend-profile";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("authError");
    const message = params.get("reason") === "session-expired"
      ? "Your session has ended. Please sign in again to continue."
      : authError === "verification_failed"
      ? "We couldn't complete the email or Google verification link. Please try signing in again or request a fresh link."
      : authError === "profile_unavailable"
        ? "Your authentication succeeded, but the MindCare API couldn't load your application profile. Check the backend and try again."
        : "";
    if (!message) return;
    const frame = window.requestAnimationFrame(() => setError(message));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Enter your email address and password to continue.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError) throw authError;
      if (!data.session?.access_token) {
        throw new Error("We couldn't start your session. Please try signing in again.");
      }

      const profile = await verifyBackendProfile(data.session.access_token);
      router.replace(getRoleDestination(profile.role, getNextPathFromBrowser()));
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to sign in. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mc-auth-form">
      <div className="mc-auth-form__intro">
        <span className="mc-auth-form__kicker">GOOD TO SEE YOU AGAIN</span>
        <h2>Welcome <em>back.</em></h2>
        <p>Sign in to return to your personal wellbeing space.</p>
      </div>

      {error && <div className="mc-auth__alert mc-auth__alert--error" role="alert">{error}</div>}

      <form className="mc-auth-fields" onSubmit={handleSubmit} noValidate>
        <div className="mc-auth-field">
          <label htmlFor="login-email">Email address</label>
          <div className="mc-auth-input-wrap">
            <Mail size={17} aria-hidden="true" />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setError(""); }}
              required
              maxLength={254}
              aria-invalid={Boolean(error && /email|address/i.test(error))}
              disabled={busy}
            />
          </div>
        </div>

        <div className="mc-auth-field">
          <div className="mc-auth-field__label-row">
            <label htmlFor="login-password">Password</label>
            <Link className="mc-auth__forgot-link" href="/forgot-password">Forgot password?</Link>
          </div>
          <div className="mc-auth-input-wrap">
            <LockKeyhole size={17} aria-hidden="true" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); setError(""); }}
              required
              aria-invalid={Boolean(error && /password/i.test(error))}
              disabled={busy}
            />
            <button
              className="mc-auth__reveal"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              disabled={busy}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button className="mc-auth__submit" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="mc-auth__button-spinner" size={17} aria-hidden="true" /> : null}
          <span>{busy ? "Signing you in…" : "Sign in to MindCare"}</span>
          {!busy && <ArrowRight size={17} aria-hidden="true" />}
        </button>
      </form>

      <div className="mc-auth__divider"><span /> <span>or continue with</span> <span /></div>
      <GoogleAuthButton onError={setError} disabled={busy} />

      <p className="mc-auth__mobile-switch">
        New to MindCare? <Link href="/register">Create your account <ArrowRight size={14} /></Link>
      </p>
      <p className="mc-auth__form-note">
        <ShieldCheck size={14} aria-hidden="true" />
        Your password is handled by account authentication, not by the chat assistant.
      </p>
    </div>
  );
}
