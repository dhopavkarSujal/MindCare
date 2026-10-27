import { getApiBaseUrl } from "@/lib/config";
import { parseMindCareRole, type MindCareRole } from "@/lib/auth/roles";

type BackendMeResponse = {
  data?: {
    user?: {
      role?: unknown;
    };
  };
};

/**
 * Verify a Supabase bearer token through Express /auth/me and return the
 * application role stored by the backend. Role-based routes fail closed if
 * that profile cannot be read.
 */
export async function verifyBackendProfile(accessToken: string): Promise<{ role: MindCareRole }> {
  const apiBase = getApiBaseUrl();
  if (!apiBase) {
    throw new Error("MindCare's API URL is not configured. Set NEXT_PUBLIC_API_URL and restart the frontend.");
  }

  let response: Response;
  try {
    response = await fetch(`${apiBase}/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Your sign-in worked, but MindCare could not reach its API. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.",
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Supabase accepted your sign-in, but the API did not recognize the session. Check the backend's Supabase token verification settings.",
      );
    }
    throw new Error(
      `Your account was authenticated, but the MindCare API returned an error (${response.status}). Please try again.`,
    );
  }

  let payload: BackendMeResponse;
  try {
    payload = (await response.json()) as BackendMeResponse;
  } catch {
    throw new Error("The MindCare API returned an unreadable profile response.");
  }

  const role = parseMindCareRole(payload?.data?.user?.role);
  if (!role) {
    throw new Error(
      "MindCare authenticated your account, but no valid application role was returned. Ask an administrator to check your user profile.",
    );
  }

  return { role };
}
