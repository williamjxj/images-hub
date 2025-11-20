"use client";

/**
 * Chat widget panel component with chat interface
 */

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, AlertCircle, Copy, Check, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useChatWidget } from "@/lib/hooks/use-chat-widget";
import { FeedbackPrompt } from "@/components/feedback/feedback-prompt";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Message } from "@/types/chat-widget";

interface ChatWidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Chat widget panel with full chat functionality
 */
export function ChatWidgetPanel({ isOpen, onClose }: ChatWidgetPanelProps) {
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { messages: persistedMessages, addMessage } = useChatWidget();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Initialize messages from persisted state on mount
  useEffect(() => {
    if (!isInitialized) {
      if (persistedMessages.length > 0 && messages.length === 0) {
        const initialMessages = persistedMessages.map((msg) => {
          // Extract text content from parts or use content directly
          const textParts =
            msg.parts?.filter((part) => part.type === "text") || [];
          const textContent =
            textParts.length > 0
              ? textParts.map((part) => part.text || "").join("")
              : msg.content;

          return {
            id: msg.id,
            role: msg.role,
            parts: [{ type: "text" as const, text: textContent }],
          };
        });
        setMessages(initialMessages);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInitialized(true);
    }
  }, [persistedMessages, messages.length, setMessages, isInitialized]);

  // Sync messages from useChat to persisted state
  useEffect(() => {
    messages.forEach((msg) => {
      // Skip system messages
      if (msg.role === "system") {
        return;
      }

      const textParts = msg.parts?.filter((part) => part.type === "text") || [];
      const content = textParts
        .map((part) => ("text" in part ? part.text : ""))
        .join("");

      if (content && (msg.role === "user" || msg.role === "assistant")) {
        // Convert parts to our MessagePart format (only text parts)
        const convertedParts: Message["parts"] = textParts.map((part) => ({
          type: "text" as const,
          text: "text" in part ? part.text : "",
        }));

        const message: Message = {
          id: msg.id,
          role: msg.role,
          content,
          timestamp: Date.now(),
          parts: convertedParts.length > 0 ? convertedParts : undefined,
        };
        // Only add if not already in persisted messages
        if (!persistedMessages.find((m) => m.id === msg.id)) {
          addMessage(message);
        }
      }
    });
  }, [messages, addMessage, persistedMessages]);

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom when new messages arrive or when streaming
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      // Find the viewport element inside ScrollArea
      const viewport = scrollContainerRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]'
      ) as HTMLElement;
      if (viewport) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }
  }, [messages, isOpen, isLoading]);

  // Show feedback prompt after chat interaction completes
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      // Show feedback prompt after a short delay, but only if not already shown
      if (!showFeedbackPrompt) {
        const timer = setTimeout(() => {
          setShowFeedbackPrompt(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else if (isLoading) {
      // Hide feedback prompt while loading
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowFeedbackPrompt(false);
    }
  }, [messages.length, isLoading, showFeedbackPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    sendMessage({ text: trimmed });
    setInput("");
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((msg) => msg.role === "user");
      if (lastUserMessage) {
        const lastUserIndex = messages.findIndex(
          (msg) => msg.id === lastUserMessage.id
        );
        setMessages(messages.slice(0, lastUserIndex + 1));
        const textParts =
          lastUserMessage.parts?.filter((part) => part.type === "text") || [];
        const messageText = textParts
          .map((part) => ("text" in part ? part.text : ""))
          .join("");
        if (messageText) {
          setTimeout(() => {
            sendMessage({ text: messageText });
          }, 100);
        }
      }
    }
  };

  // Handle Escape key to close chat widget
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-[9999] w-full max-w-md md:w-[450px] h-[calc(100vh-2rem)] max-h-[700px] flex flex-col"
          role="dialog"
          aria-label="AI Assistant Chat"
          aria-modal="true"
        >
          <Card className="flex flex-col h-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <div className="flex items-center gap-2">
                <Image
                  src="/angel.webp"
                  alt="AI Assistant"
                  width={24}
                  height={24}
                  className="object-cover rounded-full"
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Send feedback"
                      title="Send feedback"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Send Feedback</DialogTitle>
                    </DialogHeader>
                    <FeedbackForm
                      initialType="general"
                      onSuccess={() => {}}
                      onClose={() => {}}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="flex-1 min-h-0 overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="px-3 py-2 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Start a conversation!</p>
                    </div>
                  )}

                  {messages.map((message) => {
                    const textParts =
                      message.parts?.filter((part) => part.type === "text") ||
                      [];
                    const content = textParts
                      .map((part) => ("text" in part ? part.text : ""))
                      .join("");

                    // Get timestamp from persisted messages
                    const persistedMessage = persistedMessages.find(
                      (m) => m.id === message.id
                    );
                    const timestamp = persistedMessage?.timestamp;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm whitespace-pre-wrap flex-1">
                              {content}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {timestamp && (
                                <span
                                  className={`text-xs ${
                                    message.role === "user"
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {formatTimestamp(timestamp)}
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-6 w-6 ${
                                  message.role === "user"
                                    ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() =>
                                  handleCopyMessage(message.id, content)
                                }
                                aria-label="Copy message"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <p className="text-sm text-muted-foreground">
                          Thinking...
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 max-w-[80%]">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-destructive">
                            Error
                          </p>
                          <p className="text-sm text-destructive/80 mt-1">
                            {error.message ||
                              "An error occurred. Please try again."}
                          </p>
                          <Button
                            onClick={handleRetry}
                            variant="outline"
                            size="sm"
                            className="mt-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            Retry
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {showFeedbackPrompt && messages.length > 0 && !isLoading && (
              <div className="px-4 py-2 border-t shrink-0 bg-muted/30">
                <FeedbackPrompt
                  context="Chat interaction"
                  onDismiss={() => setShowFeedbackPrompt(false)}
                  onSubmitted={() => setShowFeedbackPrompt(false)}
                />
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="px-3 py-2 border-t shrink-0"
            >
              <div className="flex gap-2 w-full">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 w-full min-w-0"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
