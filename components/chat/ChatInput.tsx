/**
 * Chat text input with send button.
 * Fully keyboard accessible — Enter to send, Shift+Enter for newlines.
 */

"use client";

import { useState } from "react";
import { CHAT_CONFIG, CHAT_CONSTRAINTS } from "@/lib/utils/constants";

interface ChatInputProps {
  readonly onSend: (message: string) => void;
  readonly isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  function handleSubmit() {
    const trimmed = input.trim();
    if (trimmed.length === CHAT_CONSTRAINTS.EMPTY_LENGTH || isLoading) return;
    onSend(trimmed);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-white/10 bg-slate-900/50 p-4">
      <label htmlFor="chat-input" className="sr-only">
        Type your message
      </label>
      <textarea
        id="chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about food, restrooms, directions..."
        maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
        rows={1}
        disabled={isLoading}
        className="flex-1 resize-none rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 disabled:opacity-50"
        aria-label="Chat message input"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || input.trim().length === CHAT_CONSTRAINTS.EMPTY_LENGTH}
        aria-label="Send message"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
          </svg>
        )}
      </button>
    </div>
  );
}
