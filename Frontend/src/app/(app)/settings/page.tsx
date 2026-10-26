import type { Metadata } from "next";
import { SettingsPage } from "@/components/features/settings-page";
export const metadata: Metadata = { title: "Preferences" };
export default function SettingsRoute() { return <SettingsPage />; }
