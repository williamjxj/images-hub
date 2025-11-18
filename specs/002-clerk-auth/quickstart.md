# Quickstart: Implementing Clerk Authentication

**Feature**: Clerk Authentication and Authorization  
**Date**: 2025-01-27  
**Prerequisites**: Clerk installed, API keys configured in `.env.local`

## Overview

This guide walks through implementing Clerk authentication to protect the chat application. Users must sign in before accessing chat features.

## Prerequisites

✅ Clerk package installed (`@clerk/nextjs`)  
✅ Environment variables configured in `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Implementation Steps

### Step 1: Update Middleware to Protect Routes

**File**: `middleware.ts`

Update the middleware to protect the chat route (`/`) and API endpoints:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public auth routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

**What this does**:
- Protects `/` (chat page) - redirects to sign-in if not authenticated
- Protects `/api/chat` - returns 401 if not authenticated
- Keeps `/sign-in` and `/sign-up` public
- Keeps webhook routes public (for Clerk callbacks)

### Step 2: Add Clerk Components to Layout

**File**: `app/layout.tsx`

Add Clerk authentication components to the header:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chatbox",
  description: "AI-powered chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16 border-b">
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
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**What this does**:
- Shows Sign In and Sign Up buttons when user is signed out
- Shows UserButton (profile menu) when user is signed in
- UserButton includes sign-out functionality
- Uses Clerk's Account Portal (modal) for authentication flows

### Step 3: Protect Chat API Route (Defense-in-Depth)

**File**: `app/api/chat/route.ts`

Add authentication check in the route handler:

```typescript
import { streamText, convertToModelMessages } from "ai";
import { auth } from '@clerk/nextjs/server';

export const runtime = "edge";

const REQUEST_TIMEOUT_MS = 60_000;

export async function POST(req: Request) {
  // Verify authentication (defense-in-depth)
  const { userId } = auth();
  if (!userId) {
    return new Response(
      JSON.stringify({
        error: {
          type: "authentication",
          message: "Authentication required. Please sign in.",
          retryable: false,
        },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await req.json();
    // ... rest of existing handler code
  } catch (error) {
    // ... existing error handling
  }
}
```

**What this does**:
- Adds explicit authentication check in route handler
- Provides better error messages if middleware somehow fails
- Returns 401 with clear error message

### Step 4: (Optional) Update Chat Page for Better UX

**File**: `app/page.tsx`

The middleware already handles redirects, but you can add loading states:

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { useChat } from '@ai-sdk/react';
// ... existing imports

export default function ChatPage() {
  const { isLoaded, user } = useUser();
  
  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Rest of existing chat component code
  // ...
}
```

**What this does**:
- Shows loading state while Clerk checks authentication
- Provides better UX during authentication check
- Middleware handles redirect, but this prevents flash of content

## Testing

### 1. Test Sign-Up Flow

1. Start dev server: `pnpm dev`
2. Visit `http://localhost:3000`
3. Should be redirected to sign-in page (or see sign-in modal)
4. Click "Sign Up"
5. Enter email and password
6. Complete sign-up flow
7. Should be redirected to chat page

### 2. Test Sign-In Flow

1. Sign out (using UserButton)
2. Click "Sign In"
3. Enter credentials
4. Should be redirected to chat page

### 3. Test Protected Routes

1. While signed out, try to access `http://localhost:3000`
2. Should be redirected to sign-in
3. Try to access `http://localhost:3000/api/chat` directly
4. Should receive 401 Unauthorized response

### 4. Test Session Persistence

1. Sign in
2. Refresh the page
3. Should remain signed in (no redirect)
4. Close and reopen browser
5. Should remain signed in (session persists)

### 5. Test Sign-Out

1. Click UserButton in header
2. Click "Sign Out"
3. Should be redirected to sign-in page
4. Chat page should be inaccessible

## Configuration

### Clerk Dashboard Settings

1. **Session Timeout**: Set to 30 minutes
   - Go to Clerk Dashboard → Settings → Sessions
   - Set "Session lifetime" to 30 minutes

2. **Email Verification**: Enable email verification
   - Go to Clerk Dashboard → Settings → Email & Phone
   - Enable "Require email verification"

3. **Social Authentication** (Optional):
   - Go to Clerk Dashboard → Settings → Social Connections
   - Enable desired providers (Google, GitHub, etc.)

### Environment Variables

Ensure these are set in `.env.local`:

```env
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional - Custom URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Role Configuration (Future)

To implement User/Admin roles:

1. **Assign roles via Clerk Dashboard**:
   - Go to Clerk Dashboard → Users
   - Select a user
   - Edit "Public metadata"
   - Add: `{ "role": "admin" }`

2. **Check roles in code**:
```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

const user = await currentUser();
const role = user?.publicMetadata?.role || 'user';

if (role === 'admin') {
  // Admin-only logic
}
```

## Troubleshooting

### Issue: Redirect Loop

**Symptom**: Page keeps redirecting to sign-in even when signed in

**Solution**:
- Check middleware matcher config
- Ensure `/sign-in` is in public routes
- Clear browser cookies and try again

### Issue: API Returns 401

**Symptom**: API route returns 401 even when signed in

**Solution**:
- Check `CLERK_SECRET_KEY` is set correctly
- Verify middleware is running (check logs)
- Ensure API route is in middleware matcher

### Issue: Components Not Showing

**Symptom**: Sign-in buttons not appearing

**Solution**:
- Verify `ClerkProvider` wraps the app
- Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Check browser console for errors

### Issue: Session Not Persisting

**Symptom**: User signed out after page refresh

**Solution**:
- Check Clerk dashboard session settings
- Verify cookies are enabled in browser
- Check HTTPS is used in production

## Next Steps

After implementing basic authentication:

1. ✅ **Email Verification**: Configure in Clerk dashboard
2. ✅ **Role Assignment**: Set up User/Admin roles
3. ✅ **Custom Sign-In Page**: Create custom pages if needed (optional)
4. ✅ **Profile Management**: Add profile page for users
5. ✅ **Admin Features**: Implement admin-only features

## References

- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Clerk Middleware Reference](https://clerk.com/docs/reference/nextjs/clerk-middleware)
- [Clerk Components](https://clerk.com/docs/nextjs/reference/components/overview)
- [Protect API Routes](https://clerk.com/docs/nextjs/guides/api-routes)

