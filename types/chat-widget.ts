/**
 * TypeScript types for chat widget state management
 */

export interface WidgetState {
  isOpen: boolean;
  messages: Message[];
  lastUpdated: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  parts?: MessagePart[];
}

export interface MessagePart {
  type: "text" | "image" | "tool";
  text?: string;
  // ... other part types can be added as needed
}
