import type { Metadata } from "next";
import { MoodPage } from "@/components/features/mood-page";
export const metadata: Metadata = { title: "Mood check-in" };
export default function MoodRoute() { return <MoodPage />; }
