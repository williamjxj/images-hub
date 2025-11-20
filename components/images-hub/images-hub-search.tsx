/**
 * Search Input Component for Images Hub
 * 
 * Provides a search input with debouncing and submit functionality
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagesHubSearchKeyboard } from "./images-hub-search-keyboard";
import { SearchSuggestions } from "@/components/search/search-suggestions";
import { SearchHistory } from "@/components/search/search-history";
import { useSearchHistory as useSearchHistoryHook } from "@/lib/hooks/use-search-history";
import { useAuth } from "@clerk/nextjs";

interface ImagesHubSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  disabled?: boolean;
}

export function ImagesHubSearch({
  onSearch,
  initialQuery = "",
  disabled = false,
}: ImagesHubSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { userId } = useAuth();
  const { addToHistory } = useSearchHistoryHook(userId || undefined);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        const trimmedQuery = query.trim();
        addToHistory(trimmedQuery);
        onSearch(trimmedQuery);
        setShowSuggestions(false);
        setShowHistory(false);
      }
    },
    [query, onSearch, addToHistory]
  );
  
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      addToHistory(suggestion);
      onSearch(suggestion);
      setShowSuggestions(false);
      setShowHistory(false);
      searchInputRef.current?.blur();
    },
    [onSearch, addToHistory]
  );
  
  const handleHistorySelect = useCallback(
    (historyQuery: string) => {
      setQuery(historyQuery);
      onSearch(historyQuery);
      setShowHistory(false);
      searchInputRef.current?.blur();
    },
    [onSearch]
  );
  
  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    if (query.length < 2) {
      setShowHistory(true);
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
      setShowHistory(false);
    }
  }, [query]);
  
  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding to allow clicks on suggestions/history
    setTimeout(() => {
      setShowSuggestions(false);
      setShowHistory(false);
    }, 200);
  }, []);
  
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      if (newQuery.length >= 2) {
        setShowSuggestions(true);
        setShowHistory(false);
      } else if (newQuery.length === 0 && isFocused) {
        setShowHistory(true);
        setShowSuggestions(false);
      } else {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    },
    [isFocused]
  );

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search for images (e.g., sunset, mountains, nature)..."
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={disabled}
            className="pl-9 pr-20"
            aria-label="Search images"
            aria-autocomplete="list"
            aria-expanded={showSuggestions || showHistory}
            aria-controls="search-suggestions search-history"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 z-10"
              aria-label="Clear search"
            >
              ×
            </Button>
          )}
          <SearchSuggestions
            query={query}
            onSelect={handleSuggestionSelect}
            isVisible={showSuggestions}
            onClose={() => setShowSuggestions(false)}
          />
          <SearchHistory
            onSelect={handleHistorySelect}
            isVisible={showHistory}
            onClose={() => setShowHistory(false)}
          />
          <ImagesHubSearchKeyboard searchInputRef={searchInputRef} />
        </div>
        <Button
          type="submit"
          disabled={disabled || !query.trim()}
          aria-label="Search"
        >
          Search
        </Button>
      </div>
    </form>
  );
}

