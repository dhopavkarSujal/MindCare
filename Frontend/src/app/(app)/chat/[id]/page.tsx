import type { Metadata } from "next";
import { ChatThreadPage } from "@/components/features/chat-thread";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatThreadPage key={id} conversationId={id} />;
}
