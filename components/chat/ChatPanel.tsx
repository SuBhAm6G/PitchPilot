/**
 * Chat panel — container with message list and input.
 * Manages chat state and API calls.
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessageBubble from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import type { ChatMessage, UserProfile, StadiumState } from "@/lib/types";

interface ChatPanelProps {
  readonly userProfile: UserProfile;
  readonly stadiumState: StadiumState | null;
  readonly initialMessage?: string;
}

export default function ChatPanel({
  userProfile,
  stadiumState,
  initialMessage,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 Welcome to PitchPilot! I'm your AI stadium assistant for the FIFA World Cup 2026 at MetLife Stadium.\n\nI can help you with:\n🍔 Food & drink locations\n🚻 Nearest restrooms\n🗺️ Navigation & directions\n👥 Crowd info\n🚨 Safety & emergencies\n\nHow can I help you today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!stadiumState) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now().toString()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            userProfile,
            stadiumState,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${String(response.status)}`);
        }

        const data: { reply?: string; error?: string } = await response.json();

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now().toString()}`,
          role: "assistant",
          content:
            data.reply ??
            "I apologize, I couldn't process your request. Please try again.",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now().toString()}`,
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please try again in a moment.",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [stadiumState, userProfile],
  );

  const initialSentRef = useRef(false);

  // Handle initial message from quick actions
  useEffect(() => {
    if (initialMessage && !initialSentRef.current) {
      initialSentRef.current = true;
      void handleSend(initialMessage);
    }
  }, [initialMessage, stadiumState, handleSend]);

  return (
    <section
      aria-label="AI Chat Assistant"
      className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md"
    >
      {/* Header */}
      <div className="border-b border-white/10 px-5 py-3">
        <h2 className="text-sm font-semibold text-white">
          PitchPilot AI Assistant
        </h2>
        <p className="text-xs text-slate-500">Powered by Google Gemini</p>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start" aria-label="Assistant is typing">
            <div className="flex items-center gap-1 rounded-2xl bg-slate-700/50 px-4 py-3 rounded-bl-md">
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                style={{ animationDelay: "0ms" }}
                aria-hidden="true"
              />
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                style={{ animationDelay: "150ms" }}
                aria-hidden="true"
              />
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                style={{ animationDelay: "300ms" }}
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={(msg) => void handleSend(msg)} isLoading={isLoading} />
    </section>
  );
}
