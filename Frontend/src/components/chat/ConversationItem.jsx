import {
  MessageCircle,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

export default function ConversationItem({
  conversation,
  active,
  onClick,
  onDelete,
}) {
  return (
    <div
      className={`
        group relative flex items-center rounded-xl
        transition-all duration-200
        ${
          active
            ? "bg-[#DFF5F1] text-[#0F766E]"
            : "text-slate-600 hover:bg-slate-50"
        }
      `}
    >
      <button
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
      >
        <MessageCircle
          size={17}
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">

          <p className="truncate text-sm font-medium">
            {conversation.title}
          </p>

          {conversation.updatedAt && (
            <p className="mt-0.5 text-[10px] text-slate-400">
              {conversation.updatedAt}
            </p>
          )}

        </div>

      </button>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onDelete?.(conversation.id);
        }}
        className="mr-2 hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-red-500 group-hover:block"
        title="Delete conversation"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}