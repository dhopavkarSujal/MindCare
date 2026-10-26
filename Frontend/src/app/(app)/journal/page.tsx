import type { Metadata } from "next";
import { JournalPage } from "@/components/features/journal-page";
export const metadata: Metadata = { title: "Private journal" };
export default function JournalRoute() { return <JournalPage />; }
