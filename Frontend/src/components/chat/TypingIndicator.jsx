import { Sparkles } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DFF5F1]">
        <Sparkles
          size={16}
          className="text-[#0F766E]"
        />
      </div>

      <div>

        <p className="mb-1.5 text-[11px] font-semibold text-slate-500">
          MindCare
        </p>

        <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm">

          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />

        </div>

      </div>

    </div>
  );
}