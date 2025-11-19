# Data Model: Page Reorganization

**Feature**: Page Reorganization  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This feature primarily involves client-side state management for the chat widget and navigation structure. No new server-side data models are required. The data model focuses on widget state persistence and chat history management.

## Entities

### WidgetState

Represents the open/closed state and chat history of the AI chat widget.

**Attributes**:
- `isOpen: boolean` - Whether the widget panel is currently open
- `messages: Message[]` - Array of chat messages
- `lastUpdated: number` - Timestamp of last state update (for cleanup)

**Storage**: localStorage  
**Key Format**: `chat-widget-state-${userId}` or `chat-widget-state` (if userId unavailable)

**Validation Rules**:
- `isOpen` must be boolean
- `messages` must be array of valid Message objects
- `lastUpdated` must be valid timestamp

**State Transitions**:
- Closed → Open: User clicks widget icon
- Open → Closed: User clicks close button or outside widget
- Messages added: User sends message or receives response

### Message

Represents a single chat message in the conversation history.

**Attributes**:
- `id: string` - Unique message identifier
- `role: 'user' | 'assistant'` - Message sender role
- `content: string` - Message text content
- `timestamp: number` - Message creation timestamp
- `parts?: MessagePart[]` - Optional message parts (for complex messages)

**Storage**: Part of WidgetState.messages array

**Validation Rules**:
- `id` must be non-empty string
- `role` must be 'user' or 'assistant'
- `content` must be non-empty string
- `timestamp` must be valid number

### NavigationItem

Represents a navigation menu item in the application header.

**Attributes**:
- `label: string` - Display text for navigation item
- `href: string` - Target route path
- `visible: boolean` - Whether item is visible (based on auth state)
- `external?: boolean` - Whether link is external (for "powered by" links)

**Storage**: In-memory (defined in layout component)

**Validation Rules**:
- `label` must be non-empty string
- `href` must be valid URL path or external URL
- `visible` must be boolean

### PageRoute

Represents a page route configuration.

**Attributes**:
- `path: string` - URL path
- `component: string` - Component file path
- `requiresAuth: boolean` - Whether authentication is required
- `redirect?: string` - Optional redirect path

**Storage**: File system (Next.js routing)

**Validation Rules**:
- `path` must be valid route path
- `component` must exist in file system
- `requiresAuth` must be boolean

## Relationships

```
WidgetState
  └─ contains → Message[] (one-to-many)

NavigationItem
  └─ references → PageRoute (many-to-one via href)
```

## State Management

### Widget State Flow

1. **Initialization**
   - Check localStorage for existing state
   - If found and valid, restore state
   - If not found, initialize with `{ isOpen: false, messages: [] }`

2. **State Updates**
   - User interactions update React state
   - State changes trigger localStorage sync (debounced)
   - State persists across page navigation

3. **Cleanup**
   - On browser close, localStorage persists (by design)
   - Optional: Clean up old state entries (> 30 days)

### Chat History Flow

1. **Message Creation**
   - User sends message → Add to messages array
   - AI responds → Add to messages array
   - Update WidgetState.lastUpdated

2. **Persistence**
   - Messages stored in WidgetState.messages
   - Synced to localStorage on change
   - Persists across page navigation

3. **Retrieval**
   - On widget open, load messages from WidgetState
   - Display in chronological order
   - Handle empty state gracefully

## Data Validation

### WidgetState Validation

```typescript
function validateWidgetState(state: unknown): state is WidgetState {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof (state as WidgetState).isOpen === 'boolean' &&
    Array.isArray((state as WidgetState).messages) &&
    typeof (state as WidgetState).lastUpdated === 'number'
  );
}
```

### Message Validation

```typescript
function validateMessage(message: unknown): message is Message {
  return (
    typeof message === 'object' &&
    message !== null &&
    typeof (message as Message).id === 'string' &&
    ['user', 'assistant'].includes((message as Message).role) &&
    typeof (message as Message).content === 'string' &&
    typeof (message as Message).timestamp === 'number'
  );
}
```

## Storage Strategy

### localStorage Structure

```json
{
  "chat-widget-state": {
    "isOpen": false,
    "messages": [
      {
        "id": "msg-1",
        "role": "user",
        "content": "Hello",
        "timestamp": 1706380800000
      },
      {
        "id": "msg-2",
        "role": "assistant",
        "content": "Hi! How can I help?",
        "timestamp": 1706380801000
      }
    ],
    "lastUpdated": 1706380801000
  }
}
```

### Storage Limits

- **Max Messages**: 100 messages per session (prevent storage bloat)
- **Max Storage Size**: ~5MB (localStorage limit varies by browser)
- **Cleanup Strategy**: Remove oldest messages when limit reached

### Error Handling

- **Quota Exceeded**: Show user-friendly error, disable persistence
- **Invalid Data**: Reset to default state, log error
- **Storage Unavailable**: Fall back to in-memory state only

## Migration Considerations

### Existing Chat State

- Old chat page state: No migration needed (in-memory only)
- Chat API: No changes required (stateless)

### Route Changes

- `/` (old chat) → `/` (new Stock Images)
- `/images-hub` → `/` (redirect or direct move)
- `/r2-images` → Unchanged

## TypeScript Types

```typescript
export interface WidgetState {
  isOpen: boolean;
  messages: Message[];
  lastUpdated: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  parts?: MessagePart[];
}

export interface MessagePart {
  type: 'text' | 'image' | 'tool';
  text?: string;
  // ... other part types
}

export interface NavigationItem {
  label: string;
  href: string;
  visible: boolean;
  external?: boolean;
}

export interface PageRoute {
  path: string;
  component: string;
  requiresAuth: boolean;
  redirect?: string;
}
```

## Constraints

1. **Widget State**
   - Must persist across page navigation
   - Must clear on browser close (browser session)
   - Must be independent per browser tab

2. **Chat History**
   - Maximum 100 messages per session
   - Must serialize/deserialize correctly
   - Must handle malformed data gracefully

3. **Storage**
   - localStorage may not be available (private browsing, disabled)
   - Must provide fallback to in-memory state
   - Must handle quota exceeded errors

4. **Performance**
   - localStorage reads/writes must be debounced
   - State updates must not block UI
   - Large message arrays must be handled efficiently

