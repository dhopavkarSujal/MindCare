import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeInternalPath } from "@/lib/auth/navigation";
import {
  GUEST_ONLY_PATHS,
  PROTECTED_PREFIXES,
  getSupabaseEnv,
  matchesPrefix,
} from "@/lib/config";

/**
 * Refreshes the Supabase session cookies and applies route protection.
 * Called from src/proxy.ts on every matched request.
 *
 * This is a first line of defence only: the (app) layout re-checks the user
 * with getUser(), and the Express API verifies the bearer token on every call.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getSupabaseEnv();

  // Let the app boot (e.g. the public landing page) while env vars are being set up.
  if (!env) return response;

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname, search, searchParams } = request.nextUrl;

  const redirectWithCookies = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    // Preserve any refreshed session cookies on the redirect response.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!signedIn && matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return redirectWithCookies(loginUrl);
  }

  // Signed-in users skip the auth pages. If the API has just rejected the session
  // (?reason / ?authError) we must NOT bounce them back, or we would loop.
  const hasAuthProblem = searchParams.has("reason") || searchParams.has("authError");
  if (signedIn && !hasAuthProblem && matchesPrefix(pathname, GUEST_ONLY_PATHS)) {
    const target = safeInternalPath(searchParams.get("next"), "/dashboard");
    return redirectWithCookies(new URL(target, request.url));
  }

  return response;
}
