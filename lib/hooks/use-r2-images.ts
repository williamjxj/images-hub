/**
 * Custom hook for managing R2 image gallery state
 *
 * Provides state management and functions for loading images from R2 buckets,
 * handling pagination, bucket switching, and folder navigation.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { R2Object, R2BucketName, R2ListResponse } from "@/types/r2";
import { R2_BUCKETS } from "@/lib/r2/constants";

/**
 * Hook for managing R2 image gallery state
 *
 * @param initialBucket - Initial bucket to load (defaults to first bucket)
 * @param initialFolder - Initial folder path (defaults to root "")
 */
export function useR2Images(
  initialBucket?: R2BucketName,
  initialFolder: string = ""
) {
  const [images, setImages] = useState<R2Object[]>([]);
  const [folders, setFolders] = useState<R2Object[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true for initial load
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [activeBucket, setActiveBucket] = useState<R2BucketName>(
    initialBucket || R2_BUCKETS[0]
  );
  const [currentFolder, setCurrentFolder] = useState<string>(initialFolder);

  /**
   * Load more images (for infinite scroll pagination)
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("bucket", activeBucket);
      if (currentFolder) {
        params.set("prefix", currentFolder);
      }
      if (cursor) {
        params.set("token", cursor);
      }
      params.set("maxKeys", "100");

      const response = await fetch(`/api/r2/list?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: R2ListResponse = await response.json();

      setImages((prev) => [...prev, ...data.objects]);
      setFolders(data.folders);
      setHasMore(data.hasMore);
      setCursor(data.nextToken || undefined);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more images"
      );
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [activeBucket, currentFolder, cursor, hasMore, loading]);

  /**
   * Refresh gallery (reset and load first page)
   */
  const refreshGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImages([]);
    setFolders([]);
    setHasMore(true);
    setCursor(undefined);

    try {
      const params = new URLSearchParams();
      params.set("bucket", activeBucket);
      if (currentFolder) {
        params.set("prefix", currentFolder);
      }
      params.set("maxKeys", "100");

      const response = await fetch(`/api/r2/list?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: R2ListResponse = await response.json();

      setImages(data.objects);
      setFolders(data.folders);
      setHasMore(data.hasMore);
      setCursor(data.nextToken || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [activeBucket, currentFolder]);

  /**
   * Switch to a different bucket
   */
  const switchBucket = useCallback((bucket: R2BucketName) => {
    setActiveBucket(bucket);
    setCurrentFolder(""); // Reset to root when switching buckets
    setImages([]);
    setFolders([]);
    setCursor(undefined);
    setHasMore(true);
    setLoading(true); // Show loading state when switching
  }, []);

  /**
   * Navigate to a folder
   */
  const navigateToFolder = useCallback((folderPath: string) => {
    setCurrentFolder(folderPath);
    setImages([]);
    setFolders([]);
    setCursor(undefined);
    setHasMore(true);
    setLoading(true); // Show loading state when navigating
  }, []);

  // Refresh gallery when bucket or folder changes
  useEffect(() => {
    refreshGallery();
  }, [refreshGallery]);

  return {
    images,
    folders,
    loading,
    error,
    hasMore,
    cursor,
    activeBucket,
    currentFolder,
    loadMore,
    refreshGallery,
    switchBucket,
    navigateToFolder,
  };
}
