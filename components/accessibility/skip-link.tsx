/**
 * Skip Link Component
 * 
 * Provides a "Skip to main content" link for keyboard navigation
 */

'use client';

import Link from 'next/link';

/**
 * Skip Link Component
 * 
 * Appears when user presses Tab on page load, allowing them to bypass
 * navigation and header elements to jump directly to main content.
 */
export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Skip to main content"
    >
      Skip to main content
    </Link>
  );
}

