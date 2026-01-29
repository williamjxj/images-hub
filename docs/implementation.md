# Application Implementation Details

## Overview

This document describes the implementation of a modern media and AI application built with Next.js, Clerk authentication, and the Vercel AI SDK. The app provides:

- An AI-powered chat widget
- A unified stock image search hub (Unsplash, Pexels, Pixabay)
- A Cloudflare R2 media gallery with multi-bucket, folder-based navigation

## Tech Stack

### Core Framework

- **Next.js 16.0.3** - App Router, server components, API routes
- **React 19.2.0** - UI library
- **TypeScript 5** - Strict typing

### Authentication

- **Clerk 6.35.2** - User authentication and management
  - Middleware-based route protection
  - Required for all main features (chat, search, R2 gallery)

### AI Integration

- **Vercel AI SDK 5.x** - AI integration framework
- **@ai-sdk/react** - React hooks for chat streaming
- **DeepSeek API** - AI model provider (via OpenAI-compatible interface)

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS with `@theme` config
- **shadcn/ui** - Primitive components (Button, Input, Card, Tabs, Tooltip, etc.)
- **Radix UI** - Accessible primitives under the hood
- **Framer Motion** - Animations for galleries and navigation

## Project Structure (high level)

```
app/
  api/
    chat/                 # AI chat API
    images-hub/           # Stock image search API
    r2/                   # Cloudflare R2 list / image APIs
  cloudflare-images/      # R2 media gallery page
  stock-images/           # Stock image search hub
  sign-in/, sign-up/      # Clerk auth pages
  page.tsx                # Portrait-style marketing / landing

components/
  chat-widget/            # Floating AI chat widget
  images-hub/             # Stock image search UI
  r2-images/              # R2 gallery UI (buckets, folders, viewer)
  ui/                     # shadcn/ui primitives + custom UI

lib/
  hub/                    # Provider clients + search aggregator
  r2/                     # R2 client + list/get helpers
  hooks/                  # Custom hooks (chat, search, R2, UI state)
  utils/                  # Generic utilities (storage, accessibility, etc.)

types/
  chat-widget.ts          # Chat widget types
  ui-ux.ts                # UI/UX related types
  r2.ts                   # R2 gallery types
```

## Implementation Details

### 1. Clerk Authentication Setup

#### Middleware (`middleware.ts`)

- Implements route protection using Clerk's `clerkMiddleware`
- Public routes: `/`, `/sign-in`, `/sign-up`, `/api/webhooks`
- All other routes require authentication
- Runs on all routes except Next.js internals and static files

#### Root Layout (`app/layout.tsx`)

- Wraps application with `ClerkProvider` for authentication context
- Maintains font configuration (Geist Sans & Mono)
- Imports global CSS styles

#### Environment Variables Required

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### 2. AI Chat Integration

#### API Route (`app/api/chat/route.ts`)

- **Endpoint**: `POST /api/chat`
- **Runtime**: Edge runtime for better performance
- **Configuration**:
  - Uses DeepSeek API via OpenAI-compatible interface
  - Base URL: `https://api.deepseek.com/v1`
  - Model: `deepseek-chat`
  - Temperature: 0.7
  - Max output tokens: 2000
- **Streaming**: Returns text stream response using `toTextStreamResponse()`

#### Chat Interface (`app/page.tsx`)

- **Client Component**: Uses React hooks for state management
- **State Management**:
  - Local input state with `useState`
  - Chat state managed by `useChat` hook from `@ai-sdk/react`
- **Transport**: Uses `DefaultChatTransport` configured for `/api/chat`
- **Message Rendering**:
  - Extracts text parts from message parts array
  - Displays user and assistant messages with different styling
  - Shows loading indicator during streaming
- **UI Components**:
  - Card container with header
  - ScrollArea for message list
  - Input field with send button
  - Loading states and empty state

### 3. Stock Image Search Hub

- **API**: `app/api/images-hub/search/route.ts`
  - Authenticated `GET` endpoint
  - Calls `lib/hub/search-aggregator.ts`
  - Aggregates Unsplash, Pexels, and Pixabay using provider clients
- **Aggregator**: `lib/hub/search-aggregator.ts`
  - Normalizes provider responses into unified `ImageResult` structures
  - Handles per-provider errors and exposes them in `SearchResponse.errors`
- **UI**: `components/images-hub/*`
  - Provider filter chips, search bar, result sections grouped by provider
  - Infinite scroll and responsive masonry/grid layouts

### 4. Cloudflare R2 Media Gallery

- **Page**: `app/cloudflare-images/page.tsx`
  - Server component that checks Clerk auth
  - Renders `R2ImageGallery`
- **Gallery**: `components/r2-images/r2-image-gallery.tsx`
  - Client component coordinating:
    - Bucket selection (`R2ImageTabs` – left column)
    - Folder tree (`R2FolderPanel` + `R2FolderTree` – middle column)
    - Image/video grid/masonry/list (right column)
    - Infinite scroll, modals, filters
- **Data Hook**: `lib/hooks/use-r2-images.ts`
  - Wraps `/api/r2/list` endpoint
  - Manages active bucket, current folder, pagination, and loading state
- **API**: `app/api/r2/list/route.ts`
  - Validates bucket, prefix, and token
  - Uses `lib/r2/list-objects.ts` + `get-object-url.ts` to list objects and generate presigned URLs

Layout summary for the R2 gallery:

- **Left**: Bucket list (all R2 buckets – including `friendshipdaycare`)
- **Middle**: Folder tree (expandable, Windows Explorer–style)
- **Right**: Images/videos with multiple display modes and modals

### 5. Styling Configuration

#### Tailwind CSS v4

- **Configuration Method**: CSS-based using `@theme` directive
- **Location**: `app/globals.css`
- **Features**:
  - Custom color variables for theming
  - Dark mode support via custom variant
  - Font configuration
  - Border radius utilities
- **Compatibility**: `tailwind.config.ts` created for tool compatibility (not actively used)

#### PostCSS (`postcss.config.mjs`)

- Uses `@tailwindcss/postcss` plugin
- Processes CSS imports and Tailwind directives

#### shadcn/ui Configuration (`components.json`)

- Style: New York
- RSC: Enabled
- CSS Variables: Enabled
- Base color: Slate
- Component aliases configured

### 6. Component Library

#### shadcn/ui Components

- **Button**: Variant-based button component
- **Input**: Styled input field
- **Card**: Container component with header/body/footer
- **ScrollArea**: Scrollable container
- **Avatar**: User avatar display

All components use:

- Radix UI primitives for accessibility
- Tailwind CSS for styling
- TypeScript for type safety
- `cn()` utility for class merging

## Key Features

### Authentication

- ✅ Clerk integration with middleware protection
- ✅ Public and protected route handling
- ✅ Sign-in/Sign-up pages ready (to be implemented)

### AI Chat

- ✅ Real-time streaming chat interface
- ✅ DeepSeek AI integration
- ✅ Message history display
- ✅ Loading states
- ✅ Error handling

### UI/UX

- ✅ Modern, responsive design
- ✅ Dark mode support (via CSS variables)
- ✅ Accessible components (Radix UI)
- ✅ Smooth animations and transitions

## Environment Setup

### Required Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# DeepSeek AI
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
pnpm start
```

## API Endpoints

### POST /api/chat

Handles chat message streaming.

**Request Body**:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ]
}
```

**Response**: Streaming text response

## Future Enhancements

### Planned Features

- [ ] Sign-in and Sign-up pages
- [ ] User profile management
- [ ] Chat history persistence
- [ ] Multiple AI model support
- [ ] File upload support
- [ ] Markdown rendering in messages
- [ ] Code syntax highlighting
- [ ] Message editing and deletion
- [ ] Export chat history

### Technical Improvements

- [ ] Add error boundaries
- [ ] Implement retry logic for failed requests
- [ ] Add request rate limiting
- [ ] Optimize bundle size
- [ ] Add analytics
- [ ] Implement caching strategies

## Troubleshooting

### Common Issues

1. **Clerk Authentication Errors**
   - Verify environment variables are set correctly
   - Check middleware configuration
   - Ensure ClerkProvider wraps the app

2. **AI API Errors**
   - Verify DEEPSEEK_API_KEY is set
   - Check API endpoint configuration
   - Review rate limits

3. **Styling Issues**
   - Ensure `globals.css` is imported in layout
   - Verify PostCSS configuration
   - Check Tailwind directives are correct

4. **TypeScript Errors**
   - Run `pnpm install` to ensure all types are installed
   - Check `tsconfig.json` paths configuration

## Dependencies Summary

### Production Dependencies

- Next.js, React, TypeScript (core)
- Clerk (authentication)
- Vercel AI SDK (AI integration)
- Tailwind CSS (styling)
- Radix UI (components)
- shadcn/ui components

### Development Dependencies

- ESLint (linting)
- Tailwind CSS v4 (styling)
- Type definitions

## Version Information

- Next.js: 16.0.3
- React: 19.2.0
- Clerk: 6.35.2
- AI SDK: 5.0.93
- Tailwind CSS: 4.x
- TypeScript: 5.x

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
