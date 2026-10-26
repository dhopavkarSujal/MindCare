import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your environment file.",
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(env.url, env.key);
  }

  return browserClient;
}
