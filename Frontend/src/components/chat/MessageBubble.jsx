import {
  Sparkles,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      {/* MindCare avatar */}
      {!isUser && (
        <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DFF5F1]">
          <Sparkles
            size={16}
            className="text-[#0F766E]"
          />
        </div>
      )}

      <div className="max-w-[85%] sm:max-w-[75%]">

        {/* Assistant name */}
        {!isUser && (
          <p className="mb-1.5 text-[11px] font-semibold text-slate-500">
            MindCare
          </p>
        )}

        {/* Message bubble */}
        <div
          className={`
            rounded-2xl px-4 py-3
            text-sm
            leading-6
            ${
              isUser
                ? "rounded-br-md bg-[#0F766E] text-white shadow-sm"
                : "rounded-bl-md border border-slate-100 bg-white text-[#172033] shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
            }
          `}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="space-y-3">

              <ReactMarkdown
                remarkPlugins={[
                  remarkGfm,
                ]}
                components={{
                  p: ({
                    children,
                  }) => (
                    <p className="leading-6">
                      {children}
                    </p>
                  ),

                  h1: ({
                    children,
                  }) => (
                    <h1 className="text-lg font-semibold leading-6 text-[#172033]">
                      {children}
                    </h1>
                  ),

                  h2: ({
                    children,
                  }) => (
                    <h2 className="text-base font-semibold leading-6 text-[#172033]">
                      {children}
                    </h2>
                  ),

                  h3: ({
                    children,
                  }) => (
                    <h3 className="text-sm font-semibold leading-6 text-[#172033]">
                      {children}
                    </h3>
                  ),

                  ul: ({
                    children,
                  }) => (
                    <ul className="ml-5 list-disc space-y-1.5">
                      {children}
                    </ul>
                  ),

                  ol: ({
                    children,
                  }) => (
                    <ol className="ml-5 list-decimal space-y-2">
                      {children}
                    </ol>
                  ),

                  li: ({
                    children,
                  }) => (
                    <li className="pl-1 leading-6">
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

                  blockquote: ({
                    children,
                  }) => (
                    <blockquote className="border-l-4 border-[#0F766E] pl-4 text-slate-600">
                      {children}
                    </blockquote>
                  ),

                  code: ({
                    children,
                  }) => (
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-700">
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
      </div>
    </div>
  );
}