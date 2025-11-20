/**
 * Accessibility utilities for focus management, ARIA announcements, and color contrast
 */

/**
 * Manage focus programmatically
 *
 * @param element Element to focus
 * @param options Focus options
 */
export function manageFocus(
  element: HTMLElement | null,
  options?: FocusOptions
): void {
  if (!element) return;

  // Ensure element is focusable
  if (
    element.tabIndex === -1 &&
    !["input", "button", "a", "textarea", "select"].includes(
      element.tagName.toLowerCase()
    )
  ) {
    element.tabIndex = 0;
  }

  element.focus(options);
}

/**
 * Announce message to screen readers via ARIA live region
 *
 * @param message Message to announce
 * @param priority Priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  if (typeof window === "undefined") return;

  // Find or create ARIA live region
  let liveRegion = document.getElementById("aria-live-region");

  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "aria-live-region";
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    `;
    document.body.appendChild(liveRegion);
  }

  // Update message
  liveRegion.setAttribute("aria-live", priority);
  liveRegion.textContent = message;

  // Clear after announcement (for repeated announcements)
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = "";
    }
  }, 1000);
}

/**
 * Check if color contrast meets WCAG AA standards
 *
 * @param foregroundColor Foreground color (hex, rgb, or hsl)
 * @param backgroundColor Background color (hex, rgb, or hsl)
 * @param isLargeText Whether text is large (18pt+ or 14pt+ bold)
 * @returns Object with contrast ratio and whether it meets WCAG AA
 */
export function checkColorContrast(
  foregroundColor: string,
  backgroundColor: string,
  isLargeText = false
): {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
} {
  // Convert colors to RGB
  const fgRgb = parseColor(foregroundColor);
  const bgRgb = parseColor(backgroundColor);

  // Calculate relative luminance
  const fgLuminance = getRelativeLuminance(fgRgb);
  const bgLuminance = getRelativeLuminance(bgRgb);

  // Calculate contrast ratio
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  // WCAG AA: 4.5:1 for normal text, 3:1 for large text
  // WCAG AAA: 7:1 for normal text, 4.5:1 for large text
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;

  return {
    ratio,
    meetsAA: ratio >= aaThreshold,
    meetsAAA: ratio >= aaaThreshold,
  };
}

/**
 * Parse color string to RGB values
 */
function parseColor(color: string): [number, number, number] {
  // Remove whitespace
  color = color.trim();

  // Hex color
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }

  // RGB/RGBA color
  if (color.startsWith("rgb")) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      return [
        parseInt(matches[0], 10),
        parseInt(matches[1], 10),
        parseInt(matches[2], 10),
      ];
    }
  }

  // Default to black if parsing fails
  return [0, 0, 0];
}

/**
 * Calculate relative luminance for WCAG contrast calculation
 */
function getRelativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Trap focus within a container element (for modals)
 *
 * @param container Container element
 * @param firstFocusable First focusable element (optional)
 * @param lastFocusable Last focusable element (optional)
 */
export function trapFocus(
  container: HTMLElement,
  firstFocusable?: HTMLElement,
  lastFocusable?: HTMLElement
): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const first = firstFocusable || focusableElements[0];
  const last = lastFocusable || focusableElements[focusableElements.length - 1];

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  container.addEventListener("keydown", handleTab);

  // Return cleanup function
  return () => {
    container.removeEventListener("keydown", handleTab);
  };
}
