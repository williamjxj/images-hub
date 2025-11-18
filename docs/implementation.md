# AI Chatbox Implementation Details

## Overview

This document describes the implementation of an AI-powered chatbox application built with Next.js, Clerk authentication, and the Vercel AI SDK. The application provides a real-time chat interface powered by DeepSeek AI models.

## Tech Stack

### Core Framework
- **Next.js 16.0.3** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety

### Authentication
- **Clerk 6.35.2** - User authentication and management
  - Integrated with Next.js middleware for route protection
  - Supports sign-in and sign-up flows

### AI Integration
- **Vercel AI SDK 5.0.93** - AI integration framework
- **@ai-sdk/react 2.0.93** - React hooks for AI interactions
- **@ai-sdk/openai 2.0.68** - OpenAI-compatible API client
- **DeepSeek API** - AI model provider (via OpenAI-compatible interface)

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
  - CSS-based configuration using `@theme` directive
  - PostCSS integration via `@tailwindcss/postcss`
- **shadcn/ui** - Component library
  - Button, Input, Card, ScrollArea components
  - New York style variant

### UI Components
- **Radix UI** - Headless UI primitives
  - ScrollArea, Slot, Avatar components
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Class name utilities

## Project Structure

```
ai-chatbox/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── globals.css                # Global styles & Tailwind config
│   ├── layout.tsx                 # Root layout with ClerkProvider
│   └── page.tsx                   # Main chat interface
├── components/
│   └── ui/                        # shadcn/ui components
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── scroll-area.tsx
├── lib/
│   └── utils.ts                   # Utility functions (cn helper)
├── middleware.ts                  # Clerk authentication middleware
├── tailwind.config.ts             # Tailwind config (compatibility)
├── postcss.config.mjs             # PostCSS configuration
├── components.json                # shadcn/ui configuration
└── package.json                   # Dependencies
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

### 3. Styling Configuration

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

### 4. Component Library

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

