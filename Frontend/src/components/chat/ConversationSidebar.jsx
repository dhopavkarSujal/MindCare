import {
  Plus,
  Search,
  MessageCircle,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";

import Button from "../common/Button";
import ConversationItem from "./ConversationItem";

export default function ConversationSidebar({
  conversations = [],
  selectedConversation,
  loading,
  onSelect,
  onNewConversation,
  onDelete,
  onRename,
  onTogglePin,
  mobileOpen = false,
  onClose,
  creatingConversation = false,
}) {
  const [searchTerm, setSearchTerm] =
    useState("");

  /*
   * Filter conversations by title.
   */
  const filteredConversations =
    useMemo(() => {
      const query =
        searchTerm.trim().toLowerCase();

      if (!query) {
        return conversations;
      }

      return conversations.filter(
        (conversation) =>
          conversation?.title
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      conversations,
      searchTerm,
    ]);

  /*
   * Separate pinned and recent conversations.
   */
  const pinnedConversations =
    filteredConversations.filter(
      (conversation) =>
        conversation?.isPinned === true
    );

  const recentConversations =
    filteredConversations.filter(
      (conversation) =>
        conversation?.isPinned !== true
    );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close conversations"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 md:hidden"
        />
      )}

      {/* Conversation sidebar */}
      <aside
        className={`
          fixed left-0 top-[80px] bottom-0 z-50
          flex min-h-0 w-[290px] flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300

          md:static
          md:z-auto
          md:h-auto
          md:translate-x-0

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Header */}
        <div className="border-b border-slate-100 p-4">

          {/* Mobile header */}
          <div className="mb-3 flex items-center justify-between md:hidden">

            <p className="text-sm font-semibold text-[#172033]">
              Conversations
            </p>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close conversations"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>

          </div>

          {/* New conversation */}
          <Button
            className="w-full"
            onClick={async () => {
              const newConversation =
                await onNewConversation?.();

              if (newConversation) {
                onClose?.();
              }
            }}
            disabled={
              creatingConversation
            }
          >
            <Plus size={17} />

            {creatingConversation
              ? "Creating..."
              : "New Conversation"}
          </Button>

          {/* Search */}
          <div className="relative mt-3">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-[#0F766E] focus:bg-white"
            />

          </div>
        </div>

        {/* Conversation list */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">

          <p className="mb-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Conversations
          </p>

          {loading ? (
            <div className="flex flex-col gap-2 px-2 py-3">

              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />

              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />

              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />

            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="px-3 py-10 text-center">

              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#DFF5F1]">
                <MessageCircle
                  size={19}
                  className="text-[#0F766E]"
                />
              </div>

              <p className="mt-3 text-sm font-medium text-[#172033]">
                {searchTerm.trim()
                  ? "No matching conversations"
                  : "No conversations yet"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {searchTerm.trim()
                  ? "Try another search term."
                  : "Start a new conversation with MindCare."}
              </p>

            </div>
          ) : (
            <div className="space-y-5">

              {/* =========================
                  PINNED
              ========================= */}
              {pinnedConversations.length > 0 && (
                <section>

                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Pinned
                  </p>

                  <div className="space-y-1">

                    {pinnedConversations.map(
                      (conversation) => (
                        <ConversationItem
                          key={conversation.id}
                          conversation={
                            conversation
                          }
                          active={
                            selectedConversation?.id ===
                            conversation.id
                          }
                          onClick={() => {
                            onSelect(
                              conversation
                            );
                            onClose?.();
                          }}
                          onDelete={
                            async (
                              conversationId
                            ) => {
                              const deleted =
                                await onDelete?.(
                                  conversationId
                                );

                              if (deleted) {
                                onClose?.();
                              }
                            }
                          }
                          onRename={
                            onRename
                          }
                          onTogglePin={
                            onTogglePin
                          }
                        />
                      )
                    )}

                  </div>
                </section>
              )}

              {/* =========================
                  RECENT
              ========================= */}
              {recentConversations.length > 0 && (
                <section>

                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Recent
                  </p>

                  <div className="space-y-1">

                    {recentConversations.map(
                      (conversation) => (
                        <ConversationItem
                          key={conversation.id}
                          conversation={
                            conversation
                          }
                          active={
                            selectedConversation?.id ===
                            conversation.id
                          }
                          onClick={() => {
                            onSelect(
                              conversation
                            );
                            onClose?.();
                          }}
                          onDelete={
                            async (
                              conversationId
                            ) => {
                              const deleted =
                                await onDelete?.(
                                  conversationId
                                );

                              if (deleted) {
                                onClose?.();
                              }
                            }
                          }
                          onRename={
                            onRename
                          }
                          onTogglePin={
                            onTogglePin
                          }
                        />
                      )
                    )}

                  </div>
                </section>
              )}

            </div>
          )}

        </div>
      </aside>
    </>
  );
}