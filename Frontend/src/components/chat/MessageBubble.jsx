import { Sparkles } from "lucide-react";

export default function MessageBubble({
  message,
}) {
  const isUser =
    message.role === "user";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >

      {!isUser && (
        <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DFF5F1]">
          <Sparkles
            size={16}
            className="text-[#0F766E]"
          />
        </div>
      )}

      <div className="max-w-[80%] sm:max-w-[70%]">

        {!isUser && (
          <p className="mb-1.5 text-[11px] font-semibold text-slate-500">
            MindCare
          </p>
        )}

        <div
          className={`
            rounded-2xl px-4 py-3
            text-sm leading-7
            ${
              isUser
                ? "rounded-br-md bg-[#0F766E] text-white shadow-sm"
                : "rounded-bl-md border border-slate-100 bg-white text-[#172033] shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
            }
          `}
        >
          {message.content}
        </div>

      </div>

    </div>
  );
}