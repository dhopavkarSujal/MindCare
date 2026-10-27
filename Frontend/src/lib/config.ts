/**
 * Central place for public runtime configuration.
 *
 * NOTE: Next.js only inlines `process.env.NEXT_PUBLIC_*` when the full name is
 * written literally, so each variable is read explicitly (no dynamic lookups).
 */

/** Express API base URL including the `/api` prefix, without a trailing slash. */
export function getApiBaseUrl(): string | undefined {
  const value =
    process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  return value ? value.replace(/\/+$/, "") : undefined;
}

export function getSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

/** Routes that require a signed-in user. Enforced in src/proxy.ts and the (app) layout. */
export const PROTECTED_PREFIXES = [
  "/admin",
  "/counselor",
  "/dashboard",
  "/chat",
  "/mood",
  "/journal",
  "/app",
  "/counselling",
  "/profile",
  "/settings",
  "/onboarding",
] as const;

/** Auth pages a signed-in user should not see again. */
export const GUEST_ONLY_PATHS = ["/login", "/register", "/forgot-password"] as const;

export function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
