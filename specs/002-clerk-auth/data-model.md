# Data Model: Clerk Authentication and Authorization

**Feature**: Clerk Authentication and Authorization  
**Date**: 2025-01-27  
**Phase**: 1 - Design

## Overview

This document defines the data model for authentication and authorization entities. All user data is managed by Clerk - this document describes the conceptual model and how it maps to Clerk's data structures.

## Entities

### User Account

**Managed By**: Clerk  
**Storage**: Clerk's user database  
**Access**: Via Clerk SDK (`auth()`, `currentUser()`, etc.)

**Description**: Represents a user's identity in the system, containing authentication credentials, profile information, and role assignments.

**Attributes**:

| Attribute             | Type      | Description                                     | Source          |
| --------------------- | --------- | ----------------------------------------------- | --------------- |
| `id`                  | string    | Unique user identifier (Clerk user ID)          | Clerk           |
| `emailAddresses`      | array     | Array of email addresses (primary + additional) | Clerk           |
| `primaryEmailAddress` | string    | Primary email address                           | Clerk           |
| `emailVerified`       | boolean   | Whether primary email is verified               | Clerk           |
| `firstName`           | string    | User's first name (optional)                    | Clerk           |
| `lastName`            | string    | User's last name (optional)                     | Clerk           |
| `imageUrl`            | string    | User's profile image URL                        | Clerk           |
| `createdAt`           | timestamp | Account creation timestamp                      | Clerk           |
| `updatedAt`           | timestamp | Last update timestamp                           | Clerk           |
| `lastSignInAt`        | timestamp | Last sign-in timestamp                          | Clerk           |
| `banned`              | boolean   | Whether account is banned                       | Clerk           |
| `locked`              | boolean   | Whether account is locked                       | Clerk           |
| `role`                | string    | User role: "user" or "admin"                    | Custom metadata |
| `publicMetadata`      | object    | Public metadata (includes role)                 | Clerk           |
| `privateMetadata`     | object    | Private metadata                                | Clerk           |

**Relationships**:

- Has many Sessions (one-to-many)
- Has one Role (many-to-one, via metadata)
- Has many Permissions (many-to-many, via role)

**Validation Rules**:

- Email addresses must be valid format (enforced by Clerk)
- Primary email must be unique (enforced by Clerk)
- Role must be "user" or "admin" (application-level validation)
- Default role is "user" for new accounts

**State Transitions**:

```
[New User] → [Email Verification Pending] → [Email Verified] → [Active]
                                      ↓
                                 [Banned/Locked]
```

### Session

**Managed By**: Clerk  
**Storage**: Clerk's session storage (JWT tokens)  
**Access**: Via Clerk SDK (`auth()`, session tokens)

**Description**: Represents an active authenticated state for a user, including session tokens, expiration time, and associated metadata.

**Attributes**:

| Attribute      | Type      | Description                          | Source    |
| -------------- | --------- | ------------------------------------ | --------- | ----- |
| `sessionId`    | string    | Unique session identifier            | Clerk     |
| `userId`       | string    | Associated user ID                   | Clerk     |
| `expiresAt`    | timestamp | Session expiration timestamp         | Clerk     |
| `lastActiveAt` | timestamp | Last activity timestamp              | Clerk     |
| `token`        | string    | Session JWT token (server-side only) | Clerk     |
| `status`       | string    | Session status: "active"             | "expired" | Clerk |

**Relationships**:

- Belongs to User Account (many-to-one)

**Validation Rules**:

- Session expires after 30 minutes of inactivity (configurable in Clerk)
- Sessions are automatically refreshed on activity
- Expired sessions require re-authentication

**State Transitions**:

```
[Created] → [Active] → [Expired] → [Requires Re-authentication]
```

### Role

**Managed By**: Application (stored in Clerk user metadata)  
**Storage**: Clerk `publicMetadata.role`  
**Access**: Via Clerk SDK (`auth().sessionClaims`, `currentUser().publicMetadata`)

**Description**: Represents a user's permission level or category, determining what features and data they can access.

**Supported Roles**:

| Role    | Description                 | Default | Permissions                                       |
| ------- | --------------------------- | ------- | ------------------------------------------------- |
| `user`  | Standard authenticated user | Yes     | Access to chat features, basic profile management |
| `admin` | Administrative user         | No      | All user permissions + administrative features    |

**Attributes**:

| Attribute     | Type   | Description                  | Source            |
| ------------- | ------ | ---------------------------- | ----------------- |
| `name`        | string | Role name: "user" or "admin" | Application       |
| `permissions` | array  | List of permission strings   | Application logic |

**Relationships**:

- Has many User Accounts (one-to-many, via metadata)
- Has many Permissions (many-to-many)

**Validation Rules**:

- Role must be one of: "user", "admin"
- Default role is "user"
- Role changes take effect immediately (no session refresh needed)

**State Transitions**:

```
[Assigned] → [Active] → [Changed] → [New Role Active]
```

### Permission

**Managed By**: Application (logic-based)  
**Storage**: Application code (not stored in database)  
**Access**: Via application logic checking role

**Description**: Represents a specific access right or capability that can be granted to roles or individual users.

**Permission List**:

| Permission     | Description           | Roles       |
| -------------- | --------------------- | ----------- |
| `chat:access`  | Access chat interface | user, admin |
| `chat:send`    | Send chat messages    | user, admin |
| `profile:view` | View own profile      | user, admin |
| `profile:edit` | Edit own profile      | user, admin |
| `admin:access` | Access admin features | admin       |
| `admin:users`  | Manage users          | admin       |

**Attributes**:

| Attribute     | Type   | Description                     | Source      |
| ------------- | ------ | ------------------------------- | ----------- |
| `name`        | string | Permission identifier           | Application |
| `description` | string | Human-readable description      | Application |
| `roles`       | array  | Roles that have this permission | Application |

**Relationships**:

- Belongs to many Roles (many-to-many)

**Validation Rules**:

- Permissions are checked at runtime
- Admin role has all permissions
- User role has basic permissions only

## Data Flow

### User Registration Flow

```
1. User submits sign-up form (email + password)
2. Clerk creates user account with:
   - emailAddresses: [email]
   - emailVerified: false
   - publicMetadata: { role: "user" }
   - banned: false
   - locked: false
3. Clerk sends verification email
4. User clicks verification link
5. Clerk updates: emailVerified: true
6. User can now access all features
```

### User Sign-In Flow

```
1. User submits sign-in form (email + password)
2. Clerk validates credentials
3. Clerk creates session:
   - sessionId: generated
   - userId: user.id
   - expiresAt: now + 30 minutes
   - token: JWT token
4. Session stored in Clerk
5. User redirected to chat page
```

### Role Assignment Flow

```
1. Admin assigns role via Clerk dashboard or API
2. Update user.publicMetadata.role = "admin"
3. Clerk updates session claims
4. Next request includes new role in session
5. User immediately has admin permissions
```

## Clerk Data Mapping

### User Object (from Clerk SDK)

```typescript
{
  id: "user_xxx",
  emailAddresses: [
    {
      id: "idn_xxx",
      emailAddress: "user@example.com",
      verification: {
        status: "verified"
      }
    }
  ],
  primaryEmailAddressId: "idn_xxx",
  firstName: "John",
  lastName: "Doe",
  imageUrl: "https://...",
  publicMetadata: {
    role: "user"  // Custom: our role
  },
  createdAt: 1234567890,
  updatedAt: 1234567890,
  lastSignInAt: 1234567890,
  banned: false,
  locked: false
}
```

### Session Object (from Clerk SDK)

```typescript
{
  id: "sess_xxx",
  userId: "user_xxx",
  status: "active",
  lastActiveAt: 1234567890,
  expireAt: 1234567890,
  // Token available server-side only
}
```

## Access Patterns

### Reading User Data

**Client-Side**:

```typescript
import { useUser } from "@clerk/nextjs";

const { user } = useUser();
const role = user?.publicMetadata?.role || "user";
const emailVerified =
  user?.emailAddresses[0]?.verification?.status === "verified";
```

**Server-Side**:

```typescript
import { auth, currentUser } from "@clerk/nextjs/server";

const { userId } = auth();
const user = await currentUser();
const role = user?.publicMetadata?.role || "user";
```

### Checking Permissions

```typescript
function hasPermission(userRole: string, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    user: ["chat:access", "chat:send", "profile:view", "profile:edit"],
    admin: [
      "chat:access",
      "chat:send",
      "profile:view",
      "profile:edit",
      "admin:access",
      "admin:users",
    ],
  };

  return rolePermissions[userRole]?.includes(permission) || false;
}
```

## Constraints

1. **Email Uniqueness**: Enforced by Clerk - each email can only be associated with one account
2. **Role Validation**: Application must validate role is "user" or "admin"
3. **Session Expiration**: 30 minutes of inactivity (configurable in Clerk dashboard)
4. **Email Verification**: Required for full access (enforced by application logic)
5. **Account Status**: Banned/locked accounts cannot sign in (enforced by Clerk)

## Notes

- All user data is stored and managed by Clerk
- No local database required for authentication data
- Role assignments stored in Clerk `publicMetadata`
- Sessions managed entirely by Clerk (JWT tokens)
- No direct database access needed - all via Clerk SDK
