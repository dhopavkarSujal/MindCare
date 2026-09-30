import {
  MessageCircle,
  MoreHorizontal,
  Pin,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";

import { useState } from "react";

export default function ConversationItem({
  conversation,
  active,
  onClick,
  onDelete,
  onRename,
  onTogglePin,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(
    conversation.title || "New Support Session"
  );

  const currentTitle =
    conversation.title || "New Support Session";

  const handleStartRename = () => {
    setMenuOpen(false);
    setRenameValue(currentTitle);
    setRenaming(true);
  };

  const handleCancelRename = () => {
    setRenameValue(currentTitle);
    setRenaming(false);
  };

  const handleSaveRename = async () => {
    const trimmedTitle = renameValue.trim();

    if (!trimmedTitle) {
      return;
    }

    if (trimmedTitle === currentTitle) {
      setRenaming(false);
      return;
    }

    const success = await onRename?.(
      conversation.id,
      trimmedTitle
    );

    if (success !== false) {
      setRenaming(false);
    }
  };

  const handleRenameKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveRename();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleCancelRename();
    }
  };

  const handleTogglePin = () => {
    setMenuOpen(false);

    onTogglePin?.(
      conversation.id,
      !conversation.isPinned
    );
  };

  const handleDelete = () => {
    setMenuOpen(false);

    onDelete?.(conversation.id);
  };

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
      {/* Conversation content */}
      <div className="min-w-0 flex-1">
        {renaming ? (
          <div className="flex items-center gap-2 px-3 py-2.5">
            <input
              type="text"
              value={renameValue}
              onChange={(event) =>
                setRenameValue(event.target.value)
              }
              onKeyDown={handleRenameKeyDown}
              autoFocus
              maxLength={100}
              className="
                min-w-0 flex-1 rounded-lg
                border border-slate-300
                bg-white px-2.5 py-1.5
                text-sm text-slate-700
                outline-none
                focus:border-[#0F766E]
                focus:ring-2
                focus:ring-[#DFF5F1]
              "
            />

            <button
              type="button"
              onClick={handleSaveRename}
              className="
                rounded-lg p-1.5
                text-emerald-600
                transition
                hover:bg-emerald-50
              "
              title="Save"
            >
              <Check size={15} />
            </button>

            <button
              type="button"
              onClick={handleCancelRename}
              className="
                rounded-lg p-1.5
                text-slate-400
                transition
                hover:bg-slate-100
              "
              title="Cancel"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onClick?.();
            }}
            className="
              flex w-full min-w-0
              items-center gap-3
              px-3 py-3
              text-left
            "
          >
            <MessageCircle
              size={17}
              className="shrink-0"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium">
                  {currentTitle}
                </p>

                {conversation.isPinned && (
                  <Pin
                    size={12}
                    className="shrink-0"
                  />
                )}
              </div>

              {conversation.updatedAt && (
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {conversation.updatedAt}
                </p>
              )}
            </div>
          </button>
        )}
      </div>

      {/* More menu */}
      {!renaming && (
        <div className="relative mr-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((previous) => !previous);
            }}
            className="
              rounded-lg p-1.5
              text-slate-400
              transition
              hover:bg-white
              hover:text-slate-700
            "
            title="Conversation options"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div
              className="
                absolute right-0 top-9 z-50
                w-40
                rounded-xl
                border border-slate-200
                bg-white
                p-1.5
                shadow-lg
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                onClick={handleStartRename}
                className="
                  flex w-full items-center gap-2
                  rounded-lg px-3 py-2
                  text-left text-sm
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                <Pencil size={14} />
                <span>Rename</span>
              </button>

              <button
                type="button"
                onClick={handleTogglePin}
                className="
                  flex w-full items-center gap-2
                  rounded-lg px-3 py-2
                  text-left text-sm
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                <Pin size={14} />
                <span>
                  {conversation.isPinned
                    ? "Unpin"
                    : "Pin"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="
                  flex w-full items-center gap-2
                  rounded-lg px-3 py-2
                  text-left text-sm
                  text-red-600
                  transition
                  hover:bg-red-50
                "
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}