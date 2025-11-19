/**
 * localStorage utility functions for widget state persistence
 */

import type { WidgetState } from '@/types/chat-widget';

const STORAGE_KEY_PREFIX = 'chat-widget-state';

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage key for widget state
 */
function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;
}

/**
 * Save widget state to localStorage
 */
export function saveWidgetState(
  state: WidgetState,
  userId?: string
): void {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return;
  }

  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      throw new Error('Storage quota exceeded');
    }
    console.error('Failed to save widget state:', error);
    throw error;
  }
}

/**
 * Load widget state from localStorage
 */
export function loadWidgetState(userId?: string): WidgetState | null {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    const state = JSON.parse(stored) as WidgetState;
    
    // Validate state structure
    if (
      typeof state.isOpen === 'boolean' &&
      Array.isArray(state.messages) &&
      typeof state.lastUpdated === 'number'
    ) {
      return state;
    }

    console.warn('Invalid widget state structure, returning null');
    return null;
  } catch (error) {
    console.error('Failed to load widget state:', error);
    return null;
  }
}

/**
 * Clear widget state from localStorage
 */
export function clearWidgetState(userId?: string): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear widget state:', error);
  }
}

/**
 * Get storage size estimate for a key
 */
export function getStorageSize(key: string): number {
  if (!isStorageAvailable()) {
    return 0;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? new Blob([item]).size : 0;
  } catch {
    return 0;
  }
}

