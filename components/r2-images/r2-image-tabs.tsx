/**
 * R2 Image Tabs Component
 * 
 * Displays three tabs for the three R2 buckets, allowing users to switch between buckets.
 * Uses shadcn/ui Tabs component with Framer Motion animations.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { R2BucketName } from "@/types/r2";

interface R2ImageTabsProps {
  buckets: readonly R2BucketName[];
  activeBucket: R2BucketName;
  onTabChange: (bucket: R2BucketName) => void;
}

export function R2ImageTabs({
  buckets,
  activeBucket,
  onTabChange,
}: R2ImageTabsProps) {
  return (
    <Tabs
      value={activeBucket}
      onValueChange={(value) => onTabChange(value as R2BucketName)}
      className="w-full"
      aria-label="R2 bucket selection"
    >
      <TabsList className="w-full justify-start" role="tablist">
        <AnimatePresence mode="wait">
          {buckets.map((bucket) => (
            <motion.div
              key={bucket}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsTrigger
                value={bucket}
                role="tab"
                aria-selected={activeBucket === bucket}
                aria-controls={`panel-${bucket}`}
                id={`tab-${bucket}`}
              >
                {bucket}
              </TabsTrigger>
            </motion.div>
          ))}
        </AnimatePresence>
      </TabsList>
    </Tabs>
  );
}

