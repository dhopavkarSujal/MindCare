import {
  Menu,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export default function ChatWindow({
  conversation,
  messages,
  loadingMessages,
  isTyping,
  onSend,
  onOpenSidebar,
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6">

        <div className="flex min-w-0 items-center gap-3">

          {/* Mobile menu */}
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open conversations"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 md:hidden"
          >
            <Menu size={20} />
          </button>

          {/* MindCare icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DFF5F1]">
            <Sparkles
              size={18}
              className="text-[#0F766E]"
            />
          </div>

          {/* Conversation title */}
          <div className="min-w-0">

            <h1 className="truncate text-sm font-semibold text-[#172033] sm:text-base">
              {conversation?.title ||
                "New Conversation"}
            </h1>

            <p className="truncate text-[11px] text-slate-400">
              Private conversation with MindCare
            </p>

          </div>
        </div>

        {/* More */}
        <button
          type="button"
          aria-label="More options"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
        >
          <MoreHorizontal size={19} />
        </button>

      </header>

      {/* Messages */}
      {loadingMessages ? (
        <div className="flex flex-1 items-center justify-center bg-[#F8FAFC]">

          <div className="text-center">

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#DFF5F1]">
              <Sparkles
                size={18}
                className="animate-pulse text-[#0F766E]"
              />
            </div>

            <p className="mt-3 text-sm text-slate-400">
              Loading conversation...
            </p>

          </div>
        </div>
      ) : (
        <MessageList
          messages={messages}
          isTyping={isTyping}
        />
      )}

      {/* Input */}
      <ChatInput
        onSend={onSend}
        disabled={isTyping}
        hasConversation={
          !!conversation
        }
      />

    </section>
  );
}