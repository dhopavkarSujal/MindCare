import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { safeInternalPath } from "@/lib/auth/navigation";
import { getRoleDestination, parseMindCareRole } from "@/lib/auth/roles";
import { getApiBaseUrl, getSupabaseEnv } from "@/lib/config";

type BackendMeResponse = {
  data?: { user?: { role?: unknown } };
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeInternalPath(requestUrl.searchParams.get("next"));
  // Keep one response object so cookies set during code exchange survive redirects.
  const response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));
  const env = getSupabaseEnv();

  if (!code || !env) {
    response.headers.set("Location", new URL("/login?authError=verification_failed", requestUrl.origin).toString());
    return response;
  }

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    response.headers.set("Location", new URL("/login?authError=verification_failed", requestUrl.origin).toString());
    return response;
  }

  // Password recovery returns to its own page. All other authenticated callbacks
  // must read the backend role before choosing a dashboard.
  if (nextPath !== "/reset-password") {
    const apiBase = getApiBaseUrl();
    if (!apiBase || !data.session?.access_token) {
      response.headers.set("Location", new URL("/login?authError=profile_unavailable", requestUrl.origin).toString());
      return response;
    }

    try {
      const backendResponse = await fetch(`${apiBase}/auth/me`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        cache: "no-store",
      });
      const payload = backendResponse.ok
        ? (await backendResponse.json().catch(() => null)) as BackendMeResponse | null
        : null;
      const role = parseMindCareRole(payload?.data?.user?.role);
      if (!backendResponse.ok || !role) {
        response.headers.set("Location", new URL("/login?authError=profile_unavailable", requestUrl.origin).toString());
        return response;
      }
      response.headers.set("Location", new URL(getRoleDestination(role, nextPath), requestUrl.origin).toString());
    } catch {
      response.headers.set("Location", new URL("/login?authError=profile_unavailable", requestUrl.origin).toString());
    }
  }

  return response;
}
