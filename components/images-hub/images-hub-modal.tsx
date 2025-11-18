/**
 * Image Modal Component for Images Hub
 * 
 * Displays full-size image with attribution and download options
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, Copy, Download } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ImageResult } from "@/lib/hub/types";

interface ImagesHubModalProps {
  image: ImageResult | null;
  onClose: () => void;
}

export function ImagesHubModal({ image, onClose }: ImagesHubModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [image, onClose]);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  const handleCopyAttribution = async () => {
    if (!image) return;
    try {
      await navigator.clipboard.writeText(image.attribution);
      // Could add toast notification here
    } catch (error) {
      console.error("Failed to copy attribution:", error);
    }
  };

  const handleDownload = () => {
    if (!image?.sourceUrl) return;
    window.open(image.sourceUrl, "_blank", "noopener,noreferrer");
  };

  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none overflow-hidden">
        <DialogTitle className="sr-only">
          {image ? `Image: ${image.description || image.attribution}` : "Image viewer"}
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

          {/* Image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full flex items-center justify-center p-4"
          >
            {!imageError ? (
              <Image
                src={image.urlFull}
                alt={image.description || image.attribution}
                width={image.width}
                height={image.height}
                className="max-w-full max-h-full object-contain"
                quality={95}
                onError={() => setImageError(true)}
                unoptimized={false}
              />
            ) : (
              <div className="text-white text-center">
                <p>Failed to load image</p>
              </div>
            )}
          </motion.div>

          {/* Image metadata and actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-white font-medium text-lg mb-2">
                    {image.description || image.attribution}
                  </p>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span>By {image.author}</span>
                    <span>•</span>
                    <span className="capitalize">{image.source}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAttribution}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Attribution
                  </Button>
                  {image.sourceUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on {image.source}
                    </Button>
                  )}
                </div>
              </div>
              {image.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {image.tags.slice(0, 10).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

