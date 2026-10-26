import type { Metadata } from "next";
import { DashboardPage } from "@/components/features/dashboard-page";

export const metadata: Metadata = { title: "Your space" };
export default function DashboardRoute() { return <DashboardPage />; }
