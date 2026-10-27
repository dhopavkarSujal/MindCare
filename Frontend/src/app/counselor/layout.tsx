import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAppProfile } from "@/lib/auth/server-profile";

export const dynamic = "force-dynamic";

export default async function CounselorLayout({ children }: { children: ReactNode }) {
  const profile = await getAuthenticatedAppProfile();
  if (!profile) redirect("/login?authError=profile_unavailable");
  if (profile.role !== "COUNSELOR") {
    redirect(profile.role === "ADMIN" ? "/admin" : "/dashboard");
  }
  return children;
}
