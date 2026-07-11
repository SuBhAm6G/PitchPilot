/**
 * Single chat message bubble — user or assistant.
 */

import type { ChatMessage } from "@/lib/types";

interface ChatMessageBubbleProps {
  readonly message: ChatMessage;
}

export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <article
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      aria-label={`${isUser ? "Your" : "Assistant"} message`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-sky-500/20 text-sky-100 rounded-br-md"
            : "bg-slate-700/50 text-slate-200 rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <time
          className={`mt-1.5 block text-xs ${isUser ? "text-sky-400/60" : "text-slate-500"}`}
          dateTime={message.timestamp}
        >
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </article>
  );
}
