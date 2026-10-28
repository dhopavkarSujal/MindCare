import { getApiBaseUrl } from "@/lib/config";
import { parseMindCareRole, type MindCareRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthenticatedAppProfile = {
  role: MindCareRole;
  email: string;
  name: string;
};

type BackendMePayload = {
  data?: {
    user?: {
      role?: unknown;
      email?: unknown;
      name?: unknown;
    };
  };
};

/**
 * Verify the current Supabase session and read its application role from the
 * Express API. The browser never supplies or decides the user's role.
 * Returns null when either authentication or role verification fails.
 */
export async function getAuthenticatedAppProfile(): Promise<AuthenticatedAppProfile | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return null;

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.access_token) return null;

    const apiBase = getApiBaseUrl();
    if (!apiBase) return null;

    const response = await fetch(`${apiBase}/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as BackendMePayload;
    const backendUser = payload?.data?.user;
    const role = parseMindCareRole(backendUser?.role);
    if (!role) return null;

    const metadata = authData.user.user_metadata ?? {};
    const metadataName =
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : "";

    return {
      role,
      email:
        typeof backendUser?.email === "string"
          ? backendUser.email
          : authData.user.email ?? "",
      name:
        typeof backendUser?.name === "string" && backendUser.name.trim()
          ? backendUser.name
          : metadataName,
    };
  } catch {
    return null;
  }
}
