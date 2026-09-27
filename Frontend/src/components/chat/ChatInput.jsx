import {
  Send,
} from "lucide-react";

import { useState } from "react";

export default function ChatInput({
  onSend,
  disabled = false,
}) {
  const [message, setMessage] = useState("");

  const submitMessage = () => {
    const trimmed = message.trim();

    if (!trimmed || disabled) {
      return;
    }

    onSend(trimmed);
    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">

      <div className="mx-auto max-w-3xl">

        <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-[#0F766E] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#DFF5F1]/60">

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Type a message..."
            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={submitMessage}
            disabled={
              disabled ||
              !message.trim()
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F766E] text-white transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 active:scale-95"
          >
            <Send size={17} />
          </button>

        </div>

        <p className="mt-2 text-center text-[10px] text-slate-400">
          Enter to send • Shift + Enter for a new line
        </p>

      </div>

    </div>
  );
}