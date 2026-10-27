import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAppProfile } from "@/lib/auth/server-profile";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await getAuthenticatedAppProfile();
  if (!profile) redirect("/login?authError=profile_unavailable");
  if (profile.role !== "ADMIN") {
    redirect(profile.role === "COUNSELOR" ? "/counselor" : "/dashboard");
  }
  return children;
}
