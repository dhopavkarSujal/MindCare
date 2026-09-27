import { Sparkles } from "lucide-react";

export default function EmptyState({
  title,
  description,
  action,
}) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center">

      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DFF5F1]">
        <Sparkles
          size={24}
          className="text-[#0F766E]"
        />
      </div>

      <h2 className="text-lg font-semibold text-[#172033]">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#64748B]">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}

    </div>
  );
}