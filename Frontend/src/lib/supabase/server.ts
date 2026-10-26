import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/config";

export async function createSupabaseServerClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Supabase is not configured. Copy the values into .env.local; see .env.example.");
  }
  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; proxy.ts refreshes sessions on requests.
        }
      },
    },
  });
}
