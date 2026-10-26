import type { Metadata } from "next";
import { CounsellingPage } from "@/components/features/counselling-page";
export const metadata: Metadata = { title: "Counselling" };
export default function CounsellingRoute() { return <CounsellingPage />; }
