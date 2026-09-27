import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({
  messages,
  isTyping,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-4 py-8 sm:px-6">

      <div className="mx-auto max-w-3xl space-y-6">

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}

        {isTyping && (
          <TypingIndicator />
        )}

        <div ref={bottomRef} />

      </div>

    </div>
  );
}