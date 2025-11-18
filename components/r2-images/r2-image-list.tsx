/**
 * R2 Image List Component
 * 
 * Displays images in a horizontal list layout with thumbnails and metadata.
 * Efficient for browsing many images quickly.
 */

"use client";

import { Play } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils/image-utils";
import type { R2Object } from "@/types/r2";

interface R2ImageListProps {
  images: R2Object[];
  onImageClick?: (image: R2Object) => void;
}

export function R2ImageList({ images, onImageClick }: R2ImageListProps) {
  const mediaFiles = images.filter((img) => !img.isFolder);

  if (mediaFiles.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2" role="list" aria-label="Media list">
      {mediaFiles.map((media, index) => {
        const isVideo = media.mediaType === "video";
        return (
          <div
            key={media.key}
            onClick={() => onImageClick?.(media)}
            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
            role="listitem"
            tabIndex={0}
            aria-label={`${isVideo ? "Video" : "Image"} ${index + 1}: ${media.name}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onImageClick?.(media);
              }
            }}
          >
            <div className="flex-shrink-0 w-24 h-24 rounded overflow-hidden bg-muted relative">
              {media.url ? (
                <>
                  {isVideo ? (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-6 w-6 text-white" fill="currentColor" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  No media
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{media.name}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>{formatFileSize(media.size)}</span>
                <span>•</span>
                <span>{formatDate(media.lastModified)}</span>
                {isVideo && <span>•</span>}
                {isVideo && <span>Video</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

