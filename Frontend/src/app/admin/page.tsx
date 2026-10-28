import type { Metadata } from "next";
import { AdminDashboard } from "@/components/roles/admin-dashboard";
import { getAuthenticatedAppProfile } from "@/lib/auth/server-profile";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "MindCare administrative overview.",
};
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const profile = await getAuthenticatedAppProfile();
  if (!profile || profile.role !== "ADMIN") return null;
  return <AdminDashboard email={profile.email} />;
}
