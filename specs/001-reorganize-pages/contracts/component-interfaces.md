# Component Interfaces: Page Reorganization

**Feature**: Page Reorganization  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the component interfaces and props for the new chat widget components and updated navigation components. No new API contracts are required as the widget uses the existing `/api/chat` endpoint.

## Component Contracts

### ChatWidget

Main widget container component that manages widget state and renders icon/panel.

**Props**:

```typescript
interface ChatWidgetProps {
  className?: string;
  position?: "bottom-right" | "bottom-left";
  icon?: string; // Path to icon image
}
```

**Behavior**:

- Renders widget icon when closed
- Renders chat panel when open
- Manages open/close state
- Persists state to localStorage
- Provides context to child components

**Accessibility**:

- ARIA label: "AI Assistant Chat Widget"
- Keyboard accessible (Tab to focus, Enter to toggle)
- Focus trap when open

### ChatWidgetIcon

Widget trigger button that displays the prompt icon.

**Props**:

```typescript
interface ChatWidgetIconProps {
  onClick: () => void;
  isOpen: boolean;
  icon: string; // Path to angel.webp
  className?: string;
}
```

**Behavior**:

- Displays icon image
- Shows open/close state visually
- Handles click to toggle widget
- Animates on state change

**Accessibility**:

- ARIA label: "Open AI Assistant" or "Close AI Assistant"
- Button role
- Keyboard accessible

### ChatWidgetPanel

Chat interface panel that contains the chat UI.

**Props**:

```typescript
interface ChatWidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}
```

**Behavior**:

- Renders chat messages
- Handles message input
- Manages chat state via useChat hook
- Displays loading/error states
- Scrolls to latest message

**Accessibility**:

- ARIA label: "AI Assistant Chat"
- Focus trap when open
- Keyboard navigation support
- Screen reader announcements

### ChatWidgetProvider

React Context provider for widget state management.

**Props**:

```typescript
interface ChatWidgetProviderProps {
  children: React.ReactNode;
  storageKey?: string;
}
```

**Context Value**:

```typescript
interface ChatWidgetContextValue {
  isOpen: boolean;
  messages: Message[];
  openWidget: () => void;
  closeWidget: () => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}
```

**Behavior**:

- Manages widget state
- Syncs to localStorage
- Provides state and actions to children
- Handles storage errors gracefully

### ImageSkeleton

Loading placeholder component for images.

**Props**:

```typescript
interface ImageSkeletonProps {
  aspectRatio?: "square" | "landscape" | "portrait" | number;
  className?: string;
  animated?: boolean;
}
```

**Behavior**:

- Displays skeleton placeholder
- Supports different aspect ratios
- Optional shimmer animation
- Fades out when image loads

**Accessibility**:

- ARIA label: "Loading image"
- Hidden from screen readers when image loads

### NavigationHeader

Updated navigation header component.

**Props**:

```typescript
interface NavigationHeaderProps {
  currentPath?: string;
  showCloudflareLink?: boolean;
  showPoweredBy?: boolean;
}
```

**Behavior**:

- Renders navigation links
- Highlights current route
- Shows/hides links based on auth state
- Includes "Powered by" links

**Accessibility**:

- Semantic nav element
- ARIA labels for links
- Keyboard navigation support

## Hook Contracts

### useChatWidget

Custom hook for widget state management.

**Returns**:

```typescript
interface UseChatWidgetReturn {
  isOpen: boolean;
  messages: Message[];
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  isLoading: boolean;
}
```

**Behavior**:

- Manages widget open/close state
- Persists to localStorage
- Loads state on mount
- Debounces storage writes

### useChatHistory

Custom hook for chat history persistence.

**Returns**:

```typescript
interface UseChatHistoryReturn {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearHistory: () => void;
  loadHistory: () => void;
  saveHistory: () => void;
}
```

**Behavior**:

- Manages message array
- Persists to localStorage
- Handles storage errors
- Enforces message limits

## Utility Contracts

### Storage Utilities

```typescript
// Save widget state to localStorage
function saveWidgetState(state: WidgetState, key: string): void;

// Load widget state from localStorage
function loadWidgetState(key: string): WidgetState | null;

// Clear widget state from localStorage
function clearWidgetState(key: string): void;

// Check if localStorage is available
function isStorageAvailable(): boolean;

// Get storage size estimate
function getStorageSize(key: string): number;
```

**Error Handling**:

- Throws StorageError if quota exceeded
- Returns null if key doesn't exist
- Handles JSON parse errors gracefully

## API Contracts

### Existing Chat API

The widget uses the existing `/api/chat` endpoint. No changes required.

**Endpoint**: `POST /api/chat`

**Request**:

```typescript
interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}
```

**Response**: Streaming text response (text/event-stream)

**Error Responses**:

- `400`: Bad request (invalid message format)
- `401`: Unauthorized (authentication required)
- `500`: Server error

## Integration Points

### Layout Integration

The widget provider must be added to root layout:

```typescript
// app/layout.tsx
<ChatWidgetProvider>
  <NavigationHeader />
  {children}
  <ChatWidget />
</ChatWidgetProvider>
```

### Page Integration

Stock Images page (now home) must include Cloudflare Images link:

```typescript
// app/page.tsx (Stock Images)
<NavigationHeader showCloudflareLink={true} />
<ImagesHubGallery />
```

## Testing Contracts

### Component Testing

Each component must have:

- Rendering test
- Interaction test
- Accessibility test
- Error boundary test (where applicable)

### Hook Testing

Each hook must have:

- State management test
- Side effect test
- Error handling test
- Cleanup test

### Integration Testing

Must test:

- Widget open/close flow
- Chat message flow
- State persistence
- Navigation updates
