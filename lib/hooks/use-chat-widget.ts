"use client";

/**
 * Hook for managing chat widget state with localStorage persistence
 */

import { useState, useEffect, useCallback } from "react";
import type { WidgetState, Message } from "@/types/chat-widget";
import {
  saveWidgetState,
  loadWidgetState,
  clearWidgetState,
  isStorageAvailable,
} from "@/lib/utils/storage";

const DEBOUNCE_MS = 100;
const MAX_MESSAGES = 100;

/**
 * Hook for managing chat widget state
 */
export function useChatWidget(userId?: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    if (!isStorageAvailable()) {
      return;
    }

    try {
      const stored = loadWidgetState(userId);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(stored.isOpen ?? false);
         
        setMessages(stored.messages ?? []);
      }
    } catch (error) {
      console.error("Failed to load widget state:", error);
    }
  }, [userId]);

  // Save state to localStorage (debounced)
  useEffect(() => {
    if (!isStorageAvailable()) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        const state: WidgetState = {
          isOpen,
          messages,
          lastUpdated: Date.now(),
        };
        saveWidgetState(state, userId);
      } catch (error) {
        console.error("Failed to save widget state:", error);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [isOpen, messages, userId]);

  const openWidget = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleWidget = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      // Limit to MAX_MESSAGES, keeping the most recent
      return updated.slice(-MAX_MESSAGES);
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearAll = useCallback(() => {
    setIsOpen(false);
    setMessages([]);
    if (isStorageAvailable()) {
      clearWidgetState(userId);
    }
  }, [userId]);

  return {
    isOpen,
    messages,
    openWidget,
    closeWidget,
    toggleWidget,
    addMessage,
    clearMessages,
    clearAll,
  };
}
