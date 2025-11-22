/**
 * R2 Image Tabs Component
 *
 * Displays three tabs for the three R2 buckets, allowing users to switch between buckets.
 * Uses modern animated tabs with smooth transitions and glassmorphism design.
 */

"use client";

import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Building2, Folder, Database } from "lucide-react";
import type { R2BucketName } from "@/types/r2";

interface R2ImageTabsProps {
  buckets: readonly R2BucketName[];
  activeBucket: R2BucketName;
  onTabChange: (bucket: R2BucketName) => void;
}

const BUCKET_ICONS = {
  "bestitconsulting-assets": Building2,
  "juewei-assets": Folder,
  "static-assets": Database,
} as const;

export function R2ImageTabs({
  buckets,
  activeBucket,
  onTabChange,
}: R2ImageTabsProps) {
  const tabs = buckets.map((bucket) => ({
    id: bucket,
    label: bucket,
    icon: BUCKET_ICONS[bucket as keyof typeof BUCKET_ICONS],
  }));

  return (
    <AnimatedTabs
      tabs={tabs}
      activeTab={activeBucket}
      onTabChange={(tabId) => onTabChange(tabId as R2BucketName)}
      className="w-auto"
      whiteText
    />
  );
}
