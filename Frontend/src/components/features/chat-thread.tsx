"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  History,
  Leaf,
  LoaderCircle,
  MessageCircle,
  Pencil,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { EmptyPanel, Feedback, LoadingPanel } from "@/components/app/feedback";
import {
  createConversation,
  getConversation,
  getConversations,
  renameConversation,
  sendMessage,
} from "@/lib/api/services";
import type { ChatMessage, Conversation } from "@/lib/types/api";
import "./chat-thread.css";

type UiMessage = ChatMessage & { status?: "sending" | "failed" };

const MAX_LENGTH = 4000;
const NEAR_BOTTOM_PX = 120;
const SHOW_JUMP_PX = 280;

const STARTERS = [
  "I'm feeling overwhelmed",
  "Help me reflect on my day",
  "I need a small reset",
  "I'm struggling to sleep",
];

/* ---------- helpers ---------- */

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

const timeOf = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "Recently";

const clockOf = (value?: string | null) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";

function normalizeMessages(raw: unknown): ChatMessage[] {
  const list = Array.isArray(raw) ? raw : [];
  return list.flatMap((message, index) => {
    if (!message || typeof message !== "object") return [];
    const item = message as Record<string, unknown>;
    const sender = String(item.sender ?? item.role ?? "").toUpperCase();
    if (sender === "SYSTEM") return [];
    const role =
      sender === "USER" || sender === "HUMAN"
        ? "user"
        : sender === "ASSISTANT" || sender === "AI"
          ? "assistant"
          : null;
    const content = String(item.text ?? item.content ?? item.message ?? "");
    if (!role || !content.trim()) return [];
    const sources = Array.isArray(item.sources)
      ? item.sources.flatMap((source) => {
          if (!source || typeof source !== "object") return [];
          const value = source as Record<string, unknown>;
          const title = String(value.title ?? value.name ?? "Source");
          const url = String(value.url ?? value.sourceUrl ?? "");
          return /^https?:\/\//i.test(url) ? [{ title, url }] : [];
        })
      : [];
    return [
      {
        id: String(item.id ?? `${role}-${index}`),
        role,
        content,
        createdAt: String(item.createdAt ?? item.created_at ?? "") || null,
        sources,
      },
    ];
  });
}

/* ---------- safe, tiny markdown renderer (React escapes all text) ---------- */

type Block = { kind: "p"; lines: string[] } | { kind: "ul" | "ol"; items: string[] };

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let startNewParagraph = true;
  for (const raw of content.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      startNewParagraph = true;
      continue;
    }
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const ordered = /^\s*\d{1,3}[.)]\s+(.*)$/.exec(line);
    if (bullet || ordered) {
      const kind: "ul" | "ol" = bullet ? "ul" : "ol";
      const text = (bullet ?? ordered)?.[1] ?? "";
      const last = blocks[blocks.length - 1];
      if (last && (last.kind === "ul" || last.kind === "ol") && last.kind === kind) {
        last.items.push(text);
      } else {
        blocks.push({ kind, items: [text] });
      }
      startNewParagraph = true;
      continue;
    }
    const last = blocks[blocks.length - 1];
    if (last && last.kind === "p" && !startNewParagraph) {
      last.lines.push(line);
    } else {
      blocks.push({ kind: "p", lines: [line] });
    }
    startNewParagraph = false;
  }
  return blocks;
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const pattern = /\*\*([^*\n]+)\*\*|`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let index = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const key = `${keyBase}-${index++}`;
    if (match[1] !== undefined) nodes.push(<strong key={key}>{match[1]}</strong>);
    else if (match[2] !== undefined) nodes.push(<code key={key}>{match[2]}</code>);
    else
      nodes.push(
        <a key={key} href={match[4]} target="_blank" rel="noreferrer">
          {match[3]}
        </a>,
      );
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function AssistantContent({ id, content }: { id: string; content: string }) {
  const blocks = parseBlocks(content);
  return (
    <div className="mct-ai-body">
      {blocks.map((block, blockIndex) => {
        const key = `${id}-${blockIndex}`;
        if (block.kind === "p") {
          return (
            <p key={key}>
              {block.lines.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  {renderInline(line, `${key}-${lineIndex}`)}
                </Fragment>
              ))}
            </p>
          );
        }
        const ListTag = block.kind;
        return (
          <ListTag key={key}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item, `${key}-${itemIndex}`)}</li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}

/* ---------- message rows ---------- */

function MessageRow({
  message,
  copied,
  onCopy,
  onRetry,
  onEdit,
}: {
  message: UiMessage;
  copied: boolean;
  onCopy: () => void;
  onRetry: () => void;
  onEdit: () => void;
}) {
  if (message.role === "user") {
    const failed = message.status === "failed";
    return (
      <div className="mct-row mct-row--user">
        <div className={`mct-user-bubble${failed ? " is-failed" : ""}`}>{message.content}</div>
        {failed && (
          <div className="mct-failed" role="alert">
            <span>Not delivered.</span>
            <button type="button" onClick={onRetry}>
              <RotateCcw size={13} aria-hidden="true" /> Retry
            </button>
            <button type="button" onClick={onEdit}>
              <Pencil size={13} aria-hidden="true" /> Edit
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mct-row mct-row--ai">
      <span className="mct-ai-mark" aria-hidden="true">
        <Leaf size={16} />
      </span>
      <div className="mct-ai-main">
        <AssistantContent id={message.id} content={message.content} />
        {message.sources?.length ? (
          <div className="mct-sources">
            <span>Helpful sources</span>
            {message.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                {source.title}
              </a>
            ))}
          </div>
        ) : null}
        <div className="mct-actions">
          <button type="button" className="mct-action" onClick={onCopy}>
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {message.createdAt && (
            <time className="mct-time" dateTime={message.createdAt}>
              {clockOf(message.createdAt)}
            </time>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingRow() {
  return (
    <div className="mct-row mct-row--ai" role="status" aria-live="polite">
      <span className="mct-ai-mark" aria-hidden="true">
        <Leaf size={16} />
      </span>
      <div className="mct-typing" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <span className="mct-sr">MindCare is thinking</span>
    </div>
  );
}

function Welcome({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mct-welcome">
      <span className="mct-welcome__mark" aria-hidden="true">
        <Sparkles size={20} />
      </span>
      <h2>What&apos;s on your mind today?</h2>
      <p>
        A calm place to reflect, make sense of a feeling, or find general wellbeing information.
        Share only what you&apos;re comfortable sharing.
      </p>
      <div className="mct-starters">
        {STARTERS.map((text) => (
          <button key={text} type="button" onClick={() => onPick(text)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export function ChatThreadPage({ conversationId }: { conversationId: string }) {
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [safetyMode, setSafetyMode] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [showJump, setShowJump] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);

  const loadThread = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getConversation(conversationId);
      const raw = (result.conversation ?? result) as Record<string, unknown>;
      const title = String(raw.title ?? "Conversation");
      setConversation({
        id: String(raw.id ?? conversationId),
        title,
        updatedAt: String(raw.updatedAt ?? ""),
      });
      setTitleDraft(title);
      setMessages(normalizeMessages(result.messages ?? raw.messages));
      setError("");
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const loadHistory = useCallback(() => {
    getConversations()
      .then(setHistory)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void loadThread();
    loadHistory();
  }, [loadThread, loadHistory]);

  // Focus the composer on desktop only, so phones don't pop the keyboard on open.
  useEffect(() => {
    if (window.matchMedia("(min-width: 800px)").matches) textareaRef.current?.focus();
  }, []);

  // Grow the composer with its text, up to a sensible maximum.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  // Follow new messages only while the reader is already near the bottom.
  useEffect(() => {
    if (!stickToBottom.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distance < NEAR_BOTTOM_PX;
    setShowJump(distance > SHOW_JUMP_PX);
  }

  function scrollToLatest() {
    const el = scrollRef.current;
    stickToBottom.current = true;
    setShowJump(false);
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  async function send(rawText: string, retryId?: string) {
    const text = rawText.trim();
    if (!text || sending || loading) return;

    const tempId = retryId ?? `pending-${Date.now()}`;
    stickToBottom.current = true;
    setError("");
    setSending(true);

    if (retryId) {
      setMessages((current) =>
        current.map((item) => (item.id === retryId ? { ...item, status: "sending" } : item)),
      );
    } else {
      setInput("");
      setMessages((current) => [
        ...current,
        { id: tempId, role: "user", content: text, createdAt: new Date().toISOString(), status: "sending" },
      ]);
    }

    try {
      const response = await sendMessage({ conversationId, message: text });

      const aiRaw = response.aiMessage as Record<string, unknown> | undefined;
      const aiMessage = aiRaw
        ? normalizeMessages([{ ...aiRaw, role: "assistant", sender: aiRaw.sender ?? "ASSISTANT" }])[0]
        : undefined;
      if (!aiMessage) throw new Error("The reply didn't come through. Please try again.");

      const userRaw = response.userMessage as Record<string, unknown> | undefined;
      const savedUser = userRaw
        ? normalizeMessages([{ ...userRaw, role: "user", sender: userRaw.sender ?? "USER" }])[0]
        : undefined;

      // Swap the temporary bubble for the saved row in place, then append the reply.
      setMessages((current) => [
        ...current.map((item) =>
          item.id === tempId ? { ...(savedUser ?? item), status: undefined } : item,
        ),
        aiMessage,
      ]);

      const analysis = response.analysis as { isCrisis?: boolean } | null | undefined;
      const flagged =
        response.action === "crisis" ||
        String(response.riskLevel ?? "").toLowerCase() === "high" ||
        Boolean(analysis?.isCrisis);
      if (flagged) setSafetyMode(true);

      loadHistory();
    } catch (caught) {
      setMessages((current) =>
        current.map((item) => (item.id === tempId ? { ...item, status: "failed" } : item)),
      );
      setError(errorText(caught));
    } finally {
      setSending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  function onComposerKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(input);
    }
  }

  function editFailed(message: UiMessage) {
    setMessages((current) => current.filter((item) => item.id !== message.id));
    setInput(message.content);
    textareaRef.current?.focus();
  }

  async function copyMessage(message: UiMessage) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId((current) => (current === message.id ? null : current)), 1600);
    } catch {
      setError("Couldn't copy this message. You can select the text and copy it instead.");
    }
  }

  async function startNewChat() {
    if (creating) return;
    setCreating(true);
    setError("");
    setHistoryOpen(false);
    try {
      const created = await createConversation();
      if (!created?.id) throw new Error("The server didn't return a conversation ID.");
      router.push(`/chat/${encodeURIComponent(created.id)}`);
    } catch (caught) {
      setError(errorText(caught));
      setCreating(false);
    }
  }

  function cancelTitle() {
    setTitleDraft(conversation?.title ?? "");
    setEditingTitle(false);
  }

  async function saveTitle() {
    const title = titleDraft.trim();
    setEditingTitle(false);
    if (!conversation || !title || title === conversation.title) {
      setTitleDraft(conversation?.title ?? "");
      return;
    }
    try {
      await renameConversation(conversationId, title);
      setConversation({ ...conversation, title });
      loadHistory();
    } catch (caught) {
      setError(errorText(caught));
      setTitleDraft(conversation.title ?? "");
    }
  }

  const title = conversation?.title || "New conversation";
  const isEmpty = !loading && !error && messages.length === 0;

  return (
    <div className="mct-root">
      <header className="mct-topbar">
        <div className="mct-title">
          {editingTitle ? (
            <>
              <input
                className="mct-title-input"
                value={titleDraft}
                maxLength={100}
                autoFocus
                aria-label="Conversation title"
                onChange={(event) => setTitleDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void saveTitle();
                  if (event.key === "Escape") cancelTitle();
                }}
              />
              <button type="button" className="mct-iconbtn" onClick={() => void saveTitle()} aria-label="Save title">
                <Check size={16} />
              </button>
              <button type="button" className="mct-iconbtn" onClick={cancelTitle} aria-label="Cancel renaming">
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <h1>{title}</h1>
              <button
                type="button"
                className="mct-iconbtn"
                onClick={() => setEditingTitle(true)}
                aria-label="Rename conversation"
              >
                <Pencil size={15} />
              </button>
            </>
          )}
        </div>

        <div className="mct-top-actions">
          <div className="mct-history-wrap">
            <button
              type="button"
              className="mct-iconbtn"
              aria-label="Show your conversations"
              aria-expanded={historyOpen}
              aria-controls="mct-history"
              onClick={() => setHistoryOpen((open) => !open)}
            >
              <History size={17} />
            </button>
            {historyOpen && (
              <div id="mct-history" className="mct-history" role="region" aria-label="Your conversations">
                <div className="mct-history__head">
                  <strong>Your conversations</strong>
                  <button type="button" className="mct-iconbtn" onClick={() => setHistoryOpen(false)} aria-label="Close">
                    <X size={15} />
                  </button>
                </div>
                <div className="mct-history__list">
                  {history.length ? (
                    history.map((item) => (
                      <Link
                        key={item.id}
                        href={`/chat/${encodeURIComponent(item.id)}`}
                        className={`mct-history-item${item.id === conversationId ? " is-active" : ""}`}
                        onClick={() => setHistoryOpen(false)}
                      >
                        <MessageCircle size={14} aria-hidden="true" />
                        <span>
                          <strong>{item.title || "New conversation"}</strong>
                          <small>{timeOf(item.updatedAt ?? item.updated_at)}</small>
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="mct-muted-note">Your conversations will appear here.</p>
                  )}
                </div>
                <Link href="/chat" className="mct-history__all" onClick={() => setHistoryOpen(false)}>
                  View all conversations
                </Link>
              </div>
            )}
          </div>
          <button type="button" className="mct-newchat" onClick={() => void startNewChat()} disabled={creating}>
            {creating ? <LoaderCircle size={15} className="mct-spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
            {creating ? "Starting…" : "New chat"}
          </button>
        </div>
      </header>

      {safetyMode && (
        <div className="mct-crisis" role="alert">
          <ShieldAlert size={18} aria-hidden="true" />
          <div>
            <strong>Your safety comes first.</strong>
            <p>
              If you might be in immediate danger, contact local emergency services or someone you trust
              who can stay with you now. In India, call 112, or Tele-MANAS on 14416 (free, 24 hours).
              MindCare is not an emergency service.
            </p>
          </div>
        </div>
      )}

      <div className="mct-scroll" ref={scrollRef} onScroll={handleScroll}>
        <div className="mct-column">
          {loading && <LoadingPanel label="Opening your conversation…" />}
          {!loading && error && messages.length === 0 && (
            <EmptyPanel
              icon={<MessageCircle size={20} />}
              title="Couldn't open this conversation"
              description={error}
              action={
                <button className="mc-button mc-button--secondary" type="button" onClick={() => void loadThread()}>
                  Try again
                </button>
              }
            />
          )}
          {isEmpty && <Welcome onPick={(text) => { setInput(text); textareaRef.current?.focus(); }} />}
          {messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              copied={copiedId === message.id}
              onCopy={() => void copyMessage(message)}
              onRetry={() => void send(message.content, message.id)}
              onEdit={() => editFailed(message)}
            />
          ))}
          {sending && <TypingRow />}
          <div ref={endRef} />
        </div>
      </div>

      <div className="mct-dock">
        {showJump && (
          <button type="button" className="mct-jump" onClick={scrollToLatest}>
            <ArrowDown size={14} aria-hidden="true" /> Latest
          </button>
        )}
        {error && messages.length > 0 && (
          <div className="mct-column mct-dock__error">
            <Feedback kind="error">{error}</Feedback>
          </div>
        )}
        <form className="mct-composer" onSubmit={onSubmit}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onComposerKey}
            placeholder="Message MindCare…"
            aria-label="Your message"
            maxLength={MAX_LENGTH}
            disabled={loading}
          />
          <button
            type="submit"
            className="mct-send"
            disabled={!input.trim() || sending || loading}
            aria-label={sending ? "Sending message" : "Send message"}
          >
            {sending ? <LoaderCircle size={16} className="mct-spin" aria-hidden="true" /> : <ArrowUp size={18} aria-hidden="true" />}
          </button>
        </form>
        <div className="mct-foot">
          <span>Enter to send · Shift + Enter for a new line</span>
          {input.length > MAX_LENGTH - 400 && (
            <span className="mct-count">
              {input.length} / {MAX_LENGTH}
            </span>
          )}
          <span>
            MindCare isn&apos;t a therapist or emergency service. <Link href="/resources">Support resources</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
