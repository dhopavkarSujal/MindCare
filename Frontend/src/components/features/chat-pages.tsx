"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Clock3, Leaf, LoaderCircle, MessageCircle, MoreHorizontal, Pin, Plus, Send, ShieldAlert, Trash2, UserRound, X } from "lucide-react";
import { SectionHeading } from "@/components/app/section-heading";
import { EmptyPanel, Feedback, LoadingPanel } from "@/components/app/feedback";
import { createConversation, deleteConversation, getConversation, getConversations, renameConversation, sendMessage, toggleConversationPin } from "@/lib/api/services";
import type { ChatMessage, Conversation } from "@/lib/types/api";

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

function normalizeMessages(raw: unknown): ChatMessage[] {
  const list = Array.isArray(raw) ? raw : [];
  return list.flatMap((message, index) => {
    if (!message || typeof message !== "object") return [];
    const item = message as Record<string, unknown>;
    const sender = String(item.sender ?? item.role ?? "").toUpperCase();
    if (sender === "SYSTEM") return [];
    const role = sender === "USER" || sender === "HUMAN" ? "user" : sender === "ASSISTANT" || sender === "AI" ? "assistant" : null;
    const content = String(item.text ?? item.content ?? item.message ?? "");
    if (!role || !content.trim()) return [];
    const sources = Array.isArray(item.sources) ? item.sources.flatMap((source) => {
      if (!source || typeof source !== "object") return [];
      const value = source as Record<string, unknown>;
      const title = String(value.title ?? value.name ?? "Source");
      const url = String(value.url ?? value.sourceUrl ?? "");
      return /^https?:\/\//i.test(url) ? [{ title, url }] : [];
    }) : [];
    return [{ id: String(item.id ?? `${role}-${index}`), role, content, createdAt: String(item.createdAt ?? item.created_at ?? "") || null, sources } as ChatMessage];
  });
}

export function ChatThreadPage({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [safetyMode, setSafetyMode] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    try {
      const result = await getConversation(conversationId);
      const conversationRaw = (result.conversation ?? result) as Record<string, unknown>;
      setConversation({ id: String(conversationRaw.id ?? conversationId), title: String(conversationRaw.title ?? "Conversation"), updatedAt: String(conversationRaw.updatedAt ?? "") });
      setTitleDraft(String(conversationRaw.title ?? "Conversation"));
      setMessages(normalizeMessages(result.messages ?? conversationRaw.messages));
    } catch (caught) { setError(errorText(caught)); }
    finally { setLoading(false); }
  }, [conversationId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    let active = true;
    void getConversations()
      .then((items) => { if (active) setConversations(items); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [conversationId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, sending, safetyMode]);
  useEffect(() => { textareaRef.current?.focus(); }, [conversationId]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const content = input.trim();
    if (!content || sending || loading) return;
    const optimistic: ChatMessage = { id: `pending-${Date.now()}`, role: "user", content, createdAt: new Date().toISOString() };
    setInput(""); setError(""); setMessages((current) => [...current, optimistic]); setSending(true);
    try {
      const response = await sendMessage({ conversationId, message: content });
      const aiMessage = response.aiMessage as Record<string, unknown> | undefined;
      if (!aiMessage) throw new Error("The server reply didn't include an AI message. Please try again.");
      const normalized = normalizeMessages([{ ...aiMessage, role: "assistant", sender: aiMessage.sender ?? "ASSISTANT" }])[0];
      if (!normalized) throw new Error("The server returned an empty AI response. Please try again.");

      // Replace the optimistic bubble with the persisted row returned by Express.
      const savedUserMessage = response.userMessage as Record<string, unknown> | undefined;
      const normalizedUser = savedUserMessage
        ? normalizeMessages([{ ...savedUserMessage, role: "user", sender: savedUserMessage.sender ?? "USER" }])[0]
        : undefined;
      setMessages((current) => [
        ...current.filter((item) => item.id !== optimistic.id),
        normalizedUser ?? optimistic,
        normalized,
      ]);
      // Refresh the sidebar once per completed turn, not on each optimistic/message state change.
      void getConversations().then(setConversations).catch(() => undefined);
      const analysis = response.analysis as { isCrisis?: boolean } | null | undefined;
      // The Express API reports risk via `action` ("crisis"), `riskLevel` ("high") and analysis.isCrisis.
      setSafetyMode(
        response.action === "crisis" ||
          String(response.riskLevel ?? "").toLowerCase() === "high" ||
          Boolean(analysis?.isCrisis),
      );
    } catch (caught) {
      // Remove the optimistic bubble and restore the draft when the request fails.
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
      setInput((current) => current || content);
      setError(errorText(caught));
    } finally { setSending(false); textareaRef.current?.focus(); }
  }

  async function startNewConversation() {
    setCreatingConversation(true); setError("");
    try {
      const created = await createConversation();
      if (!created?.id) throw new Error("The server didn't return a conversation ID.");
      router.push(`/chat/${encodeURIComponent(created.id)}`);
    } catch (caught) { setError(errorText(caught)); }
    finally { setCreatingConversation(false); }
  }

  async function saveTitle() {
    const title = titleDraft.trim(); if (!title || !conversation || title === conversation.title) { setRenaming(false); return; }
    try { await renameConversation(conversationId, title); setConversation({ ...conversation, title }); setRenaming(false); }
    catch (caught) { setError(errorText(caught)); }
  }

  function onComposerKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(); }
  }

  return <div className="mc-chat-thread-page">
    <div className="mc-chat-thread-top"><Link href="/chat" className="mc-chat-back"><ArrowLeft size={15} /> All conversations</Link><div className="mc-chat-thread-title">{renaming ? <><input className="mc-input" value={titleDraft} maxLength={100} onChange={(event) => setTitleDraft(event.target.value)} aria-label="Conversation title" /><button className="mc-icon-button" type="button" onClick={saveTitle} aria-label="Save title"><Check size={15} /></button><button className="mc-icon-button" type="button" onClick={() => { setTitleDraft(conversation?.title ?? ""); setRenaming(false); }} aria-label="Cancel rename"><X size={15} /></button></> : <><h1>{conversation?.title ?? "Your conversation"}</h1><button className="mc-icon-button" type="button" onClick={() => setRenaming(true)} aria-label="Rename conversation"><MoreHorizontal size={17} /></button></>}</div><span className="mc-chat-private"><ShieldAlert size={13} /> A supportive space, not emergency care</span></div>
    <div className="mc-chat-thread-layout">
      <aside className="mc-chat-inline-sidebar" aria-label="Conversation history"><div className="mc-chat-inline-sidebar__head"><div><strong>Your conversations</strong><span>{conversations.length} saved</span></div><button className="mc-icon-button" type="button" onClick={startNewConversation} disabled={creatingConversation} aria-label="Start a new conversation"><Plus size={15} /></button></div><div className="mc-chat-inline-sidebar__list">{conversations.length ? conversations.map((item) => <Link key={item.id} href={`/chat/${encodeURIComponent(item.id)}`} className={`mc-chat-inline-item${item.id === conversationId ? " is-active" : ""}`}><span><MessageCircle size={14} /></span><span><strong>{item.title || "New support session"}</strong><small>{timeOf(item.updatedAt ?? item.updated_at)}</small></span></Link>) : <p className="mc-chat-inline-sidebar__empty">Your saved conversations will appear here.</p>}</div><Link className="mc-chat-inline-sidebar__all" href="/chat">View all conversations <ArrowRight size={13} /></Link></aside>
      <section className="mc-chat-thread-main">
    {safetyMode && <div className="mc-chat-safety-banner" role="alert"><ShieldAlert size={20} /><div><strong>Please take care of your immediate safety.</strong><p>If you may be in immediate danger, contact local emergency services or a trusted person who can stay with you. MindCare isn&apos;t an emergency service.</p></div></div>}
    <div className="mc-chat-thread-body">
      {loading ? <LoadingPanel label="Opening your conversation…" /> : error && !messages.length ? <EmptyPanel icon={<MessageCircle size={20} />} title="Couldn't open this conversation" description={error} action={<button className="mc-button mc-button--secondary" type="button" onClick={() => void load()}>Try again</button>} /> : messages.length ? <div className="mc-message-list">
        {messages.map((message) => <Message key={message.id} message={message} />)}
        {sending && <div className="mc-message mc-message--assistant"><span className="mc-message__avatar"><Leaf size={16} /></span><div className="mc-message__body"><div className="mc-message__typing"><i /><i /><i /></div><small>MindCare is thinking…</small></div></div>}
        <div ref={bottomRef} />
      </div> : <div className="mc-chat-welcome"><span className="mc-chat-welcome__mark"><Leaf size={22} /></span><span className="mc-eyebrow">YOU CAN START ANYWHERE</span><h2>What&apos;s on your mind?</h2><p>This is a place to reflect, explore a feeling, or ask for general wellbeing information. Share only what you&apos;re comfortable sharing.</p><div className="mc-chat-suggestions">{["I'm feeling overwhelmed", "Help me reflect on my day", "I need a small reset"].map((suggestion) => <button key={suggestion} onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }} type="button">{suggestion}<ArrowUpRight size={14} /></button>)}</div></div>}
    </div>
    {error && messages.length > 0 && <div className="mc-chat-inline-error"><Feedback kind="error">{error}</Feedback><button className="mc-button mc-button--secondary" type="button" onClick={() => void load()}>Refresh</button></div>}
    <form className="mc-chat-composer" onSubmit={submit}>
      <textarea ref={textareaRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onComposerKey} placeholder="Write what's on your mind…" aria-label="Your message" rows={2} maxLength={4000} disabled={loading || sending} />
      <div className="mc-chat-composer__bottom"><span><ShieldAlert size={12} /> Share only what you feel comfortable sharing. Enter to send · Shift+Enter for a new line.</span><button className="mc-button mc-button--primary" type="submit" disabled={!input.trim() || sending || loading}>{sending ? <LoaderCircle size={15} className="mc-spin-icon" /> : <Send size={15} />}{sending ? "Sending…" : "Send"}</button></div>
    </form>
    <p className="mc-chat-legal">MindCare can help with reflection and general information, but it does not diagnose conditions or replace professional care. <Link href="/resources">Explore support resources</Link>.</p>
      </section>
    </div>
  </div>;
}

function Message({ message }: { message: ChatMessage }) {
  const assistant = message.role === "assistant";
  return <article className={`mc-message${assistant ? " mc-message--assistant" : " mc-message--user"}`}>
    <span className="mc-message__avatar">{assistant ? <Leaf size={16} /> : <UserRound size={15} />}</span>
    <div className="mc-message__body"><div className="mc-message__content">{message.content.split("\n").map((line, index) => <p key={`${message.id}-${index}`}>{line || " "}</p>)}</div>
      {message.sources?.length ? <div className="mc-message-sources"><span><BookOpen size={13} /> Helpful sources</span>{message.sources.map((source) => <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={12} /></a>)}</div> : null}
      {message.createdAt && <small className="mc-message__time">{new Date(message.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</small>}
    </div>
  </article>;
}
