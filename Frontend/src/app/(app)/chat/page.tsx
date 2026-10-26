import type { Metadata } from "next";
import { ConversationListPage } from "@/components/features/chat-pages";
export const metadata: Metadata = { title: "AI companion" };
export default function ChatRoute() { return <ConversationListPage />; }
