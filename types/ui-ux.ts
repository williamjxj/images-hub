/**
 * Type definitions for UI/UX improvement features
 */

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /** Key combination (e.g., "/", "Escape", "ArrowLeft") */
  key: string;
  /** Modifier keys (e.g., ["Meta", "Control"]) */
  modifiers?: ("Meta" | "Control" | "Alt" | "Shift")[];
  /** Action identifier (e.g., "focus-search", "close-modal") */
  action: string;
  /** Human-readable description for help dialog */
  description: string;
  /** Optional condition function - shortcut only active when returns true */
  condition?: () => boolean;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
}

/**
 * Search history entry
 */
export interface SearchHistoryEntry {
  /** The search query text */
  query: string;
  /** Unix timestamp of when search was executed (milliseconds since epoch) */
  timestamp: number;
  /** Optional number of results found (for future use) */
  resultCount?: number;
}

/**
 * User feedback submission
 */
export interface UserFeedback {
  /** Feedback type */
  type: "error" | "feature-request" | "general" | "helpful-prompt";
  /** User's feedback description */
  description: string;
  /** Clerk user ID (if authenticated) */
  userId?: string;
  /** User's email (optional) */
  userEmail?: string;
  /** URL where feedback was submitted */
  pageUrl: string;
  /** Array of recent user actions (for context) */
  userActions?: string[];
  /** Error details if type is "error" */
  errorDetails?: {
    message: string;
    stack?: string;
    componentStack?: string;
  };
  /** Browser and device information */
  browserInfo?: {
    userAgent: string;
    viewportWidth: number;
    viewportHeight: number;
  };
  /** Unix timestamp of submission (milliseconds since epoch) */
  timestamp: number;
  /** Rating for helpful-prompt type feedback */
  rating?: "positive" | "negative";
}

/**
 * Theme preference
 */
export interface ThemePreference {
  /** Theme value */
  theme: "light" | "dark" | "system";
  /** Resolved theme (light or dark) */
  resolvedTheme?: "light" | "dark";
}
