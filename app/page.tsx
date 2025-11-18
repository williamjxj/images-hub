'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, AlertCircle } from 'lucide-react';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error, reload, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Session timeout: 30 minutes inactivity (FR-014)
  useEffect(() => {
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

    // Clear existing timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    // Reset timeout on activity (message send/receive)
    if (messages.length > 0) {
      sessionTimeoutRef.current = setTimeout(() => {
        // Session expired - clear messages
        setMessages([]);
        sessionTimeoutRef.current = null;
      }, SESSION_TIMEOUT_MS);
    }

    // Cleanup on unmount
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [messages, setMessages]);

  // Session starts when user sends first message (FR-013)
  // This is handled automatically by useChat hook when first message is sent

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    if (!trimmedInput || isLoading) return;

    // Client-side message length validation (FR-015)
    const estimatedTokens = trimmedInput.length / 4; // Approximate: 1 token ≈ 4 characters
    if (estimatedTokens > 8000) {
      alert('Message exceeds token limit. Please shorten your message.');
      return;
    }

    sendMessage({ text: trimmedInput });
    setInput('');
  };

  const handleRetry = () => {
    if (reload) {
      reload();
    }
  };

  // New conversation handler - clears previous session (FR-016)
  const handleNewConversation = () => {
    setMessages([]);
    setInput('');
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b bg-white rounded-t-lg flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">DeepSeek Chat</h1>
            <p className="text-sm text-gray-500">Powered by Vercel AI Gateway</p>
          </div>
          {messages.length > 0 && (
            <Button onClick={handleNewConversation} variant="outline" size="sm">
              New Chat
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                <p className="text-lg">👋 Start a conversation!</p>
                <p className="text-sm mt-2">Ask me anything...</p>
              </div>
            )}
            
            {messages.map((message) => {
              const textParts = message.parts?.filter((part) => part.type === 'text') || [];
              const content = textParts.map((part) => 'text' in part ? part.text : '').join('');
              const role = message.role;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{content}</p>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-gray-500">Thinking...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-[80%]">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Error</p>
                      <p className="text-sm text-red-700 mt-1">
                        {error.message || 'An error occurred. Please try again.'}
                      </p>
                      {error.message?.includes('credit card') && (
                        <a
                          href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-700 border-red-300 hover:bg-red-100"
                          >
                            Add Credit Card
                          </Button>
                        </a>
                      )}
                      {!error.message?.includes('credit card') && (
                        <Button
                          onClick={handleRetry}
                          variant="outline"
                          size="sm"
                          className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}