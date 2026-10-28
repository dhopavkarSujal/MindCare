import "../app-shell.css";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { getAuthenticatedAppProfile } from "@/lib/auth/server-profile";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await getAuthenticatedAppProfile();
  if (!profile) redirect("/login?authError=profile_unavailable");
  if (profile.role === "ADMIN") redirect("/admin");
  if (profile.role === "COUNSELOR") redirect("/counselor");

  return <AppShell user={{ email: profile.email, name: profile.name }}>{children}</AppShell>;
}
