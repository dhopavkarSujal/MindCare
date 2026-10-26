import { getApiBaseUrl } from "@/lib/config";

type BackendMeResponse = {
  data?: {
    user?: unknown;
  };
};

/**
 * The existing MindCare API exposes GET /auth/me and expects a Supabase bearer
 * token. Verification is skipped only when no API base URL is configured.
 */
export async function verifyBackendProfile(accessToken: string): Promise<void> {
  const apiBase = getApiBaseUrl();
  if (!apiBase) return;

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

  if (!payload?.data?.user) {
    throw new Error(
      "Your account was authenticated, but MindCare could not load your application profile. Check the backend profile setup.",
    );
  }
}
