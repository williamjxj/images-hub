/**
 * Hook for managing search history with localStorage persistence
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SearchHistoryEntry } from '@/types/ui-ux';

const STORAGE_KEY_PREFIX = 'search-history';
const MAX_HISTORY_ENTRIES = 10;

/**
 * Get storage key for user
 */
function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}-${userId}`;
}

/**
 * Load search history from localStorage
 */
function loadSearchHistory(userId: string): SearchHistoryEntry[] {
  if (typeof window === 'undefined' || !userId) {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (!stored) return [];
    
    const parsed = JSON.parse(stored) as SearchHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load search history:', error);
    return [];
  }
}

/**
 * Save search history to localStorage
 */
function saveSearchHistory(userId: string, history: SearchHistoryEntry[]): void {
  if (typeof window === 'undefined' || !userId) {
    return;
  }
  
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

/**
 * Hook for managing search history
 * 
 * @param userId Authenticated user ID (required for persistence)
 * @returns Search history state and management functions
 */
export function useSearchHistory(userId?: string) {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  
  // Load history on mount and when userId changes
  useEffect(() => {
    if (!userId) {
      setHistory([]);
      return;
    }
    
    const loaded = loadSearchHistory(userId);
    setHistory(loaded);
  }, [userId]);
  
  /**
   * Add a search query to history
   */
  const addToHistory = useCallback(
    (query: string) => {
      if (!userId || !query.trim()) {
        return;
      }
      
      const trimmedQuery = query.trim();
      const now = Date.now();
      
      setHistory((prev) => {
        // Remove duplicate and add to top
        const filtered = prev.filter((entry) => entry.query !== trimmedQuery);
        const updated: SearchHistoryEntry[] = [
          { query: trimmedQuery, timestamp: now },
          ...filtered,
        ].slice(0, MAX_HISTORY_ENTRIES);
        
        // Save to localStorage
        saveSearchHistory(userId, updated);
        
        return updated;
      });
    },
    [userId]
  );
  
  /**
   * Clear search history
   */
  const clearHistory = useCallback(() => {
    if (!userId) return;
    
    setHistory([]);
    try {
      localStorage.removeItem(getStorageKey(userId));
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, [userId]);
  
  /**
   * Remove a specific entry from history
   */
  const removeFromHistory = useCallback(
    (query: string) => {
      if (!userId) return;
      
      setHistory((prev) => {
        const updated = prev.filter((entry) => entry.query !== query);
        saveSearchHistory(userId, updated);
        return updated;
      });
    },
    [userId]
  );
  
  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}

