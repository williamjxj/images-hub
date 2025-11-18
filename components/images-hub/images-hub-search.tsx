/**
 * Search Input Component for Images Hub
 * 
 * Provides a search input with debouncing and submit functionality
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
      }
    },
    [query, onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for images (e.g., sunset, mountains, nature)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={disabled}
            className="pl-9 pr-20"
            aria-label="Search images"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              aria-label="Clear search"
            >
              ×
            </Button>
          )}
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

