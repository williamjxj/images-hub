/**
 * R2 Bucket Navigation Component
 *
 * Displays a vertical sidebar menu for R2 buckets.
 * Bucket names remain stable and visible for navigation.
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Building2, Folder, Database, Baby, LucideIcon } from "lucide-react";
import type { R2BucketName } from "@/types/r2";

interface R2ImageTabsProps {
  buckets: readonly R2BucketName[];
  activeBucket: R2BucketName;
  onTabChange: (bucket: R2BucketName) => void;
}

const BUCKET_ICONS: Record<R2BucketName, LucideIcon> = {
  "bestitconsulting-assets": Building2,
  "juewei-assets": Folder,
  "static-assets": Database,
  "friendshipdaycare": Baby,
} as const;

export function R2ImageTabs({
  buckets,
  activeBucket,
  onTabChange,
}: R2ImageTabsProps) {
  return (
    <div className="flex flex-col" role="navigation" aria-label="Bucket navigation">
      <div className="px-3 py-2 mb-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Buckets
        </h2>
      </div>

      <div className="flex flex-col gap-1">
        {buckets.map((bucket) => {
          const isActive = activeBucket === bucket;
          const Icon = BUCKET_ICONS[bucket];

          return (
            <button
              key={bucket}
              onClick={() => onTabChange(bucket)}
              className={cn(
                "relative z-10 px-4 py-3 text-sm font-medium transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "rounded-lg cursor-pointer flex items-center gap-3 w-full text-left",
                "hover:bg-muted/50",
                isActive
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${bucket}`}
              id={`tab-${bucket}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBucket"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border border-primary/20"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
              
              <motion.span
                className="relative z-10 flex items-center gap-3 flex-1"
                animate={{
                  scale: isActive ? 1 : 0.98,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                {Icon && (
                  <Icon 
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} 
                    strokeWidth={2} 
                  />
                )}
                <span className="truncate">{bucket}</span>
              </motion.span>

              {isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 h-8 w-1 rounded-r-full bg-primary"
                  initial={{ opacity: 0, y: "-50%" }}
                  animate={{ opacity: 1, y: "-50%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
