/**
 * R2 Media Item Component
 * 
 * Displays a single image or video with lazy loading and error handling.
 * Shows media metadata on hover. Videos display with a play button overlay.
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils/image-utils";
import type { R2Object } from "@/types/r2";

interface R2MediaItemProps {
  media: R2Object;
  onClick?: () => void;
}

export function R2MediaItem({ media, onClick }: R2MediaItemProps) {
  const [mediaError, setMediaError] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const isVideo = media.mediaType === "video";

  if (media.isFolder) {
    return null; // Folders are handled separately
  }

  const handleMediaError = () => {
    setMediaError(true);
  };

  const handleMediaLoad = () => {
    setMediaLoaded(true);
  };

  if (mediaError || !media.url) {
    return (
      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center min-h-[200px]">
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">Failed to load</p>
          <p className="text-xs text-muted-foreground mt-1">{media.name}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: mediaLoaded ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="relative group cursor-pointer overflow-hidden rounded-lg bg-muted w-full h-full"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${isVideo ? "video" : "image"} ${media.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {isVideo ? (
        <>
          {/* Video thumbnail with play button */}
          <video
            src={media.url}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            preload="metadata"
            onError={handleMediaError}
            onLoadedMetadata={handleMediaLoad}
            muted
          />
          {!mediaLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-black ml-1" fill="currentColor" />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Image */}
          <img
            src={media.url}
            alt={media.name}
            loading="lazy"
            onError={handleMediaError}
            onLoad={handleMediaLoad}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          {!mediaLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
        </>
      )}
      
      {/* Persistent metadata overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p className="text-white text-xs font-medium truncate" title={media.name}>
          {media.name}
        </p>
        <div className="flex items-center gap-2 mt-1 text-white/80 text-[10px]">
          <span>{formatFileSize(media.size)}</span>
          <span>•</span>
          <span>{formatDate(media.lastModified)}</span>
          {isVideo && <span>•</span>}
          {isVideo && <span>Video</span>}
        </div>
      </div>
    </motion.div>
  );
}

