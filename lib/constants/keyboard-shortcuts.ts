/**
 * Keyboard shortcut definitions and configuration
 */

import type { KeyboardShortcut } from '@/types/ui-ux';

/**
 * Default keyboard shortcuts configuration
 * 
 * These shortcuts are registered globally and can be used throughout the application.
 * Each shortcut can have an optional condition function to control when it's active.
 */
export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: '/',
    action: 'focus-search',
    description: 'Focus search input',
    condition: () => typeof window !== 'undefined' && window.location.pathname === '/',
    preventDefault: true,
  },
  {
    key: 'Escape',
    action: 'close-modal',
    description: 'Close modal or dialog',
    preventDefault: true,
  },
  {
    key: 'ArrowLeft',
    action: 'navigate-image-prev',
    description: 'Navigate to previous image',
    preventDefault: true,
  },
  {
    key: 'ArrowRight',
    action: 'navigate-image-next',
    description: 'Navigate to next image',
    preventDefault: true,
  },
  {
    key: '/',
    modifiers: ['Meta', 'Control'],
    action: 'show-shortcuts-help',
    description: 'Show keyboard shortcuts help',
    preventDefault: true,
  },
];

/**
 * Get shortcut by action identifier
 */
export function getShortcutByAction(action: string): KeyboardShortcut | undefined {
  return KEYBOARD_SHORTCUTS.find((shortcut) => shortcut.action === action);
}

/**
 * Get all shortcuts for display in help dialog
 */
export function getAllShortcuts(): KeyboardShortcut[] {
  return KEYBOARD_SHORTCUTS;
}

/**
 * Format shortcut key combination for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.modifiers) {
    parts.push(...shortcut.modifiers.map((mod) => {
      if (mod === 'Meta') return navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';
      if (mod === 'Control') return 'Ctrl';
      if (mod === 'Alt') return 'Alt';
      if (mod === 'Shift') return 'Shift';
      return mod;
    }));
  }
  
  // Format key
  if (shortcut.key === 'Escape') {
    parts.push('Esc');
  } else if (shortcut.key.startsWith('Arrow')) {
    parts.push(shortcut.key.replace('Arrow', ''));
  } else {
    parts.push(shortcut.key);
  }
  
  return parts.join(' + ');
}

