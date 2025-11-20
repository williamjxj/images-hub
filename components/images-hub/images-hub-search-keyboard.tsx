/**
 * Keyboard shortcut handler for search input focus
 * 
 * Handles the `/` keyboard shortcut to focus the search input on the Stock Images page
 */

'use client';

import { useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';
import { KEYBOARD_SHORTCUTS } from '@/lib/constants/keyboard-shortcuts';

/**
 * Props for ImagesHubSearchKeyboard component
 */
interface ImagesHubSearchKeyboardProps {
  /** Ref to the search input element */
  searchInputRef: React.RefObject<HTMLInputElement>;
}

/**
 * Component that handles keyboard shortcuts for search input
 * 
 * Specifically handles the `/` shortcut to focus the search input
 */
export function ImagesHubSearchKeyboard({
  searchInputRef,
}: ImagesHubSearchKeyboardProps) {
  // Register keyboard shortcut to focus search input
  useKeyboardShortcuts(
    KEYBOARD_SHORTCUTS.filter((shortcut) => shortcut.action === 'focus-search'),
    {
      'focus-search': () => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      },
    },
    { enabled: true }
  );
  
  return null; // This component doesn't render anything
}

