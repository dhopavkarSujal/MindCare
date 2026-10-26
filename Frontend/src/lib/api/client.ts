import { getSupabaseBrowserClient } from "@/lib/supabase/auth-client";
import { getApiBaseUrl } from "@/lib/config";

export class ApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new ApiError("MindCare API is not configured. Set NEXT_PUBLIC_API_URL in .env.local.", 0);
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");

  // Preserve the V1 convention: NEXT_PUBLIC_API_URL includes the same base path as VITE_API_URL.
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not configured")) throw error;
    // Public pages may call public endpoints without a signed-in session.
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/${path.replace(/^\/+/, "")}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: options.cache ?? "no-store",
    });
  } catch {
    throw new ApiError("MindCare couldn't reach the server. Check that the backend is running and the API URL is correct.", 0);
  }

  const rawText = await response.text();
  let payload: unknown = null;
  if (rawText) {
    try { payload = JSON.parse(rawText); } catch { payload = rawText; }
  }
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined" && !["/login", "/register", "/forgot-password", "/reset-password"].includes(window.location.pathname)) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/login?reason=session-expired&next=${encodeURIComponent(currentPath)}`);
    }
    const candidate = payload as { message?: string; error?: string } | null;
    const message = candidate && (candidate.message || candidate.error)
      ? (candidate.message || candidate.error)!
      : response.status === 401
        ? "Your session has expired. Please sign in again."
        : `The request couldn't be completed (${response.status}). Please try again.`;
    throw new ApiError(message, response.status, payload);
  }
  return payload as T;
}

export function unwrapData<T>(value: unknown): T {
  if (value && typeof value === "object" && "data" in value) return (value as { data: T }).data;
  return value as T;
}
