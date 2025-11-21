/**
 * Main Gallery Component for Images Hub
 *
 * Orchestrates search, filtering, display, and infinite scroll functionality
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ImagesHubSearch } from "./images-hub-search";
import { ImagesHubProviderFilter } from "./images-hub-provider-filter";
import { ImagesHubGrid } from "./images-hub-grid";
import { ImagesHubModal } from "./images-hub-modal";
import { ImagesHubLoading } from "./images-hub-loading";
import { ImagesHubError } from "./images-hub-error";
import { useImageSearch } from "@/lib/hooks/use-image-search";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { AriaLiveRegion } from "@/components/accessibility/aria-live-region";
import { FeedbackPrompt } from "@/components/feedback/feedback-prompt";
import { AnimatedText } from "@/components/animations/text-animations";
import { announceToScreenReader } from "@/lib/utils/accessibility";
import { useEffect } from "react";
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
    (newProviders: ("unsplash" | "pexels" | "pixabay")[]) => {
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

  // Announce search results to screen readers
  useEffect(() => {
    if (results && hasResults) {
      const totalImages = results.providers.reduce(
        (sum, p) => sum + p.images.length,
        0
      );
      announceToScreenReader(
        `Found ${totalImages} images across ${results.providers.length} provider${results.providers.length > 1 ? "s" : ""}`,
        "polite"
      );
    } else if (results && !hasResults && !loading) {
      announceToScreenReader(
        "No images found. Try a different search query.",
        "polite"
      );
    }
  }, [results, hasResults, loading]);

  // Announce loading state
  useEffect(() => {
    if (loading && !results) {
      announceToScreenReader("Searching for images...", "polite");
    }
  }, [loading, results]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <AnimatedText animation="reveal" delay={0}>
                Stock Image Search Hub
              </AnimatedText>
            </h1>
            <div className="text-muted-foreground">
              <AnimatedText animation="fade" delay={0.2}>
                Search for images across Unsplash, Pixabay, and Pexels
              </AnimatedText>
            </div>
          </div>
          <Link
            href="/cloudflare-images"
            className="text-sm font-medium hover:underline text-primary"
          >
            Cloudflare Images →
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <ImagesHubSearch onSearch={search} disabled={loading} />
        <div className="flex items-center gap-2">
          <ImagesHubProviderFilter
            providers={providers}
            onChange={handleProviderChange}
            disabled={loading}
          />
          {/* Advanced filters will be added here in future phase */}
        </div>
      </div>

      {/* Error Display */}
      {error && <ImagesHubError message={error} onRetry={retry} />}

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

      {/* ARIA Live Region for announcements */}
      <AriaLiveRegion priority="polite">
        {hasResults && results
          ? `Found ${results.providers.reduce((sum, p) => sum + p.images.length, 0)} images`
          : results && !hasResults && !loading
            ? "No images found"
            : ""}
      </AriaLiveRegion>

      {/* Results */}
      {results && hasResults && (
        <>
          <ImagesHubGrid
            providers={results.providers}
            onImageClick={handleImageClick}
          />

          {/* Feedback Prompt */}
          <FeedbackPrompt
            context={`Search results for "${query}"`}
            onDismiss={() => {}}
          />

          {/* Infinite Scroll Trigger */}
          {hasMore && (
            <div
              ref={infiniteScrollRef}
              className="h-20 flex items-center justify-center"
            >
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
