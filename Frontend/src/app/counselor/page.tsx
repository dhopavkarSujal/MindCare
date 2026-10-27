import type { Metadata } from "next";
import { CounselorDashboard } from "@/components/roles/counselor-dashboard";
import { getAuthenticatedAppProfile } from "@/lib/auth/server-profile";

export const metadata: Metadata = {
  title: "Counselor workspace",
  description: "MindCare counselor workspace.",
};
export const dynamic = "force-dynamic";

export default async function CounselorPage() {
  const profile = await getAuthenticatedAppProfile();
  if (!profile || profile.role !== "COUNSELOR") return null;
  return <CounselorDashboard email={profile.email} name={profile.name} />;
}
