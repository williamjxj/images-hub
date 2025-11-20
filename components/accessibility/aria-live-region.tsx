/**
 * ARIA Live Region Component
 *
 * Announces dynamic content updates to screen readers
 */

"use client";

import { ReactNode } from "react";

/**
 * Props for AriaLiveRegion component
 */
interface AriaLiveRegionProps {
  /** Content to announce */
  children: ReactNode;
  /** Priority level - 'polite' waits for current announcement, 'assertive' interrupts */
  priority?: "polite" | "assertive";
  /** Whether to announce atomic changes (entire region) */
  atomic?: boolean;
}

/**
 * ARIA Live Region Component
 *
 * Provides a region that screen readers will announce when content changes.
 * Use this for dynamic content updates like search results, loading states, etc.
 */
export function AriaLiveRegion({
  children,
  priority = "polite",
  atomic = true,
}: AriaLiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
      aria-label="Screen reader announcements"
    >
      {children}
    </div>
  );
}
