"use client";

import { useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { getAuthCallbackUrl, getNextPathFromBrowser } from "@/lib/auth/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/auth-client";

type GoogleAuthButtonProps = {
  onError: (message: string) => void;
  beforeContinue?: () => boolean;
  disabled?: boolean;
  label?: string;
};

export function GoogleAuthButton({
  onError,
  beforeContinue,
  disabled = false,
  label = "Continue with Google",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    if (beforeContinue && !beforeContinue()) return;
    onError("");
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = getAuthCallbackUrl(getNextPathFromBrowser());
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to continue with Google. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="mc-auth__google-button"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
    >
      {loading ? (
        <LoaderCircle className="mc-auth__button-spinner" size={17} aria-hidden="true" />
      ) : (
        <span className="mc-auth__google-mark" aria-hidden="true">G</span>
      )}
      <span>{loading ? "Connecting to Google…" : label}</span>
      {!loading && <ArrowUpRight size={15} aria-hidden="true" />}
    </button>
  );
}
