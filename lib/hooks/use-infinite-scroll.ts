/**
 * Custom hook for infinite scroll using Intersection Observer
 * 
 * Automatically loads more content when the target element comes into view.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInView } from "react-intersection-observer";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = "100px",
}: UseInfiniteScrollOptions) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
  });

  const lastLoadRef = useRef<number>(0);
  const DEBOUNCE_MS = 500; // Prevent rapid successive calls

  useEffect(() => {
    if (inView && hasMore && !loading) {
      const now = Date.now();
      // Debounce to prevent rapid successive calls
      if (now - lastLoadRef.current > DEBOUNCE_MS) {
        lastLoadRef.current = now;
        onLoadMore();
      }
    }
  }, [inView, hasMore, loading, onLoadMore]);

  return { ref };
}

