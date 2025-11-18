/**
 * R2 Image Masonry Component
 * 
 * Displays images in a masonry (Pinterest-style) layout using CSS columns.
 * Images maintain their natural aspect ratios.
 */

"use client";

import { R2MediaItem } from "./r2-media-item";
import type { R2Object } from "@/types/r2";

interface R2ImageMasonryProps {
  images: R2Object[];
  onImageClick?: (image: R2Object) => void;
}

export function R2ImageMasonry({ images, onImageClick }: R2ImageMasonryProps) {
  const mediaFiles = images.filter((img) => !img.isFolder);

  if (mediaFiles.length === 0) {
    return null;
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
      {mediaFiles.map((media) => (
        <div key={media.key} className="break-inside-avoid mb-4 w-full">
          <R2MediaItem
            media={media}
            onClick={() => onImageClick?.(media)}
          />
        </div>
      ))}
    </div>
  );
}

