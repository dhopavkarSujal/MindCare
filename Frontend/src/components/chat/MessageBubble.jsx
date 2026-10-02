import {
  Sparkles,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageBubble({
  message,
  onSuggestionClick,
}) {
  const isUser =
    message.role === "user";

  const suggestions =
    Array.isArray(message.suggestions)
      ? message.suggestions
      : [];

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      {/* MindCare avatar */}
      {!isUser && (
        <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DFF5F1]">
          <Sparkles
            size={16}
            className="text-[#0F766E]"
          />
        </div>
      )}

      <div className="min-w-0 max-w-[90%] sm:max-w-[78%]">
        {/* Assistant name */}
        {!isUser && (
          <p className="mb-1.5 text-[11px] font-semibold text-slate-500">
            MindCare
          </p>
        )}

        {/* Message bubble */}
        <div
          className={`
            rounded-2xl px-4 py-3.5
            text-sm
            ${
              isUser
                ? "rounded-br-md bg-[#0F766E] text-white shadow-sm"
                : "rounded-bl-md border border-slate-100 bg-white text-[#172033] shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
            }
          `}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-6">
              {message.content}
            </p>
          ) : (
            <div className="break-words text-[15px] leading-7">
              <ReactMarkdown
                remarkPlugins={[
                  remarkGfm,
                ]}
                components={{
                  p: ({
                    children,
                  }) => (
                    <p className="mb-4 whitespace-pre-wrap leading-7 last:mb-0">
                      {children}
                    </p>
                  ),

                  h1: ({
                    children,
                  }) => (
                    <h1 className="mb-3 mt-1 text-lg font-semibold leading-7 text-[#172033]">
                      {children}
                    </h1>
                  ),

                  h2: ({
                    children,
                  }) => (
                    <h2 className="mb-3 mt-1 text-base font-semibold leading-7 text-[#172033]">
                      {children}
                    </h2>
                  ),

                  h3: ({
                    children,
                  }) => (
                    <h3 className="mb-2 mt-1 text-sm font-semibold leading-7 text-[#172033]">
                      {children}
                    </h3>
                  ),

                  ul: ({
                    children,
                  }) => (
                    <ul className="mb-4 ml-5 list-disc space-y-2">
                      {children}
                    </ul>
                  ),

                  ol: ({
                    children,
                  }) => (
                    <ol className="mb-4 ml-5 list-decimal space-y-2">
                      {children}
                    </ol>
                  ),

                  li: ({
                    children,
                  }) => (
                    <li className="pl-1 leading-7">
                      {children}
                    </li>
                  ),

                  strong: ({
                    children,
                  }) => (
                    <strong className="font-semibold text-[#172033]">
                      {children}
                    </strong>
                  ),

                  em: ({
                    children,
                  }) => (
                    <em className="text-slate-700">
                      {children}
                    </em>
                  ),

                  blockquote: ({
                    children,
                  }) => (
                    <blockquote className="my-4 border-l-4 border-[#0F766E] pl-4 leading-7 text-slate-600">
                      {children}
                    </blockquote>
                  ),

                  hr: () => (
                    <hr className="my-4 border-slate-200" />
                  ),

                  code: ({
                    inline,
                    children,
                  }) => (
                    <code
                      className={
                        inline
                          ? "rounded bg-slate-100 px-1.5 py-0.5 text-[13px] text-slate-700"
                          : "block overflow-x-auto rounded-xl bg-slate-100 p-3 text-[13px] leading-6 text-slate-700"
                      }
                    >
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* AI Suggestions */}
        {!isUser &&
          suggestions.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-[11px] font-medium text-slate-400">
                Suggested next steps
              </p>

              <div className="flex flex-wrap gap-2">
                {suggestions.map(
                  (suggestion, index) => (
                    <button
                      key={`${suggestion}-${index}`}
                      type="button"
                      onClick={() =>
                        onSuggestionClick?.(
                          suggestion
                        )
                      }
                      className="rounded-xl border border-[#BFE8E2] bg-white px-3 py-2 text-left text-xs font-medium text-[#0F766E] shadow-sm transition hover:border-[#0F766E] hover:bg-[#F0FDFA] hover:shadow-md active:scale-[0.98]"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}