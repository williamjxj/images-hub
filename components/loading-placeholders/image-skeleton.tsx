"use client";

/**
 * Image skeleton loading placeholder component
 */

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ShimmerEffect } from "./shimmer-effect";
import { announceToScreenReader } from "@/lib/utils/accessibility";

interface ImageSkeletonProps {
  aspectRatio?: "square" | "landscape" | "portrait" | number;
  className?: string;
  animated?: boolean;
}

const aspectRatioMap = {
  square: "aspect-square",
  landscape: "aspect-video",
  portrait: "aspect-[3/4]",
};

/**
 * Image skeleton placeholder with shimmer animation
 */
export function ImageSkeleton({
  aspectRatio = "square",
  className,
  animated = true,
}: ImageSkeletonProps) {
  const aspectClass =
    typeof aspectRatio === "number"
      ? `aspect-[${aspectRatio}]`
      : aspectRatioMap[aspectRatio];

  // Announce loading state to screen readers
  useEffect(() => {
    announceToScreenReader("Loading image...", "polite");
  }, []);

  return (
    <div
      className={cn(
        "relative bg-muted rounded-lg overflow-hidden",
        aspectClass,
        className
      )}
      aria-label="Loading image"
      role="status"
      aria-live="polite"
    >
      {animated && (
        <ShimmerEffect className="bg-gradient-to-r from-muted via-muted/50 to-muted" />
      )}
    </div>
  );
}
