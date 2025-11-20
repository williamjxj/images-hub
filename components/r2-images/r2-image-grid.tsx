/**
 * R2 Image Grid Component
 *
 * Displays images in a responsive CSS Grid layout.
 * Supports 2 columns (mobile), 3 columns (tablet), 4 columns (desktop).
 */

"use client";

import { R2MediaItem } from "./r2-media-item";
import type { R2Object } from "@/types/r2";

interface R2ImageGridProps {
  images: R2Object[];
  onImageClick?: (image: R2Object) => void;
}

export function R2ImageGrid({ images, onImageClick }: R2ImageGridProps) {
  const mediaFiles = images.filter((img) => !img.isFolder);

  if (mediaFiles.length === 0) {
    return null;
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      role="grid"
      aria-label="Media gallery"
    >
      {mediaFiles.map((media, index) => (
        <div
          key={media.key}
          className="aspect-square w-full"
          role="gridcell"
          aria-rowindex={Math.floor(index / 4) + 1}
          aria-colindex={(index % 4) + 1}
        >
          <R2MediaItem media={media} onClick={() => onImageClick?.(media)} />
        </div>
      ))}
    </div>
  );
}
