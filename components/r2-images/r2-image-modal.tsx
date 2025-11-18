/**
 * R2 Image Modal Component
 * 
 * Displays a full-size image in a modal/lightbox with navigation controls.
 */

"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate } from "@/lib/utils/image-utils";
import type { R2Object } from "@/types/r2";

interface R2ImageModalProps {
  image: R2Object | null;
  images: R2Object[];
  onClose: () => void;
  onNavigate?: (direction: "prev" | "next") => void;
}

export function R2ImageModal({
  image,
  images,
  onClose,
  onNavigate,
}: R2ImageModalProps) {
  const imageFiles = images.filter((img) => !img.isFolder);
  const currentIndex = image
    ? imageFiles.findIndex((img) => img.key === image.key)
    : -1;
  const canLoop = imageFiles.length > 1; // Show navigation buttons only if there are multiple images

  // Keyboard navigation with looping support
  useEffect(() => {
    if (!image || !onNavigate) return;

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
  }, [image, canLoop, onClose, onNavigate]);

  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none overflow-hidden">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {image ? `Image: ${image.name}` : "Image viewer"}
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

            {/* Previous button - always show if there are multiple images (looping enabled) */}
            {canLoop && onNavigate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                aria-label="Previous image (loops to last)"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* Next button - always show if there are multiple images (looping enabled) */}
            {canLoop && onNavigate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                aria-label="Next image (loops to first)"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center p-4"
            >
              <img
                src={image.url}
                alt={image.name}
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
            </motion.div>

            {/* Image metadata */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6"
            >
              <div className="max-w-4xl mx-auto">
                <p className="text-white font-medium text-lg mb-2">{image.name}</p>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span>{formatFileSize(image.size)}</span>
                  <span>•</span>
                  <span>{formatDate(image.lastModified)}</span>
                  {imageFiles.length > 1 && (
                    <>
                      <span>•</span>
                      <span>
                        {currentIndex + 1} of {imageFiles.length}
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

