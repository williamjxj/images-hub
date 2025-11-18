# Quick Start Guide: Chat Feature Using Vercel AI Gateway + DeepSeek LLM

**Date**: 2025-01-27  
**Feature**: Chat Feature Using Vercel AI Gateway + DeepSeek LLM  
**Branch**: `001-vercel-ai-chat`

## Overview

This guide provides step-by-step instructions to implement the chat feature using Vercel AI Gateway routing to DeepSeek LLM. The implementation migrates from direct DeepSeek API calls to Gateway routing while maintaining existing functionality.

## Prerequisites

- ✅ Next.js 16+ project with App Router
- ✅ Vercel account with AI Gateway enabled
- ✅ DeepSeek API key (for BYOK configuration)
- ✅ Existing chat UI components (`useChat` hook from `@ai-sdk/react`)

## Step 1: Environment Variables

### Local Development (`.env.local`)

```env
# DeepSeek API Key (for BYOK via Vercel AI Gateway)
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here

# Optional: Vercel AI Gateway API Key (only needed for non-Vercel deployments)
# VERCEL_AI_GATEWAY_API_KEY=your-gateway-key-here
```

### Vercel Production

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DEEPSEEK_API_KEY` with your DeepSeek API key
3. Ensure it's available for Production, Preview, and Development environments
4. **Important**: Never commit API keys to version control

## Step 2: Verify Model Availability

1. Go to Vercel Dashboard → AI Gateway → Model List
2. Search for "deepseek" or "deepseek-chat"
3. Verify the exact model identifier (should be `deepseek/deepseek-chat`)
4. Note any provider-specific requirements or limitations

## Step 3: Update API Route

### File: `app/api/chat/route.ts`

**Before** (Direct DeepSeek provider):
```typescript
import { deepseek } from "@ai-sdk/deepseek";
import { streamText, convertToModelMessages } from "ai";

const deepseekProvider = deepseek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const modelMessages = convertToModelMessages(messages);
  
  const result = streamText({
    model: deepseekProvider("deepseek-chat"),
    messages: modelMessages,
    temperature: 0.7,
    maxOutputTokens: 2000,
  });
  
  return result.toTextStreamResponse();
}
```

**After** (Vercel AI Gateway routing):
```typescript
import { streamText, convertToModelMessages } from "ai";

export const runtime = "edge"; // Recommended for lower latency

// Timeout: 60 seconds (per FR-018)
const REQUEST_TIMEOUT_MS = 60_000;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: {
            type: "validation",
            message: "Messages array is required and cannot be empty",
            retryable: false,
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate message length (approximate token check)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user" && lastMessage?.content) {
      const estimatedTokens = lastMessage.content.length / 4;
      if (estimatedTokens > 8000) {
        return new Response(
          JSON.stringify({
            error: {
              type: "validation",
              message: "Message exceeds token limit. Please shorten your message.",
              retryable: false,
              details: "Maximum tokens: 8000",
            },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Convert UI messages to model messages
    const modelMessages = convertToModelMessages(messages);

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      // Stream text using Vercel AI Gateway routing
      // Model string format automatically routes through Gateway when deployed on Vercel
      const result = streamText({
        model: "deepseek/deepseek-chat", // Gateway routing via model string
        messages: modelMessages,
        temperature: 0.7,
        maxOutputTokens: 2000,
        abortSignal: controller.signal,
      });

      clearTimeout(timeoutId);
      return result.toUIMessageStreamResponse();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle timeout
      if (error instanceof Error && error.name === "AbortError") {
        return new Response(
          JSON.stringify({
            error: {
              type: "timeout",
              message: "Request timed out. Please try again.",
              retryable: true,
            },
          }),
          { status: 408, headers: { "Content-Type": "application/json" } }
        );
      }

      // Handle rate limits
      if (error instanceof Error && error.message.includes("rate limit")) {
        const retryAfter = 60; // Default retry after 60 seconds
        return new Response(
          JSON.stringify({
            error: {
              type: "rate_limit",
              message: "Rate limit exceeded. Please try again later.",
              retryable: true,
              retryAfter,
            },
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": retryAfter.toString(),
            },
          }
        );
      }

      // Handle other errors
      console.error("Chat API Error:", error);
      return new Response(
        JSON.stringify({
          error: {
            type: "service",
            message: "An error occurred processing your request. Please try again.",
            retryable: true,
            details: error instanceof Error ? error.message : "Unknown error",
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({
        error: {
          type: "network",
          message: "Network error occurred. Please check your connection and try again.",
          retryable: true,
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

## Step 4: Update Frontend (if needed)

### File: `app/page.tsx`

The existing frontend should work without changes. However, you may want to add error handling:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (error) => {
      console.error('Chat error:', error);
      // Error handling can be added here
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Session timeout: 30 minutes (FR-014)
  useEffect(() => {
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    
    const timeoutId = setTimeout(() => {
      // Clear messages and show timeout message
      // Implementation depends on your error handling strategy
    }, SESSION_TIMEOUT_MS);

    // Reset timeout on activity
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      // Validate message length (client-side)
      const estimatedTokens = input.trim().length / 4;
      if (estimatedTokens > 8000) {
        alert("Message exceeds token limit. Please shorten your message.");
        return;
      }
      
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleNewConversation = () => {
    // Clear messages (FR-016: new conversation ends previous session)
    // Note: useChat hook doesn't provide direct clear method,
    // you may need to implement custom state management or reload
    window.location.reload(); // Simple approach
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
          <Button onClick={handleNewConversation} variant="outline" size="sm">
            New Chat
          </Button>
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
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p className="text-sm font-bold">Error</p>
                  <p className="text-sm">{error.message}</p>
                  <Button onClick={() => window.location.reload()} className="mt-2" size="sm">
                    Retry
                  </Button>
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
```

## Step 5: Testing

### Local Testing

1. **Start development server**:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

2. **Test basic chat**:
   - Open http://localhost:3000
   - Send a message
   - Verify streaming response appears

3. **Test error scenarios**:
   - Send empty message (should be rejected)
   - Send very long message (should be rejected)
   - Test timeout (wait 60+ seconds or simulate)
   - Test network error (disconnect internet)

### Production Testing

1. **Deploy to Vercel**:
   ```bash
   vercel deploy
   ```

2. **Verify Gateway routing**:
   - Check Vercel Dashboard → AI Gateway → Usage
   - Verify requests are routed through Gateway
   - Check model identifier matches `deepseek/deepseek-chat`

3. **Monitor errors**:
   - Check Vercel Dashboard → Logs
   - Verify error responses are structured correctly
   - Check timeout handling works as expected

## Step 6: Verification Checklist

- [ ] Environment variables configured in Vercel dashboard
- [ ] Model identifier verified in Gateway dashboard
- [ ] API route updated to use model string format
- [ ] Error handling implemented (timeout, validation, rate limits)
- [ ] Frontend error display working
- [ ] Session timeout implemented (30 minutes)
- [ ] Token limit validation working
- [ ] Streaming responses working correctly
- [ ] New conversation clears previous session
- [ ] All functional requirements met (FR-001 through FR-018)

## Troubleshooting

### Issue: Gateway not routing requests

**Solution**: 
- Verify deployment is on Vercel (Gateway is automatic on Vercel)
- Check model string format matches Gateway dashboard exactly
- Ensure `DEEPSEEK_API_KEY` is configured in Vercel dashboard

### Issue: Timeout not working

**Solution**:
- Verify `AbortController` is properly implemented
- Check timeout value (60 seconds)
- Ensure `abortSignal` is passed to `streamText()`

### Issue: Error responses not displaying

**Solution**:
- Check error response format matches `useChat` hook expectations
- Verify error handling in frontend component
- Check browser console for error details

### Issue: Token validation too strict/lenient

**Solution**:
- Adjust token estimation formula (currently `length / 4`)
- Update maximum token limit if needed
- Consider server-side validation for exact token counting

## Next Steps

1. Review implementation against specification requirements
2. Test all error scenarios
3. Monitor Gateway usage and costs
4. Consider adding retry logic for transient errors
5. Add analytics/monitoring for production

## References

- Feature Specification: `specs/001-vercel-ai-chat/spec.md`
- Research Document: `specs/001-vercel-ai-chat/research.md`
- Data Model: `specs/001-vercel-ai-chat/data-model.md`
- API Contract: `specs/001-vercel-ai-chat/contracts/api-chat.yaml`
- Vercel AI Gateway Docs: https://vercel.com/docs/ai-gateway

