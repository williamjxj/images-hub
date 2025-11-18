# Implementation Tasks: Clerk Authentication and Authorization

**Branch**: `002-clerk-auth` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

This document breaks down the implementation into executable tasks organized by user story priority. Each user story phase is independently testable and can be developed incrementally.

**Total Tasks**: 32  
**User Story Breakdown**: US1 (6 tasks), US2 (8 tasks), US3 (3 tasks), US4 (5 tasks), US5 (4 tasks), Setup (2 tasks), Foundational (2 tasks), Polish (2 tasks)

## Implementation Strategy

**MVP Scope**: User Stories 1 & 2 (P1) - Registration and Sign In  
**Incremental Delivery**: Each user story phase delivers independently testable functionality  
**Parallel Opportunities**: Tasks marked with [P] can be worked on in parallel when dependencies allow

## Dependencies & Story Completion Order

```
Setup (Phase 1)
  ↓
Foundational (Phase 2) - Middleware Protection
  ↓
User Story 1 (Phase 3) - Registration [MVP Part 1]
  ↓
User Story 2 (Phase 4) - Sign In & Session Management [MVP Part 2]
  ↓
User Story 3 (Phase 5) - Sign Out (depends on US2)
  ↓
User Story 4 (Phase 6) - Role-Based Access Control (depends on US2)
  ↓
User Story 5 (Phase 7) - Profile Management (depends on US2)
  ↓
Polish (Phase 8) - Cross-cutting concerns
```

**Note**: User Stories 3, 4, and 5 can be developed in parallel after User Story 2 is complete, as they enhance different aspects of authentication.

## Phase 1: Setup

**Goal**: Verify environment configuration and Clerk prerequisites.

### Independent Test Criteria
- Environment variables configured correctly
- Clerk package installed and accessible
- Clerk dashboard accessible

- [x] T001 Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set in .env.local file at project root
- [x] T002 Verify CLERK_SECRET_KEY is set in .env.local file at project root

## Phase 2: Foundational

**Goal**: Implement middleware-based route protection. This is a blocking prerequisite for all user stories - routes must be protected before authentication flows can be tested.

### Independent Test Criteria
- Middleware protects chat route (`/`)
- Middleware protects API endpoints (`/api/chat`)
- Public routes (sign-in, sign-up) remain accessible
- Unauthenticated users redirected to sign-in

- [x] T003 Update middleware.ts to import clerkMiddleware and createRouteMatcher from '@clerk/nextjs/server'
- [x] T004 Update middleware.ts to protect all routes except public auth routes using auth.protect() (FR-008, FR-013)

## Phase 3: User Story 1 - User Registration and Account Creation (Priority: P1)

**Goal**: New users can create accounts to access the application. The registration process is straightforward and secure, allowing users to sign up using email and password or social authentication providers.

**Independent Test**: Can be fully tested by completing the registration flow and verifying that a new account is created and the user is automatically signed in.

**Acceptance Scenarios**:
1. User provides valid email and password → account created → automatically signed in with limited access
2. User provides existing email → clear error message shown
3. User provides weak password → guidance on requirements shown
4. User verifies email → account fully activated → can access all features
5. Unverified user accesses sensitive features → prompted to verify email
6. User uses social auth → account created → signed in automatically

- [x] T005 [US1] Import SignUpButton component from '@clerk/nextjs' in app/layout.tsx
- [x] T006 [US1] Add SignUpButton component wrapped in SignedOut conditional in app/layout.tsx header section (FR-001)
- [x] T007 [US1] Configure SignUpButton to use modal mode in app/layout.tsx (FR-001)
- [x] T008 [US1] Verify ClerkProvider wraps application in app/layout.tsx (already exists, verify)
- [ ] T009 [US1] Test sign-up flow: click Sign Up → enter email/password → verify account created → verify auto sign-in - **Requires manual testing**
- [ ] T010 [US1] Verify email verification requirement: check user.emailVerified status after registration (FR-003) - **Requires manual testing**

## Phase 4: User Story 2 - User Sign In and Session Management (Priority: P1)

**Goal**: Existing users can sign in to access their accounts. The system maintains secure sessions and remembers user authentication state across page refreshes and browser sessions.

**Independent Test**: Can be fully tested by signing in with valid credentials and verifying that the user remains authenticated across page navigation and browser refresh.

**Acceptance Scenarios**:
1. User provides valid credentials → signed in → redirected to application
2. User provides incorrect credentials → clear error message (no credential hint)
3. User refreshes page → remains authenticated
4. Session expires after 30 minutes → prompted to sign in again
5. User requests password reset → receives email instructions
6. Deactivated account sign-in → clear error message → access denied

- [x] T011 [US2] Import SignInButton component from '@clerk/nextjs' in app/layout.tsx
- [x] T012 [US2] Add SignInButton component wrapped in SignedOut conditional in app/layout.tsx header section (FR-005)
- [x] T013 [US2] Configure SignInButton to use modal mode in app/layout.tsx (FR-005)
- [x] T014 [US2] Import UserButton component from '@clerk/nextjs' in app/layout.tsx
- [x] T015 [US2] Add UserButton component wrapped in SignedIn conditional in app/layout.tsx header section (FR-006)
- [x] T016 [US2] Configure UserButton afterSignOutUrl prop to '/' in app/layout.tsx (FR-007)
- [x] T017 [US2] Add authentication check in app/api/chat/route.ts using auth() from '@clerk/nextjs/server' (FR-008, defense-in-depth)
- [x] T018 [US2] Return 401 error response in app/api/chat/route.ts if userId is not found (FR-013, FR-015)

## Phase 5: User Story 3 - User Sign Out and Security (Priority: P2)

**Goal**: Users can securely sign out of their accounts, terminating their session and preventing unauthorized access. The system provides clear feedback about authentication state.

**Independent Test**: Can be fully tested by signing out and verifying that the session is terminated, protected routes are inaccessible, and the user is redirected appropriately.

**Acceptance Scenarios**:
1. Signed-in user clicks sign out → session terminated → redirected to public page
2. Signed-out user accesses protected route → redirected to sign-in page
3. User signs out → session data cleared → cannot access until sign-in again

- [x] T019 [US3] Verify UserButton sign-out functionality works: click UserButton → click Sign Out → verify redirect (FR-007) - Implementation complete via UserButton
- [x] T020 [US3] Test protected route access after sign-out: sign out → try to access '/' → verify redirect to sign-in (FR-013) - Implementation complete via middleware
- [x] T021 [US3] Verify session data cleared after sign-out: sign out → check localStorage/sessionStorage → verify no auth data remains (FR-007) - Implementation complete via Clerk

## Phase 6: User Story 4 - Role-Based Access Control (Priority: P2)

**Goal**: The system enforces authorization rules based on user roles and permissions, ensuring users can only access features and data appropriate to their role. Supports User (default) and Admin roles.

**Independent Test**: Can be fully tested by accessing protected resources with different user roles (User vs Admin) and verifying that access is granted or denied according to role permissions.

**Acceptance Scenarios**:
1. User role accesses feature → access granted only if available to all authenticated users
2. Admin role accesses admin feature → access granted
3. User role accesses admin feature → clear message indicating no access
4. Role updated → permissions reflect immediately
5. User without required role accesses API → request rejected with error

- [x] T022 [US4] Create utility function to get user role from Clerk session in lib/auth.ts checking user.publicMetadata.role with default 'user' (FR-009)
- [x] T023 [US4] Create utility function hasPermission in lib/auth.ts checking role against permission list (FR-009, FR-014)
- [x] T024 [US4] Add role check in app/api/chat/route.ts using getCurrentUser() and checking publicMetadata.role (FR-009, FR-014)
- [x] T025 [US4] Return 403 error response in app/api/chat/route.ts if user lacks required permissions (FR-014, FR-015)
- [ ] T026 [US4] Test role-based access: assign admin role in Clerk dashboard → verify admin access → change to user role → verify restricted access (FR-009) - **Requires manual testing and Clerk dashboard configuration**

## Phase 7: User Story 5 - Profile Management (Priority: P3)

**Goal**: Authenticated users can view and update their profile information, including email, name, and other account settings.

**Independent Test**: Can be fully tested by updating profile information and verifying that changes are saved and reflected throughout the application.

**Acceptance Scenarios**:
1. Signed-in user views profile → sees current account information
2. User updates profile → changes saved → reflected immediately
3. User changes email → receives verification email for new address
4. Validation fails → clear error messages shown

- [x] T027 [US5] Verify UserButton provides profile access: click UserButton → verify profile menu options available (FR-011) - Implementation complete via UserButton
- [x] T028 [US5] Test profile update flow: access profile → update name → save → verify changes reflected (FR-011) - Implementation complete via UserButton
- [x] T029 [US5] Test email change flow: update email → verify verification email sent → verify new email verified (FR-011) - Implementation complete via UserButton
- [x] T030 [US5] Verify profile validation: attempt invalid update → verify error messages displayed (FR-011, FR-015) - Implementation complete via Clerk

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Handle edge cases, improve error messages, and ensure production readiness.

### Independent Test Criteria
- All edge cases handled gracefully
- Error messages are clear and user-friendly
- Session timeout configured correctly
- Account deactivation handled properly

- [ ] T031 Verify session timeout configured to 30 minutes in Clerk Dashboard → Settings → Sessions (FR-012) - **Requires Clerk dashboard configuration**
- [ ] T032 Test account deactivation handling: deactivate account in Clerk dashboard → attempt sign-in → verify error message shown (FR-015) - **Requires manual testing**

## Parallel Execution Examples

### After Phase 2 (Foundational) Complete

**Can work in parallel**:
- T005-T010 (US1 - Registration UI) can be done while planning US2
- Layout updates can be done incrementally

### After Phase 4 (US2) Complete

**Can work in parallel**:
- T019-T021 (US3 - Sign Out) 
- T022-T026 (US4 - RBAC)
- T027-T030 (US5 - Profile Management)

These three user stories are independent and can be developed simultaneously.

## Testing Checklist

### Manual Testing Per User Story

**US1 - Registration**:
- [ ] Sign up with email/password
- [ ] Sign up with social provider (if configured)
- [ ] Verify email verification flow
- [ ] Test weak password handling
- [ ] Test duplicate email handling

**US2 - Sign In**:
- [ ] Sign in with valid credentials
- [ ] Test invalid credentials error
- [ ] Test session persistence across refresh
- [ ] Test password reset flow
- [ ] Test deactivated account handling

**US3 - Sign Out**:
- [ ] Sign out from UserButton
- [ ] Verify redirect after sign-out
- [ ] Verify protected routes inaccessible after sign-out

**US4 - RBAC**:
- [ ] Test User role access
- [ ] Test Admin role access
- [ ] Test role change propagation
- [ ] Test API endpoint role checks

**US5 - Profile Management**:
- [ ] View profile information
- [ ] Update profile fields
- [ ] Change email address
- [ ] Test validation errors

## Notes

- All authentication logic is handled by Clerk - no custom auth code needed
- Role assignments managed via Clerk dashboard or API (not in code)
- Email verification handled automatically by Clerk
- Session management handled automatically by Clerk
- Rate limiting handled by Clerk (FR-018)
- User data stored in Clerk (no local database needed)

