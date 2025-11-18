# Research: Clerk Authentication and Authorization Implementation

**Feature**: Clerk Authentication and Authorization  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Overview

This document consolidates research findings for implementing Clerk authentication and authorization in the Next.js chat application. All technical decisions are documented with rationale and alternatives considered.

## Research Topics

### 1. Clerk Next.js App Router Integration

**Decision**: Use Clerk's Next.js SDK (`@clerk/nextjs`) with middleware-based route protection and prebuilt components.

**Rationale**:

- Clerk provides official Next.js App Router support with `clerkMiddleware()`
- Prebuilt components (SignInButton, SignUpButton, UserButton) reduce development time
- Middleware-based protection is the recommended pattern for App Router
- Built-in session management handles 30-minute timeout automatically
- Rate limiting and security features handled by Clerk (per FR-018)

**Alternatives Considered**:

- Custom authentication implementation: Rejected due to security risks and maintenance burden
- Other auth providers (Auth0, Supabase Auth): Rejected as Clerk is already installed and configured
- Pages Router approach: Rejected as project uses App Router

**References**:

- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Clerk Middleware Reference](https://clerk.com/docs/reference/nextjs/clerk-middleware)

### 2. Route Protection Strategy

**Decision**: Protect main chat route (`/`) and API endpoints (`/api/chat`) using `clerkMiddleware()` with `auth.protect()` for protected routes.

**Rationale**:

- Middleware runs before route handlers, ensuring authentication check happens first
- `auth.protect()` automatically redirects unauthenticated users to sign-in
- Public routes (sign-in, sign-up) explicitly excluded from protection
- API routes protected to prevent unauthorized access to chat functionality

**Implementation Pattern**:

```typescript
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

**Alternatives Considered**:

- Page-level protection: Rejected as middleware provides better security and UX (automatic redirects)
- API-only protection: Rejected as spec requires protecting chat UI route (FR-008)

**References**:

- [Protect Routes Based on Authentication Status](https://clerk.com/docs/reference/nextjs/clerk-middleware#protect-routes-based-on-authentication-status)

### 3. Authentication UI Components

**Decision**: Use Clerk's prebuilt components (SignInButton, SignUpButton, UserButton) in layout.tsx header, with optional custom sign-in/sign-up pages.

**Rationale**:

- Prebuilt components provide consistent UX and reduce implementation time
- Account Portal (default) handles all authentication flows
- Can customize later with custom pages if needed
- UserButton provides profile management and sign-out functionality
- Components automatically handle authentication state (SignedIn/SignedOut)

**Implementation Pattern**:

```typescript
<header>
  <SignedOut>
    <SignInButton />
    <SignUpButton />
  </SignedOut>
  <SignedIn>
    <UserButton />
  </SignedIn>
</header>
```

**Alternatives Considered**:

- Fully custom authentication UI: Rejected for MVP as it adds complexity without immediate value
- Inline forms: Rejected as Account Portal provides better UX and security

**References**:

- [Clerk Components Overview](https://clerk.com/docs/nextjs/reference/components/overview)
- [Custom Sign-In Page Guide](https://clerk.com/docs/nextjs/guides/development/custom-sign-in-or-up-page)

### 4. Role-Based Access Control (RBAC)

**Decision**: Use Clerk's organization/role features or custom metadata to implement User/Admin roles.

**Rationale**:

- Clerk supports role-based access control through organizations or user metadata
- Can assign roles via Clerk dashboard or API
- Roles accessible in middleware and components via `auth().orgRole` or `auth().sessionClaims`
- Default role assignment (User) can be set during user creation

**Implementation Options**:

1. **Organizations** (if multi-tenant needed): Use Clerk organizations with roles
2. **User Metadata** (simpler for single-tenant): Store role in `publicMetadata` or `privateMetadata`
3. **Custom Claims** (most flexible): Use Clerk's custom session claims

**Recommended**: User Metadata for simplicity (single-tenant app):

- Store role in `publicMetadata.role` (accessible client-side)
- Default to "user" role on registration
- Admin role assigned via Clerk dashboard or API

**Alternatives Considered**:

- Database-backed roles: Rejected as Clerk provides built-in role management
- JWT-based custom roles: Rejected as Clerk handles this more securely

**References**:

- [Clerk Organizations and Roles](https://clerk.com/docs/organizations/overview)
- [User Metadata](https://clerk.com/docs/users/metadata)

### 5. Email Verification and Limited Access

**Decision**: Use Clerk's email verification feature with conditional access based on `emailVerified` status.

**Rationale**:

- Clerk tracks email verification status automatically
- Can check `user.emailVerified` in components and middleware
- Limited access can be enforced by checking verification status before allowing sensitive operations
- Email verification flow handled by Clerk automatically

**Implementation Pattern**:

```typescript
// In component or middleware
const { userId, emailVerified } = auth();
if (!emailVerified) {
  // Show limited access or redirect to verification prompt
}
```

**Alternatives Considered**:

- Custom email verification: Rejected as Clerk provides this feature
- No verification requirement: Rejected per spec (FR-003)

**References**:

- [Clerk Email Verification](https://clerk.com/docs/users/email-addresses)

### 6. Session Management

**Decision**: Rely on Clerk's built-in session management with 30-minute inactivity timeout.

**Rationale**:

- Clerk handles session tokens, expiration, and refresh automatically
- Session timeout configurable in Clerk dashboard
- Sessions persist across page refreshes (per FR-006)
- No custom session management code needed

**Configuration**:

- Set session timeout to 30 minutes in Clerk dashboard
- Clerk automatically handles session expiration and re-authentication prompts

**Alternatives Considered**:

- Custom session management: Rejected as Clerk provides this securely
- Longer/shorter timeout: Rejected per spec clarification (30 minutes)

**References**:

- [Clerk Session Management](https://clerk.com/docs/sessions/overview)

### 7. API Route Protection

**Decision**: Protect `/api/chat` route using middleware `auth.protect()` and verify authentication in route handler.

**Rationale**:

- Middleware protection ensures API routes are inaccessible without authentication
- Additional verification in route handler provides defense-in-depth
- Can access user ID and session in API routes via `auth()` helper

**Implementation Pattern**:

```typescript
// middleware.ts protects /api/chat
// In route handler:
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... rest of handler
}
```

**Alternatives Considered**:

- Middleware-only protection: Accepted but adding route-level check provides better error messages
- No API protection: Rejected per spec (FR-008)

**References**:

- [Protect API Routes](https://clerk.com/docs/nextjs/guides/api-routes)

### 8. Account Deactivation Handling

**Decision**: Clerk automatically handles deactivated/suspended accounts - check `user.banned` or `user.locked` status.

**Rationale**:

- Clerk tracks account status (banned, locked) automatically
- Sign-in attempts automatically fail for deactivated accounts
- Can check status in middleware or components to show appropriate error messages
- Error messages provided by Clerk are user-friendly

**Implementation**:

- Clerk middleware automatically blocks deactivated accounts
- Custom error handling can check `user.banned` or `user.locked` for specific messaging

**Alternatives Considered**:

- Custom account status tracking: Rejected as Clerk provides this
- Ignore deactivation: Rejected per spec (FR-015)

**References**:

- [Clerk User Status](https://clerk.com/docs/users/user-status)

## Integration Points

### Existing Chat Application

**Current State**:

- Chat page (`app/page.tsx`) is currently public
- Chat API route (`app/api/chat/route.ts`) is currently public
- ClerkProvider exists in `layout.tsx` but no UI components
- Middleware exists but doesn't protect chat route

**Required Changes**:

1. Update `middleware.ts` to protect `/` and `/api/chat`
2. Add Clerk components to `layout.tsx` header
3. Update `app/page.tsx` to check authentication (optional, middleware handles redirect)
4. Update `app/api/chat/route.ts` to verify authentication (defense-in-depth)

### Environment Variables

**Required** (already configured per user):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Public key for client-side
- `CLERK_SECRET_KEY` - Secret key for server-side

**Optional**:

- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Custom sign-in URL (default: `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Custom sign-up URL (default: `/sign-up`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - Redirect after sign-in (default: `/`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - Redirect after sign-up (default: `/`)

## Security Considerations

1. **Credential Storage**: Clerk handles all credential storage securely (FR-016)
2. **Rate Limiting**: Clerk provides built-in rate limiting (FR-018)
3. **Session Security**: Clerk manages secure session tokens
4. **HTTPS**: Required for production (assumed per spec)
5. **API Key Protection**: Server-side keys never exposed to client

## Performance Considerations

1. **Middleware Overhead**: Minimal - Clerk middleware is optimized
2. **Session Checks**: Fast - uses JWT tokens, no database queries
3. **Component Rendering**: Conditional rendering (SignedIn/SignedOut) is efficient
4. **API Route Protection**: Middleware check happens before route handler execution

## Testing Strategy

1. **Manual Testing**:
   - Sign-up flow with email/password
   - Sign-in flow
   - Sign-out flow
   - Protected route access (authenticated vs unauthenticated)
   - Email verification flow
   - Role-based access (User vs Admin)

2. **Integration Testing**:
   - Middleware protection of routes
   - API route authentication
   - Session persistence across refreshes

3. **E2E Testing** (recommended):
   - Complete user journey: sign-up → verify email → chat
   - Session timeout behavior
   - Account deactivation handling

## Open Questions Resolved

1. ✅ **User Roles**: Standard roles (Admin, User) with basic permission differentiation
2. ✅ **Email Verification Access**: Limited access until verified
3. ✅ **Rate Limiting**: Rely on Clerk's built-in rate limiting
4. ✅ **Session Timeout**: 30 minutes of inactivity
5. ✅ **Account Deactivation**: Clear error message, deny access completely

## Next Steps

1. Implement middleware route protection
2. Add Clerk UI components to layout
3. Update chat page to handle authentication state
4. Protect API routes
5. Configure roles in Clerk dashboard
6. Test authentication flows
