"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Clock3, Leaf, LoaderCircle, MessageCircle, MoreHorizontal, Pin, Plus, Send, ShieldAlert, Trash2, UserRound, X } from "lucide-react";
import { SectionHeading } from "@/components/app/section-heading";
import { EmptyPanel, Feedback, LoadingPanel } from "@/components/app/feedback";
import { createConversation, deleteConversation, getConversations, toggleConversationPin } from "@/lib/api/services";
import type { Conversation } from "@/lib/types/api";

const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";
const timeOf = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recently";

export function ConversationListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try { setConversations(await getConversations()); setError(""); }
    catch (caught) { setError(errorText(caught)); }
    finally { setLoading(false); }
  }, []);
    useEffect(() => {
    void load();
  }, [load]);

  async function newConversation() {
    setCreating(true); setError("");
    try {
      const conversation = await createConversation();
      if (!conversation?.id) throw new Error("The server created the conversation but didn't return its ID.");
      router.push(`/chat/${encodeURIComponent(conversation.id)}`);
    } catch (caught) { setError(errorText(caught)); }
    finally { setCreating(false); }
  }

  async function remove(item: Conversation) {
    if (!window.confirm("Delete this conversation and its messages? This can't be undone.")) return;
    setError("");
    try { await deleteConversation(item.id); setConversations((current) => current.filter((row) => row.id !== item.id)); }
    catch (caught) { setError(errorText(caught)); }
  }

  async function togglePin(item: Conversation) {
    const next = !(item.isPinned ?? item.pinned ?? false);
    try { await toggleConversationPin(item.id, next); setConversations((current) => current.map((row) => row.id === item.id ? { ...row, isPinned: next } : row)); }
    catch (caught) { setError(errorText(caught)); }
  }

  const visible = conversations.filter((item) => String(item.title ?? "New conversation").toLowerCase().includes(search.toLowerCase())).sort((a, b) => Number(Boolean(b.isPinned ?? b.pinned)) - Number(Boolean(a.isPinned ?? a.pinned)) || new Date(b.updatedAt ?? b.updated_at ?? 0).getTime() - new Date(a.updatedAt ?? a.updated_at ?? 0).getTime());

  return <div className="mc-chat-list-page">
    <SectionHeading eyebrow="A PLACE TO TALK THINGS THROUGH" title="Your conversations" description="Start a new conversation or return to a space you've already opened." action={<button className="mc-button mc-button--primary" type="button" disabled={creating} onClick={newConversation}>{creating ? <span className="mc-spinner" /> : <Plus size={16} />}{creating ? "Starting…" : "New conversation"}</button>} />
    {error && <div className="mc-page-feedback"><Feedback kind="error">{error}</Feedback></div>}
    <section className="mc-card mc-conversation-library">
      <div className="mc-conversation-library__top"><div><h2>Recent conversations</h2><p>Your saved conversation history.</p></div><label className="mc-conversation-search"><MessageCircle size={15} /><input aria-label="Search conversations" placeholder="Search conversations" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
      {loading ? <LoadingPanel label="Loading conversations…" /> : visible.length ? <div className="mc-conversation-list">{visible.map((item) => <ConversationRow key={item.id} item={item} onOpen={() => router.push(`/chat/${encodeURIComponent(item.id)}`)} onRemove={() => void remove(item)} onPin={() => void togglePin(item)} />)}</div> : <EmptyPanel icon={<MessageCircle size={20} />} title={search ? "No matching conversations" : "A conversation can start here"} description={search ? "Try a different search term." : "When you open a conversation, it will appear here so you can return whenever you need."} action={!search ? <button className="mc-button mc-button--primary" onClick={newConversation} disabled={creating}><Plus size={15} /> Start a conversation</button> : undefined} />}
    </section>
    <div className="mc-chat-safety-note"><span><ShieldAlert size={16} /></span><p><strong>A gentle reminder</strong> MindCare can offer reflection and general wellbeing information, but it isn&apos;t a therapist, a diagnosis, or emergency support. In immediate danger, contact your local emergency service or someone you trust.</p></div>
  </div>;
}

function ConversationRow({ item, onOpen, onRemove, onPin }: { item: Conversation; onOpen: () => void; onRemove: () => void; onPin: () => void }) {
  const pinned = item.isPinned ?? item.pinned ?? false;
  return <article className="mc-conversation-row">
    <button type="button" className="mc-conversation-row__open" onClick={onOpen}><span className="mc-conversation-row__icon"><MessageCircle size={18} /></span><span className="mc-conversation-row__text"><strong>{item.title || "New support session"}</strong><span>A space to reflect, ask a question, or talk things through.</span></span><span className="mc-conversation-row__date"><Clock3 size={12} />{timeOf(item.updatedAt ?? item.updated_at)}</span></button>
    <div className="mc-conversation-row__actions"><button type="button" onClick={onPin} aria-label={pinned ? "Unpin conversation" : "Pin conversation"} title={pinned ? "Unpin" : "Pin"} className={pinned ? "is-pinned" : ""}><Pin size={15} /></button><button type="button" onClick={onRemove} aria-label="Delete conversation" title="Delete"><Trash2 size={15} /></button></div>
  </article>;
}

// The conversation thread lives in ./chat-thread.tsx
export { ChatThreadPage } from "./chat-thread";
