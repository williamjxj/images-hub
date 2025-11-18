/**
 * Custom hook for managing image search state and API calls
 */

import { useState, useCallback, useMemo } from 'react';
import type { SearchResponse, ImageResult, ProviderResult } from '@/lib/hub/types';

interface UseImageSearchOptions {
  initialProviders?: ('unsplash' | 'pexels' | 'pixabay')[];
  initialQuery?: string;
}

interface UseImageSearchReturn {
  // State
  query: string;
  providers: ('unsplash' | 'pexels' | 'pixabay')[];
  results: SearchResponse | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;

  // Actions
  search: (query: string, providers?: ('unsplash' | 'pexels' | 'pixabay')[]) => Promise<void>;
  loadMore: () => Promise<void>;
  setProviders: (providers: ('unsplash' | 'pexels' | 'pixabay')[]) => void;
  clearResults: () => void;
  retry: () => Promise<void>;
}

/**
 * Hook for managing image search across multiple providers
 */
export function useImageSearch(
  options: UseImageSearchOptions = {}
): UseImageSearchReturn {
  const {
    initialProviders = ['unsplash', 'pexels', 'pixabay'],
    initialQuery = '',
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [providers, setProviders] = useState<('unsplash' | 'pexels' | 'pixabay')[]>(
    initialProviders
  );
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Computed values (must be defined before use in callbacks)
  const hasMore = useMemo(() => {
    return results?.hasMore ?? false;
  }, [results]);

  // Perform search
  const performSearch = useCallback(
    async (
      searchQuery: string,
      searchProviders: ('unsplash' | 'pexels' | 'pixabay')[],
      page: number = 1
    ) => {
      if (!searchQuery.trim()) {
        setError('Query cannot be empty');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: searchQuery.trim(),
          providers: searchProviders.join(','),
          page: page.toString(),
          per_page: '20',
        });

        const response = await fetch(`/api/images-hub/search?${params}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Search failed: ${response.statusText}`);
        }

        const data: SearchResponse = await response.json();
        
        if (page === 1) {
          // New search - replace results
          setResults(data);
          setCurrentPage(1);
        } else {
          // Load more - append results
          setResults((prev) => {
            if (!prev) return data;
            
            // Merge results by appending images to each provider, deduplicating by ID
            const mergedProviders: ProviderResult[] = prev.providers.map((prevProvider) => {
              const newProvider = data.providers.find((p) => p.provider === prevProvider.provider);
              if (!newProvider) return prevProvider;
              
              // Deduplicate images by ID to prevent duplicates
              const existingIds = new Set(prevProvider.images.map((img) => img.id));
              const newImages = newProvider.images.filter((img) => !existingIds.has(img.id));
              
              return {
                ...prevProvider,
                images: [...prevProvider.images, ...newImages],
                currentPage: newProvider.currentPage,
                hasMore: newProvider.hasMore,
                error: newProvider.error || prevProvider.error,
              };
            });

            return {
              ...data,
              providers: mergedProviders,
              totalResults: mergedProviders.reduce((sum, p) => sum + p.total, 0),
              hasMore: mergedProviders.some((p) => p.hasMore),
            };
          });
          setCurrentPage(page);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Search with new query
  const search = useCallback(
    async (
      searchQuery: string,
      searchProviders?: ('unsplash' | 'pexels' | 'pixabay')[]
    ) => {
      const providersToUse = searchProviders || providers;
      setQuery(searchQuery);
      setProviders(providersToUse);
      await performSearch(searchQuery, providersToUse, 1);
    },
    [providers, performSearch]
  );

  // Load more results
  const loadMore = useCallback(async () => {
    if (!query || loading || !hasMore) return;
    await performSearch(query, providers, currentPage + 1);
  }, [query, providers, currentPage, loading, hasMore, performSearch]);

  // Clear results
  const clearResults = useCallback(() => {
    setResults(null);
    setQuery('');
    setCurrentPage(1);
    setError(null);
  }, []);

  // Retry last search
  const retry = useCallback(async () => {
    if (!query) return;
    await performSearch(query, providers, currentPage);
  }, [query, providers, currentPage, performSearch]);

  return {
    // State
    query,
    providers,
    results,
    loading,
    error,
    currentPage,
    hasMore,

    // Actions
    search,
    loadMore,
    setProviders,
    clearResults,
    retry,
  };
}

