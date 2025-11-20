/**
 * Search Skeleton Component
 *
 * Loading placeholder for search results
 */

"use client";

import { ImageSkeleton } from "./image-skeleton";

/**
 * Props for SearchSkeleton component
 */
interface SearchSkeletonProps {
  /** Number of skeleton items to display */
  count?: number;
}

/**
 * Search Skeleton Component
 *
 * Displays skeleton loading placeholders for search results
 */
export function SearchSkeleton({ count = 12 }: SearchSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ImageSkeleton
          key={index}
          aspectRatio="square"
          animated={true}
          className="w-full"
        />
      ))}
    </div>
  );
}
