import type { Metadata } from "next";
import { ProfilePage } from "@/components/features/profile-page";
export const metadata: Metadata = { title: "Your profile" };
export default function ProfileRoute() { return <ProfilePage />; }
