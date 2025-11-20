/**
 * Unified search aggregator for multiple image providers
 *
 * Calls selected providers in parallel, normalizes responses, and returns
 * unified results grouped by provider.
 */

import { UnsplashClient } from "./unsplash-client";
import { PexelsClient } from "./pexels-client";
import { PixabayClient } from "./pixabay-client";
import {
  normalizeUnsplash,
  normalizePexels,
  normalizePixabay,
} from "./normalizer";
import type { SearchResponse, ProviderResult } from "./types";

/**
 * Search images across multiple providers
 *
 * @param query - Search query string
 * @param providers - Array of providers to search ('unsplash', 'pexels', 'pixabay')
 * @param page - Page number (1-indexed)
 * @param perPage - Results per page per provider
 * @returns Unified search response with results grouped by provider
 */
export async function searchImages(
  query: string,
  providers: ("unsplash" | "pexels" | "pixabay")[],
  page: number = 1,
  perPage: number = 20
): Promise<SearchResponse> {
  const unsplashClient = new UnsplashClient();
  const pexelsClient = new PexelsClient();
  const pixabayClient = new PixabayClient();

  // Prepare provider search promises (only for selected providers)
  const providerPromises: Array<Promise<ProviderResult>> = [];

  // Unsplash
  if (providers.includes("unsplash")) {
    providerPromises.push(
      unsplashClient
        .search(query, page, perPage)
        .then((result) => ({
          provider: "unsplash" as const,
          images: result.photos.map(normalizeUnsplash),
          total: result.total,
          totalPages: result.totalPages,
          currentPage: page,
          hasMore: page < result.totalPages,
          error: null,
        }))
        .catch((error) => ({
          provider: "unsplash" as const,
          images: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          hasMore: false,
          error: error.message || "Failed to fetch from Unsplash",
        }))
    );
  }

  // Pixabay
  if (providers.includes("pixabay")) {
    providerPromises.push(
      pixabayClient
        .search(query, page, perPage)
        .then((result) => ({
          provider: "pixabay" as const,
          images: result.hits.map(normalizePixabay),
          total: result.total,
          totalPages: result.totalPages,
          currentPage: page,
          hasMore: page < result.totalPages,
          error: null,
        }))
        .catch((error) => ({
          provider: "pixabay" as const,
          images: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          hasMore: false,
          error: error.message || "Failed to fetch from Pixabay",
        }))
    );
  }

  // Pexels
  if (providers.includes("pexels")) {
    providerPromises.push(
      pexelsClient
        .search(query, page, perPage)
        .then((result) => ({
          provider: "pexels" as const,
          images: result.photos.map(normalizePexels),
          total: result.total,
          totalPages: result.totalPages,
          currentPage: page,
          hasMore: page < result.totalPages,
          error: null,
        }))
        .catch((error) => ({
          provider: "pexels" as const,
          images: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          hasMore: false,
          error: error.message || "Failed to fetch from Pexels",
        }))
    );
  }

  // Call selected providers in parallel
  const results = await Promise.allSettled(providerPromises);

  // Extract provider results
  const providerResults: ProviderResult[] = results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      // This shouldn't happen since we catch errors in promises, but handle it anyway
      return {
        provider: "unsplash" as const, // Fallback
        images: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        hasMore: false,
        error: result.reason?.message || "Unknown error",
      };
    }
  });

  // Ensure correct order: Unsplash → Pixabay → Pexels
  // Only include providers that were actually searched
  const orderedResults: ProviderResult[] = [];

  if (providers.includes("unsplash")) {
    const unsplashResult = providerResults.find(
      (r) => r.provider === "unsplash"
    );
    if (unsplashResult) orderedResults.push(unsplashResult);
  }

  if (providers.includes("pixabay")) {
    const pixabayResult = providerResults.find((r) => r.provider === "pixabay");
    if (pixabayResult) orderedResults.push(pixabayResult);
  }

  if (providers.includes("pexels")) {
    const pexelsResult = providerResults.find((r) => r.provider === "pexels");
    if (pexelsResult) orderedResults.push(pexelsResult);
  }

  // Calculate totals and errors
  const totalResults = orderedResults.reduce((sum, r) => sum + r.total, 0);
  const hasMore = orderedResults.some((r) => r.hasMore);
  const errors: Record<string, string> = {};

  orderedResults.forEach((result) => {
    if (result.error) {
      errors[result.provider] = result.error;
    }
  });

  return {
    query,
    providers: orderedResults,
    totalResults,
    hasMore,
    errors,
  };
}
