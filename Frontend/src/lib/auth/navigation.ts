export function safeInternalPath(
  candidate: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  // Reject encoded or malformed external-style destinations as well.
  try {
    const parsed = new URL(candidate, "https://mindcare.invalid");
    if (parsed.origin !== "https://mindcare.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function getNextPathFromBrowser(fallback = "/dashboard"): string {
  if (typeof window === "undefined") return fallback;
  return safeInternalPath(new URLSearchParams(window.location.search).get("next"), fallback);
}

export function getAuthCallbackUrl(nextPath: string): string {
  if (typeof window === "undefined") return "/auth/callback?next=%2Fdashboard";
  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("next", safeInternalPath(nextPath));
  return callback.toString();
}
