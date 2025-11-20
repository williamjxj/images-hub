/**
 * R2 Image Loading Skeleton Component
 * 
 * Displays skeleton loaders for images while they're loading.
 */

"use client";

import { motion } from "framer-motion";

interface R2ImageLoadingProps {
  count?: number;
  mode?: "grid" | "masonry" | "list";
}

export function R2ImageLoading({
  count = 12,
  mode = "grid",
}: R2ImageLoadingProps) {
  if (mode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-3 rounded-lg border bg-muted animate-pulse"
          >
            <div className="w-24 h-24 rounded bg-muted-foreground/20" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
              <div className="h-3 w-1/2 rounded bg-muted-foreground/20" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (mode === "masonry") {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="break-inside-avoid mb-4 w-full"
          >
            <div className="w-full rounded-lg bg-muted animate-pulse" style={{ height: `${[150, 200, 180, 220, 160, 190, 170, 210, 185, 195, 175, 205][i % 12]}px` }} />
          </motion.div>
        ))}
      </div>
    );
  }

  // Grid mode (default)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          className="aspect-square w-full bg-muted animate-pulse rounded-lg"
        />
      ))}
    </div>
  );
}

