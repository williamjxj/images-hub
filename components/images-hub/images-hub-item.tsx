/**
 * Image Item Component for Images Hub
 *
 * Displays a single image with metadata overlay and click handler
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { ImageSkeleton } from "@/components/loading-placeholders/image-skeleton";
import type { ImageResult } from "@/lib/hub/types";

interface ImagesHubItemProps {
  image: ImageResult;
  onClick?: () => void;
}

export function ImagesHubItem({ image, onClick }: ImagesHubItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (imageError) {
    return (
      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center min-h-[200px]">
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">Failed to load</p>
          <p className="text-xs text-muted-foreground mt-1">
            {image.description || image.id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: imageLoaded ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="relative group cursor-pointer overflow-hidden rounded-lg bg-muted w-full aspect-square"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View image ${image.description || image.id}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <Image
        src={image.urlRegular}
        alt={image.description || image.attribution}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        onError={handleImageError}
        onLoad={handleImageLoad}
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        quality={85}
      />
      {!imageLoaded && (
        <div className="absolute inset-0">
          <ImageSkeleton aspectRatio="square" animated />
        </div>
      )}

      {/* Provider badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md backdrop-blur-sm">
        {image.source}
      </div>

      {/* Metadata overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p
          className="text-white text-xs font-medium truncate"
          title={image.description || image.id}
        >
          {image.description || image.attribution}
        </p>
        <div className="flex items-center gap-2 mt-1 text-white/80 text-[10px]">
          <span>{image.author}</span>
          {image.sourceUrl && (
            <a
              href={image.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-white transition-colors"
              aria-label={`View on ${image.source}`}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
