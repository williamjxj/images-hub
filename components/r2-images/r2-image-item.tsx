/**
 * R2 Image Item Component
 * 
 * Displays a single image with lazy loading and error handling.
 * Shows image metadata on hover.
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ImageSkeleton } from "@/components/loading-placeholders/image-skeleton";
import { formatFileSize, formatDate } from "@/lib/utils/image-utils";
import type { R2Object } from "@/types/r2";

interface R2ImageItemProps {
  image: R2Object;
  onClick?: () => void;
}

export function R2ImageItem({ image, onClick }: R2ImageItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (image.isFolder) {
    return null; // Folders are handled separately
  }

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (imageError || !image.url) {
    return (
      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center min-h-[200px]">
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">Failed to load</p>
          <p className="text-xs text-muted-foreground mt-1">{image.name}</p>
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
      aria-label={`View image ${image.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <Image
        src={image.url}
        alt={image.name}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        onError={handleImageError}
        onLoad={handleImageLoad}
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        unoptimized={true}
      />
      {!imageLoaded && (
        <div className="absolute inset-0">
          <ImageSkeleton aspectRatio="square" animated />
        </div>
      )}
      {/* Persistent metadata overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p className="text-white text-xs font-medium truncate" title={image.name}>
          {image.name}
        </p>
        <div className="flex items-center gap-2 mt-1 text-white/80 text-[10px]">
          <span>{formatFileSize(image.size)}</span>
          <span>•</span>
          <span>{formatDate(image.lastModified)}</span>
        </div>
      </div>
    </motion.div>
  );
}

