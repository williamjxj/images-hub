/**
 * Keyboard Shortcuts Provider Component
 * 
 * Provides global keyboard shortcuts context for the application
 */

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';
import { KEYBOARD_SHORTCUTS, formatShortcut } from '@/lib/constants/keyboard-shortcuts';
import type { KeyboardShortcut } from '@/types/ui-ux';

/**
 * Keyboard shortcuts context value
 */
interface KeyboardShortcutsContextValue {
  /** Whether shortcuts help dialog is open */
  isHelpDialogOpen: boolean;
  /** Open shortcuts help dialog */
  openHelpDialog: () => void;
  /** Close shortcuts help dialog */
  closeHelpDialog: () => void;
  /** Toggle shortcuts help dialog */
  toggleHelpDialog: () => void;
  /** Get all shortcuts for display */
  getAllShortcuts: () => KeyboardShortcut[];
  /** Format shortcut for display */
  formatShortcut: (shortcut: KeyboardShortcut) => string;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

/**
 * Hook to access keyboard shortcuts context
 */
export function useKeyboardShortcutsContext(): KeyboardShortcutsContextValue {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      'useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider'
    );
  }
  return context;
}

/**
 * Props for KeyboardShortcutsProvider
 */
interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

/**
 * Provider component for keyboard shortcuts
 * 
 * Registers global keyboard shortcuts and provides context for managing shortcuts help dialog
 */
export function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  
  const openHelpDialog = useCallback(() => {
    setIsHelpDialogOpen(true);
  }, []);
  
  const closeHelpDialog = useCallback(() => {
    setIsHelpDialogOpen(false);
  }, []);
  
  const toggleHelpDialog = useCallback(() => {
    setIsHelpDialogOpen((prev) => !prev);
  }, []);
  
  // Register keyboard shortcuts
  useKeyboardShortcuts(
    KEYBOARD_SHORTCUTS,
    {
      'show-shortcuts-help': () => {
        toggleHelpDialog();
      },
    },
    { enabled: true }
  );
  
  const value: KeyboardShortcutsContextValue = {
    isHelpDialogOpen,
    openHelpDialog,
    closeHelpDialog,
    toggleHelpDialog,
    getAllShortcuts: () => KEYBOARD_SHORTCUTS,
    formatShortcut,
  };
  
  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

