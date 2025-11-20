/**
 * Hook for managing keyboard shortcuts
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { KeyboardShortcut } from '@/types/ui-ux';

/**
 * Keyboard shortcut handler function type
 */
export type ShortcutHandler = (event: KeyboardEvent) => void;

/**
 * Options for useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled */
  enabled?: boolean;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
}

/**
 * Hook to register and handle keyboard shortcuts
 * 
 * @param shortcuts Array of keyboard shortcuts to register
 * @param handlers Map of action identifiers to handler functions
 * @param options Configuration options
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  handlers: Record<string, ShortcutHandler>,
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true, preventDefault = true } = options;
  const handlersRef = useRef(handlers);
  const shortcutsRef = useRef(shortcuts);
  
  // Update refs when props change
  useEffect(() => {
    handlersRef.current = handlers;
    shortcutsRef.current = shortcuts;
  }, [handlers, shortcuts]);
  
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Skip shortcuts when typing in input fields (except Escape)
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      
      if (isInputField && event.key !== 'Escape') {
        return;
      }
      
      // Check each shortcut
      for (const shortcut of shortcutsRef.current) {
        // Check if condition is met
        if (shortcut.condition && !shortcut.condition()) {
          continue;
        }
        
        // Check modifiers
        const hasModifiers = shortcut.modifiers && shortcut.modifiers.length > 0;
        const metaPressed = event.metaKey || event.ctrlKey;
        const altPressed = event.altKey;
        const shiftPressed = event.shiftKey;
        
        if (hasModifiers) {
          const requiresMeta = shortcut.modifiers!.includes('Meta') || shortcut.modifiers!.includes('Control');
          const requiresAlt = shortcut.modifiers!.includes('Alt');
          const requiresShift = shortcut.modifiers!.includes('Shift');
          
          if (requiresMeta && !metaPressed) continue;
          if (requiresAlt && !altPressed) continue;
          if (requiresShift && !shiftPressed) continue;
          
          // Check that no extra modifiers are pressed
          if (requiresMeta && (event.metaKey !== event.ctrlKey)) continue;
        } else {
          // No modifiers should be pressed
          if (metaPressed || altPressed || shiftPressed) continue;
        }
        
        // Check key match
        if (event.key !== shortcut.key) {
          continue;
        }
        
        // Match found - execute handler
        const handler = handlersRef.current[shortcut.action];
        if (handler) {
          if (shortcut.preventDefault !== false && preventDefault) {
            event.preventDefault();
            event.stopPropagation();
          }
          handler(event);
          break; // Only handle one shortcut per keypress
        }
      }
    },
    [enabled, preventDefault]
  );
  
  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

