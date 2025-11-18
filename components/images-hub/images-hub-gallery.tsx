/**
 * Main Gallery Component for Images Hub
 * 
 * Orchestrates search, filtering, display, and infinite scroll functionality
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { ImagesHubSearch } from "./images-hub-search";
import { ImagesHubProviderFilter } from "./images-hub-provider-filter";
import { ImagesHubGrid } from "./images-hub-grid";
import { ImagesHubModal } from "./images-hub-modal";
import { ImagesHubLoading } from "./images-hub-loading";
import { ImagesHubError } from "./images-hub-error";
import { useImageSearch } from "@/lib/hooks/use-image-search";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import type { ImageResult } from "@/lib/hub/types";

export function ImagesHubGallery() {
  const {
    query,
    providers,
    results,
    loading,
    error,
    hasMore,
    search,
    loadMore,
    setProviders,
    retry,
  } = useImageSearch();

  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

  // Infinite scroll
  const { ref: infiniteScrollRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
  });

  // Handle provider filter change
  const handleProviderChange = useCallback(
    (newProviders: ('unsplash' | 'pexels' | 'pixabay')[]) => {
      setProviders(newProviders);
      // If we have a query, re-search with new providers
      if (query) {
        search(query, newProviders);
      }
    },
    [query, search, setProviders]
  );

  // Handle image click
  const handleImageClick = useCallback((image: ImageResult) => {
    setSelectedImage(image);
  }, []);

  // Check if there are any results
  const hasResults = useMemo(() => {
    return results?.providers.some((p) => p.images.length > 0) ?? false;
  }, [results]);

  // Check if there are any errors from providers
  const hasProviderErrors = useMemo(() => {
    return Object.keys(results?.errors || {}).length > 0;
  }, [results]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Stock Image Search Hub</h1>
        <p className="text-muted-foreground">
          Search for images across Unsplash, Pixabay, and Pexels
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <ImagesHubSearch onSearch={search} disabled={loading} />
        <ImagesHubProviderFilter
          providers={providers}
          onChange={handleProviderChange}
          disabled={loading}
        />
      </div>

      {/* Error Display */}
      {error && (
        <ImagesHubError message={error} onRetry={retry} />
      )}

      {/* Provider Errors Warning */}
      {hasProviderErrors && results && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Some providers are temporarily unavailable:{" "}
            {Object.keys(results.errors).join(", ")}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && !results && <ImagesHubLoading />}

      {/* Results */}
      {results && hasResults && (
        <>
          <ImagesHubGrid
            providers={results.providers}
            onImageClick={handleImageClick}
          />
          
          {/* Infinite Scroll Trigger */}
          {hasMore && (
            <div ref={infiniteScrollRef} className="h-20 flex items-center justify-center">
              {loading && <ImagesHubLoading count={8} />}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {results && !hasResults && !loading && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">No images found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search query or check your provider selections
          </p>
        </div>
      )}

      {/* Initial Empty State */}
      {!results && !loading && !error && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Enter a search query to find images
          </p>
        </div>
      )}

      {/* Image Modal */}
      <ImagesHubModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

