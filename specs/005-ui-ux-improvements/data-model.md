# Data Model: UI/UX Improvements

**Feature**: UI/UX Improvements  
**Date**: 2025-01-27  
**Phase**: 1 - Design

## Overview

This document defines the data models for UI/UX improvement features including search history, user feedback, keyboard shortcut preferences, and theme preferences. Most data is stored client-side in localStorage, with feedback submitted via email (no database storage).

## Entities

### Search History Entry

**Storage**: localStorage (key: `search-history-{userId}`)  
**Access**: Via `useSearchHistory` hook

**Description**: Represents a previously executed search query by an authenticated user. Used to display recent searches and enable quick re-searching.

**Attributes**:

| Attribute     | Type   | Description                                | Constraints                        |
| ------------- | ------ | ------------------------------------------ | ---------------------------------- |
| `query`       | string | The search query text                      | Required, max 200 chars, trimmed   |
| `timestamp`   | number | Unix timestamp of when search was executed | Required, milliseconds since epoch |
| `resultCount` | number | Optional number of results found           | Optional, for future use           |

**Relationships**:

- Belongs to User (via userId in storage key)
- No direct database relationship (localStorage only)

**Validation Rules**:

- Query must be non-empty after trimming
- Maximum 10 entries per user (oldest removed when limit exceeded)
- Duplicate queries moved to top of history (most recent first)
- Only stored for authenticated users

**State Transitions**:

```
[New Search] → [Add to History] → [Update Order if Duplicate] → [Trim to 10 Entries]
```

**Storage Format**:

```typescript
// localStorage value (JSON array)
[
  { query: "sunset", timestamp: 1706380800000 },
  { query: "mountains", timestamp: 1706377200000 },
  // ... up to 10 entries
];
```

### User Feedback

**Storage**: Email only (sent to service@bestitconsulting.ca), no database  
**Access**: Via feedback form submission

**Description**: Represents feedback submitted by users including error reports, feature requests, and general feedback.

**Attributes**:

| Attribute      | Type     | Description                      | Constraints                                                               |
| -------------- | -------- | -------------------------------- | ------------------------------------------------------------------------- |
| `type`         | string   | Feedback type                    | Required, one of: "error", "feature-request", "general", "helpful-prompt" |
| `description`  | string   | User's feedback description      | Required, max 2000 chars                                                  |
| `userId`       | string   | Clerk user ID (if authenticated) | Optional, from auth context                                               |
| `userEmail`    | string   | User's email (optional)          | Optional, max 255 chars, email format                                     |
| `pageUrl`      | string   | URL where feedback was submitted | Required, auto-captured                                                   |
| `userActions`  | string[] | Array of recent user actions     | Optional, for context                                                     |
| `errorDetails` | object   | Error details if type is "error" | Optional, includes error message, stack trace                             |
| `browserInfo`  | object   | Browser and device information   | Optional, includes user agent, viewport size                              |
| `timestamp`    | number   | Unix timestamp of submission     | Required, milliseconds since epoch                                        |

**Relationships**:

- Associated with User (via userId if authenticated)
- No database relationship (email-only)

**Validation Rules**:

- Type must be one of the allowed values
- Description required and non-empty
- Email format validated if provided
- Page URL auto-captured from window.location
- Error details only included for error type feedback

**Email Format**:

```typescript
{
  from: 'feedback@yourdomain.com',
  to: 'service@bestitconsulting.ca',
  subject: `Feedback: ${type} - ${new Date(timestamp).toLocaleString()}`,
  html: `
    <h2>Feedback Type: ${type}</h2>
    <p><strong>Description:</strong></p>
    <p>${description}</p>
    <p><strong>User:</strong> ${userId || 'Anonymous'} ${userEmail ? `(${userEmail})` : ''}</p>
    <p><strong>Page:</strong> ${pageUrl}</p>
    ${errorDetails ? `<p><strong>Error:</strong> ${JSON.stringify(errorDetails, null, 2)}</p>` : ''}
    <p><strong>Browser:</strong> ${JSON.stringify(browserInfo, null, 2)}</p>
    <p><strong>Timestamp:</strong> ${new Date(timestamp).toISOString()}</p>
  `
}
```

### Keyboard Shortcut Configuration

**Storage**: In-memory (component state), no persistence  
**Access**: Via `useKeyboardShortcuts` hook

**Description**: Represents the mapping of keyboard shortcuts to actions. Used to manage shortcut behavior and display in help dialog.

**Attributes**:

| Attribute        | Type     | Description                                        | Constraints                                          |
| ---------------- | -------- | -------------------------------------------------- | ---------------------------------------------------- |
| `key`            | string   | Key combination (e.g., "/", "Escape", "ArrowLeft") | Required                                             |
| `modifiers`      | string[] | Modifier keys (e.g., ["Meta", "Control"])          | Optional, array of "Meta", "Control", "Alt", "Shift" |
| `action`         | string   | Action identifier                                  | Required, e.g., "focus-search", "close-modal"        |
| `description`    | string   | Human-readable description                         | Required, for help dialog                            |
| `condition`      | function | Optional condition function                        | Optional, returns boolean                            |
| `preventDefault` | boolean  | Whether to prevent default browser behavior        | Default: true                                        |

**Relationships**:

- No persistence (in-memory only)
- Used by KeyboardShortcutsProvider

**Shortcut Definitions**:

```typescript
const SHORTCUTS: KeyboardShortcut[] = [
  {
    key: "/",
    action: "focus-search",
    description: "Focus search input",
    condition: () => window.location.pathname === "/",
  },
  {
    key: "Escape",
    action: "close-modal",
    description: "Close modal or dialog",
  },
  {
    key: "ArrowLeft",
    action: "navigate-image-prev",
    description: "Navigate to previous image",
    condition: () => isImageModalOpen(),
  },
  {
    key: "ArrowRight",
    action: "navigate-image-next",
    description: "Navigate to next image",
    condition: () => isImageModalOpen(),
  },
  {
    key: "/",
    modifiers: ["Meta", "Control"],
    action: "show-shortcuts-help",
    description: "Show keyboard shortcuts help",
  },
];
```

### Theme Preference

**Storage**: localStorage (key: `theme-preference`)  
**Access**: Via `next-themes` library

**Description**: Represents user's theme preference (light, dark, or system).

**Attributes**:

| Attribute       | Type   | Description                    | Constraints                                 |
| --------------- | ------ | ------------------------------ | ------------------------------------------- |
| `theme`         | string | Theme value                    | Required, one of: "light", "dark", "system" |
| `resolvedTheme` | string | Resolved theme (light or dark) | Computed, "light" or "dark"                 |

**Relationships**:

- Managed by next-themes library
- Persisted in localStorage automatically

**Storage Format**:

```typescript
// Managed by next-themes, stored as:
localStorage.setItem("theme-preference", "dark"); // or 'light' or 'system'
```

### Popular Searches (Fallback)

**Storage**: Static array in code (can be moved to config file later)  
**Access**: Via `useSearchSuggestions` hook

**Description**: Static list of popular search terms used as fallback when user has no recent search history.

**Attributes**:

| Attribute  | Type   | Description                                    |
| ---------- | ------ | ---------------------------------------------- |
| `term`     | string | Popular search term                            |
| `category` | string | Optional category (e.g., "nature", "business") |

**Default Popular Searches**:

```typescript
const POPULAR_SEARCHES = [
  "nature",
  "business",
  "technology",
  "people",
  "architecture",
  "travel",
  "food",
  "animals",
  "abstract",
  "landscape",
  "city",
  "ocean",
  "sunset",
  "mountains",
  "flowers",
];
```

## Data Flow

### Search History Flow

```
User performs search
  → useImageSearch hook executes search
  → useSearchHistory hook adds to history
  → localStorage updated with new entry
  → History trimmed to 10 entries
  → UI updates to show new history
```

### Feedback Submission Flow

```
User submits feedback form
  → Form validation
  → Context captured (page URL, user actions, error details)
  → POST /api/feedback
  → API route formats email
  → Email sent to service@bestitconsulting.ca
  → Success confirmation shown to user
  → No database storage (email only)
```

### Theme Preference Flow

```
User toggles theme
  → ThemeToggle component calls next-themes setTheme()
  → next-themes updates localStorage
  → CSS variables updated
  → Smooth transition applied
  → Preference persists across sessions
```

## Migration Considerations

**Future Enhancements** (not in current scope):

- Search history could be migrated to backend database for cross-device sync
- Feedback could be stored in database for better tracking and analytics
- Popular searches could be dynamic based on actual usage analytics
- Keyboard shortcut preferences could be user-customizable (currently fixed)

## Validation Summary

- **Search History**: Max 10 entries, authenticated users only, localStorage
- **User Feedback**: Email-only, no database, auto-captured context
- **Keyboard Shortcuts**: In-memory configuration, no persistence
- **Theme Preference**: Managed by next-themes, localStorage persistence
- **Popular Searches**: Static array, can be enhanced later
