/**
 * R2 Video Modal Component
 * 
 * Displays a video player in a modal/lightbox with navigation controls.
 */

"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate } from "@/lib/utils/image-utils";
import type { R2Object } from "@/types/r2";

interface R2VideoModalProps {
  video: R2Object | null;
  videos: R2Object[];
  onClose: () => void;
  onNavigate?: (direction: "prev" | "next") => void;
}

export function R2VideoModal({
  video,
  videos,
  onClose,
  onNavigate,
}: R2VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoFiles = videos.filter((v) => v.mediaType === "video");
  const currentIndex = video
    ? videoFiles.findIndex((v) => v.key === video.key)
    : -1;
  const canLoop = videoFiles.length > 1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < videoFiles.length - 1;

  // Keyboard navigation with looping support
  useEffect(() => {
    if (!video || !onNavigate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && canLoop) {
        onNavigate("prev");
      } else if (e.key === "ArrowRight" && canLoop) {
        onNavigate("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [video, canLoop, onClose, onNavigate]);

  // Reset video when video changes
  useEffect(() => {
    if (videoRef.current && video) {
      videoRef.current.load();
    }
  }, [video]);

  if (!video) return null;

  return (
    <Dialog open={!!video} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none overflow-hidden">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {video ? `Video: ${video.name}` : "Video viewer"}
        </DialogTitle>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Previous button */}
          {canLoop && onNavigate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("prev")}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              aria-label="Previous video (loops to last)"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Next button */}
          {canLoop && onNavigate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("next")}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              aria-label="Next video (loops to first)"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Video Player */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full flex items-center justify-center p-4"
          >
            <video
              ref={videoRef}
              src={video.url || undefined}
              controls
              className="max-w-full max-h-full"
              autoPlay
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </motion.div>

          {/* Video metadata */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6"
          >
            <div className="max-w-4xl mx-auto">
              <p className="text-white font-medium text-lg mb-2">{video.name}</p>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span>{formatFileSize(video.size)}</span>
                <span>•</span>
                <span>{formatDate(video.lastModified)}</span>
                {videoFiles.length > 1 && (
                  <>
                    <span>•</span>
                    <span>
                      {currentIndex + 1} of {videoFiles.length}
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

