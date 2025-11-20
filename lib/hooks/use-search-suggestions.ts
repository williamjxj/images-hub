/**
 * Hook for search suggestions with recent → popular fallback
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { filterSearchesByQuery, getPopularSearches } from "@/lib/utils/search";
import { useSearchHistory } from "./use-search-history";

/**
 * Options for useSearchSuggestions hook
 */
export interface UseSearchSuggestionsOptions {
  /** Minimum query length to show suggestions */
  minQueryLength?: number;
  /** Maximum number of suggestions to return */
  maxSuggestions?: number;
  /** User ID for accessing search history */
  userId?: string;
}

/**
 * Hook for generating search suggestions
 *
 * Prioritizes user's recent searches, falls back to popular searches
 *
 * @param query Current search query
 * @param options Configuration options
 * @returns Array of suggestion strings
 */
export function useSearchSuggestions(
  query: string,
  options: UseSearchSuggestionsOptions = {}
): string[] {
  const { minQueryLength = 2, maxSuggestions = 10, userId } = options;

  const { history } = useSearchHistory(userId);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Get recent searches from history
  const recentSearches = useMemo(
    () => history.map((entry) => entry.query),
    [history]
  );

  // Get popular searches
  const popularSearches = useMemo(() => getPopularSearches(), []);

  useEffect(() => {
    // Clear suggestions if query is too short
    if (!query || query.length < minQueryLength) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    // Filter recent searches first
    const recentMatches = filterSearchesByQuery(query, recentSearches);

    // If we have recent matches, use those
    if (recentMatches.length > 0) {
      setSuggestions(recentMatches.slice(0, maxSuggestions));
      return;
    }

    // Fallback to popular searches
    const popularMatches = filterSearchesByQuery(query, popularSearches);
    setSuggestions(popularMatches.slice(0, maxSuggestions));
  }, [query, recentSearches, popularSearches, minQueryLength, maxSuggestions]);

  return suggestions;
}
