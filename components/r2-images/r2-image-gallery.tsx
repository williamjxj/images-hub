/**
 * R2 Image Gallery Component
 *
 * Main gallery component that integrates tabs, folder navigation, and image display.
 * Manages state for bucket selection, folder navigation, and image loading.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { R2ImageTabs } from "./r2-image-tabs";
import { R2ImageGrid } from "./r2-image-grid";
import { R2ImageMasonry } from "./r2-image-masonry";
import { R2ImageList } from "./r2-image-list";
import { R2FolderNavigation } from "./r2-folder-navigation";
import { R2DisplayModeSelector } from "./r2-display-mode-selector";
import { R2ImageModal } from "./r2-image-modal";
import { R2VideoModal } from "./r2-video-modal";
import { R2ImageLoading } from "./r2-image-loading";
import { useR2Images } from "@/lib/hooks/use-r2-images";
import { useDisplayMode } from "@/lib/hooks/use-display-mode";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { R2_BUCKETS } from "@/lib/r2/constants";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";
import { AriaLiveRegion } from "@/components/accessibility/aria-live-region";
import { AnimatedText } from "@/components/animations/text-animations";
import { announceToScreenReader } from "@/lib/utils/accessibility";
import { useEffect } from "react";
import type { R2Object, ImageGalleryFilter } from "@/types/r2";

export function R2ImageGallery() {
  const {
    images,
    folders,
    loading,
    error,
    hasMore,
    activeBucket,
    currentFolder,
    loadMore,
    switchBucket,
    navigateToFolder,
  } = useR2Images(R2_BUCKETS[0], "");

  const { displayMode, setDisplayMode } = useDisplayMode();
  const [selectedMedia, setSelectedMedia] = useState<R2Object | null>(null);

  // Announce image loading updates to screen readers
  useEffect(() => {
    if (loading && images.length === 0) {
      announceToScreenReader("Loading images...", "polite");
    } else if (!loading && images.length > 0) {
      announceToScreenReader(
        `Loaded ${images.length} image${images.length > 1 ? "s" : ""}`,
        "polite"
      );
    }
  }, [loading, images.length]);
  const [filter, setFilter] = useState<ImageGalleryFilter>({
    sortBy: "date",
    viewMode: displayMode,
    search: undefined,
    fileTypes: undefined,
  });

  // Infinite scroll
  const { ref: infiniteScrollRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
  });

  // Filter media (images and videos) based on search and file type filters
  const filteredImages = useMemo(() => {
    let filtered = images.filter((img) => !img.isFolder);

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter((img) =>
        img.name.toLowerCase().includes(searchLower)
      );
    }

    // File type filter
    if (filter.fileTypes && filter.fileTypes.length > 0) {
      filtered = filtered.filter((img) => {
        const extension = img.name.split(".").pop()?.toLowerCase();
        return extension && filter.fileTypes!.includes(extension);
      });
    }

    return filtered;
  }, [images, filter.search, filter.fileTypes]);

  // Modal navigation
  const handleMediaClick = useCallback((media: R2Object) => {
    setSelectedMedia(media);
  }, []);

  const handleImageModalNavigate = useCallback(
    (direction: "prev" | "next") => {
      const imageFiles = filteredImages.filter(
        (img) => !img.isFolder && img.mediaType === "image"
      );
      if (imageFiles.length === 0) return;

      const currentIndex =
        selectedMedia && selectedMedia.mediaType === "image"
          ? imageFiles.findIndex((img) => img.key === selectedMedia.key)
          : -1;

      if (currentIndex === -1) return;

      // Looping navigation: wrap around at boundaries
      if (direction === "prev") {
        const prevIndex =
          currentIndex === 0 ? imageFiles.length - 1 : currentIndex - 1;
        setSelectedMedia(imageFiles[prevIndex]);
      } else if (direction === "next") {
        const nextIndex =
          currentIndex === imageFiles.length - 1 ? 0 : currentIndex + 1;
        setSelectedMedia(imageFiles[nextIndex]);
      }
    },
    [filteredImages, selectedMedia]
  );

  const handleVideoModalNavigate = useCallback(
    (direction: "prev" | "next") => {
      const videoFiles = filteredImages.filter(
        (img) => !img.isFolder && img.mediaType === "video"
      );
      if (videoFiles.length === 0) return;

      const currentIndex =
        selectedMedia && selectedMedia.mediaType === "video"
          ? videoFiles.findIndex((v) => v.key === selectedMedia.key)
          : -1;

      if (currentIndex === -1) return;

      // Looping navigation: wrap around at boundaries
      if (direction === "prev") {
        const prevIndex =
          currentIndex === 0 ? videoFiles.length - 1 : currentIndex - 1;
        setSelectedMedia(videoFiles[prevIndex]);
      } else if (direction === "next") {
        const nextIndex =
          currentIndex === videoFiles.length - 1 ? 0 : currentIndex + 1;
        setSelectedMedia(videoFiles[nextIndex]);
      }
    },
    [filteredImages, selectedMedia]
  );

  const renderImages = () => {
    switch (displayMode) {
      case "masonry":
        return (
          <R2ImageMasonry
            images={filteredImages}
            onImageClick={handleMediaClick}
          />
        );
      case "list":
        return (
          <R2ImageList
            images={filteredImages}
            onImageClick={handleMediaClick}
          />
        );
      case "grid":
      default:
        return (
          <R2ImageGrid
            images={filteredImages}
            onImageClick={handleMediaClick}
          />
        );
    }
  };

  return (
    <TooltipProvider>
      <AriaLiveRegion priority="polite">
        {loading ? "Loading images..." : images.length > 0 ? `Loaded ${images.length} images` : ""}
      </AriaLiveRegion>
      <div className="flex flex-col min-h-screen">
        <div className="container mx-auto flex flex-col flex-1">
          {/* Header */}
          <div className="p-4 space-y-2">
            <h1 className="text-3xl font-bold">
              <AnimatedText animation="reveal" delay={0}>
                Cloudflare Images
              </AnimatedText>
            </h1>
            <div className="text-muted-foreground">
              <AnimatedText animation="fade" delay={0.2}>
                Browse and manage your images from Cloudflare R2 storage buckets
              </AnimatedText>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <R2ImageTabs
                buckets={R2_BUCKETS}
                activeBucket={activeBucket}
                onTabChange={switchBucket}
              />
              <R2DisplayModeSelector
                mode={displayMode}
                onModeChange={setDisplayMode}
              />
            </div>
          </div>

          {/* Folder Navigation */}
          {(folders.length > 0 || currentFolder) && (
            <div className="border-b p-4">
              <R2FolderNavigation
                bucket={activeBucket}
                currentFolder={currentFolder}
                folders={folders}
                onFolderClick={navigateToFolder}
                filter={filter}
                onFilterChange={setFilter}
                imageCount={filteredImages.length}
              />
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-4">
            {loading && images.length === 0 ? (
              <R2ImageLoading count={12} mode={displayMode} />
            ) : error ? (
              <Card className="p-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" aria-hidden="true" />
                  <p role="alert">{error}</p>
                </div>
              </Card>
            ) : images.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    No images currently, click Sub-Folder to view more images.
                  </p>
                </div>
              </Card>
            ) : (
              <>
                {renderImages()}
                {/* Infinite scroll trigger */}
                {hasMore && (
                  <div
                    ref={infiniteScrollRef}
                    className="h-20 flex items-center justify-center mt-8"
                  >
                    {loading && <R2ImageLoading count={8} mode={displayMode} />}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Image Modal */}
          {selectedMedia && selectedMedia.mediaType === "image" && (
            <R2ImageModal
              image={selectedMedia}
              images={filteredImages}
              onClose={() => setSelectedMedia(null)}
              onNavigate={handleImageModalNavigate}
            />
          )}

          {/* Video Modal */}
          {selectedMedia && selectedMedia.mediaType === "video" && (
            <R2VideoModal
              video={selectedMedia}
              videos={filteredImages}
              onClose={() => setSelectedMedia(null)}
              onNavigate={handleVideoModalNavigate}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
