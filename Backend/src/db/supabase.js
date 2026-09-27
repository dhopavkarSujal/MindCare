import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is missing.");
}

if (!supabasePublishableKey) {
  throw new Error(
    "SUPABASE_PUBLISHABLE_KEY is missing."
  );
}

const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

export default supabase;