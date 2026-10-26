import "../app-shell.css";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return <AppShell user={{ email: data.user.email ?? "", name: String(data.user.user_metadata?.full_name ?? "") }}>{children}</AppShell>;
}
