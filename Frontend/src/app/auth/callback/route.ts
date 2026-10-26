import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { safeInternalPath } from "@/lib/auth/navigation";
import { getApiBaseUrl, getSupabaseEnv } from "@/lib/config";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeInternalPath(requestUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));
  const env = getSupabaseEnv();

  if (!code || !env) {
    return NextResponse.redirect(new URL("/login?authError=verification_failed", requestUrl.origin));
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
    return NextResponse.redirect(new URL("/login?authError=verification_failed", requestUrl.origin));
  }

  // The V1 app validates the signed-in Supabase user through Express /auth/me.
  // Preserve that integration after email verification and OAuth callback as well.
  const apiBase = getApiBaseUrl();
  if (nextPath !== "/reset-password" && apiBase && data.session?.access_token) {
    try {
      const backendResponse = await fetch(`${apiBase}/auth/me`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${data.session.access_token}` },
        cache: "no-store",
      });
      const payload = backendResponse.ok ? await backendResponse.json().catch(() => null) : null;
      if (!backendResponse.ok || !payload?.data?.user) {
        const loginUrl = new URL("/login?authError=profile_unavailable", requestUrl.origin);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/login?authError=profile_unavailable", requestUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}
