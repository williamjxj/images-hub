# Quickstart Guide: Page Reorganization

**Feature**: Page Reorganization  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions for implementing the page reorganization feature. It covers setting up the chat widget, updating navigation, and implementing loading placeholders.

## Prerequisites

- Next.js 16.0.3+ project with App Router
- React 19.2.0+
- TypeScript 5+
- Existing dependencies: `@ai-sdk/react`, `framer-motion`, `tailwindcss-animate`
- Magic UI MCP access (for enhanced components)

## Implementation Steps

### Step 1: Create Widget State Management Hook

Create `lib/hooks/use-chat-widget.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Message } from "@/types/chat";

const STORAGE_KEY = "chat-widget-state";
const DEBOUNCE_MS = 100;

export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        setIsOpen(state.isOpen ?? false);
        setMessages(state.messages ?? []);
      }
    } catch (error) {
      console.error("Failed to load widget state:", error);
    }
  }, []);

  // Save state to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ isOpen, messages, lastUpdated: Date.now() })
        );
      } catch (error) {
        console.error("Failed to save widget state:", error);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [isOpen, messages]);

  const openWidget = useCallback(() => setIsOpen(true), []);
  const closeWidget = useCallback(() => setIsOpen(false), []);
  const toggleWidget = useCallback(() => setIsOpen((prev) => !prev), []);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      // Limit to 100 messages
      return updated.slice(-100);
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isOpen,
    messages,
    openWidget,
    closeWidget,
    toggleWidget,
    addMessage,
    clearMessages,
    isLoading,
  };
}
```

### Step 2: Create Widget Components

Create `components/chat-widget/chat-widget-icon.tsx`:

```typescript
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ChatWidgetIconProps {
  onClick: () => void;
  isOpen: boolean;
}

export function ChatWidgetIcon({ onClick, isOpen }: ChatWidgetIconProps) {
  return (
    <motion.div
      initial={false}
      animate={{ scale: isOpen ? 0.9 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        onClick={onClick}
        className="fixed bottom-6 right-6 z-[9999] h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        <Image
          src="/angel.webp"
          alt="AI Assistant"
          width={32}
          height={32}
          className="object-contain"
        />
      </Button>
    </motion.div>
  );
}
```

Create `components/chat-widget/chat-widget-panel.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X } from 'lucide-react';

interface ChatWidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWidgetPanel({ isOpen, onClose }: ChatWidgetPanelProps) {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    sendMessage({ text: trimmed });
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 right-6 z-[9999] w-full max-w-md md:w-[400px] max-h-[calc(100vh-8rem)]"
        >
          <Card className="flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Start a conversation!</p>
                  </div>
                )}

                {messages.map((message) => {
                  const textParts =
                    message.parts?.filter((part) => part.type === 'text') || [];
                  const content = textParts
                    .map((part) => ('text' in part ? part.text : ''))
                    .join('');

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{content}</p>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                    {error.message || 'An error occurred. Please try again.'}
                  </div>
                )}
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="p-4 border-t">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Create `components/chat-widget/chat-widget.tsx`:

```typescript
'use client';

import { useChatWidget } from '@/lib/hooks/use-chat-widget';
import { ChatWidgetIcon } from './chat-widget-icon';
import { ChatWidgetPanel } from './chat-widget-panel';

export function ChatWidget() {
  const { isOpen, openWidget, closeWidget } = useChatWidget();

  return (
    <>
      <ChatWidgetIcon onClick={isOpen ? closeWidget : openWidget} isOpen={isOpen} />
      <ChatWidgetPanel isOpen={isOpen} onClose={closeWidget} />
    </>
  );
}
```

### Step 3: Update Root Layout

Update `app/layout.tsx`:

```typescript
import { ChatWidget } from '@/components/chat-widget/chat-widget';
// ... other imports

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="flex justify-between items-center p-4 gap-4 h-16 border-b">
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium hover:underline">
                Stock Images
              </Link>
              <SignedIn>
                <Link
                  href="/r2-images"
                  className="text-sm font-medium hover:underline"
                >
                  Cloudflare Images
                </Link>
              </SignedIn>
            </nav>
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                Powered by{' '}
                <a
                  href="https://www.bestitconsulting.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Best IT Consulting
                </a>
                {' & '}
                <a
                  href="https://www.bestitconsultants.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Best IT Consultants
                </a>
              </div>
              <SignedOut>
                <SignInButton mode="modal" />
                <SignUpButton mode="modal">
                  <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm px-4 h-10 cursor-pointer hover:bg-[#5a3ae6]">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </header>
          {children}
          <ChatWidget />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### Step 4: Move Stock Images to Home

Update `app/page.tsx`:

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ImagesHubGallery } from '@/components/images-hub/images-hub-gallery';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Image Search Hub',
  description: 'Search for images across Unsplash, Pixabay, and Pexels',
};

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <ImagesHubGallery />;
}
```

### Step 5: Add Cloudflare Images Link to Stock Images Header

Update `components/images-hub/images-hub-gallery.tsx` to include Cloudflare Images link in header (or add to page component).

### Step 6: Create Image Loading Placeholder

Create `components/loading-placeholders/image-skeleton.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImageSkeletonProps {
  aspectRatio?: 'square' | 'landscape' | 'portrait' | number;
  className?: string;
  animated?: boolean;
}

const aspectRatioMap = {
  square: 'aspect-square',
  landscape: 'aspect-video',
  portrait: 'aspect-[3/4]',
};

export function ImageSkeleton({
  aspectRatio = 'square',
  className,
  animated = true,
}: ImageSkeletonProps) {
  const aspectClass =
    typeof aspectRatio === 'number'
      ? `aspect-[${aspectRatio}]`
      : aspectRatioMap[aspectRatio];

  return (
    <div
      className={cn(
        'bg-muted rounded-lg overflow-hidden',
        aspectClass,
        className
      )}
    >
      {animated && (
        <motion.div
          className="h-full w-full bg-gradient-to-r from-muted via-muted/50 to-muted"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ width: '200%' }}
        />
      )}
    </div>
  );
}
```

### Step 7: Integrate Magic UI Components (Optional)

Use Magic UI MCP to enhance navigation buttons and breadcrumbs:

```typescript
// Example: Using Magic UI button
import { Button } from "@magicui/react"; // Adjust import based on actual Magic UI structure
```

## Testing Checklist

- [ ] Widget opens/closes correctly
- [ ] Widget state persists across page navigation
- [ ] Chat history persists when widget is closed/reopened
- [ ] Navigation links work correctly
- [ ] "Powered by" links open in new tab
- [ ] Stock Images page loads as home
- [ ] Cloudflare Images link appears in header
- [ ] Image loading placeholders display correctly
- [ ] Mobile responsive behavior works
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

## Common Issues & Solutions

### Issue: Widget state not persisting

**Solution**: Check localStorage availability, add error handling:

```typescript
if (typeof window !== "undefined" && "localStorage" in window) {
  // Use localStorage
} else {
  // Fallback to in-memory state
}
```

### Issue: Widget z-index conflicts

**Solution**: Use high z-index (9999) and test with modals:

```typescript
className = "z-[9999]";
```

### Issue: Mobile layout issues

**Solution**: Use responsive classes and test on real devices:

```typescript
className = "w-full md:w-[400px]";
```

## Next Steps

1. Implement components following this guide
2. Test all user flows
3. Add accessibility improvements
4. Optimize performance
5. Deploy to preview environment
6. Gather user feedback

## References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Context API](https://react.dev/reference/react/useContext)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
