"use client";

/**
 * Hook for managing chat message history persistence
 */

import { useCallback } from "react";
import type { Message } from "@/types/chat-widget";
import { useChatWidget } from "./use-chat-widget";

/**
 * Hook for chat history management
 * Wraps useChatWidget to provide history-specific operations
 */
export function useChatHistory(userId?: string) {
  const { messages, addMessage, clearMessages, clearAll } =
    useChatWidget(userId);

  const addUserMessage = useCallback(
    (content: string) => {
      const message: Message = {
        id: `user-${Date.now()}-${Math.random()}`,
        role: "user",
        content,
        timestamp: Date.now(),
      };
      addMessage(message);
      return message;
    },
    [addMessage]
  );

  const addAssistantMessage = useCallback(
    (content: string, parts?: Message["parts"]) => {
      const message: Message = {
        id: `assistant-${Date.now()}-${Math.random()}`,
        role: "assistant",
        content,
        timestamp: Date.now(),
        parts,
      };
      addMessage(message);
      return message;
    },
    [addMessage]
  );

  const getMessageCount = useCallback(() => {
    return messages.length;
  }, [messages]);

  const hasMessages = useCallback(() => {
    return messages.length > 0;
  }, [messages]);

  return {
    messages,
    addUserMessage,
    addAssistantMessage,
    clearHistory: clearMessages,
    clearAll,
    getMessageCount,
    hasMessages,
  };
}
