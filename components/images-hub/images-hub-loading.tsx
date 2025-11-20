/**
 * Loading Component for Images Hub
 *
 * Displays loading skeletons for image grid
 */

"use client";

import { motion } from "framer-motion";

interface ImagesHubLoadingProps {
  count?: number;
}

export function ImagesHubLoading({ count = 12 }: ImagesHubLoadingProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
      {skeletons.map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          className="break-inside-avoid mb-4 w-full bg-muted animate-pulse rounded-lg aspect-square"
        />
      ))}
    </div>
  );
}
