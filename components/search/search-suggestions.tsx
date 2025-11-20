/**
 * Search Suggestions Component
 *
 * Displays search suggestions dropdown based on user's recent searches and popular searches
 */

"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useSearchSuggestions } from "@/lib/hooks/use-search-suggestions";
import { useAuth } from "@clerk/nextjs";

/**
 * Props for SearchSuggestions component
 */
interface SearchSuggestionsProps {
  /** Current search query */
  query: string;
  /** Callback when a suggestion is selected */
  onSelect: (suggestion: string) => void;
  /** Whether suggestions are visible */
  isVisible: boolean;
  /** Callback to close suggestions */
  onClose: () => void;
  /** Minimum query length to show suggestions */
  minQueryLength?: number;
}

/**
 * Search Suggestions Component
 *
 * Shows a dropdown of search suggestions based on:
 * 1. User's recent searches (if authenticated)
 * 2. Popular searches (fallback)
 */
export function SearchSuggestions({
  query,
  onSelect,
  isVisible,
  onClose,
  minQueryLength = 2,
}: SearchSuggestionsProps) {
  const { userId } = useAuth();
  const suggestions = useSearchSuggestions(query, {
    userId: userId || undefined,
    minQueryLength,
    maxSuggestions: 10,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, onClose]);

  if (
    !isVisible ||
    !query ||
    query.length < minQueryLength ||
    suggestions.length === 0
  ) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
      role="listbox"
      aria-label="Search suggestions"
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            onSelect(suggestion);
            onClose();
          }}
          className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 focus:bg-accent focus:text-accent-foreground focus:outline-none"
          role="option"
          aria-selected={false}
        >
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 truncate">{suggestion}</span>
        </button>
      ))}
    </div>
  );
}
