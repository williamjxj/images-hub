/**
 * Utility functions for image and video format validation and sorting
 */

const SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const SUPPORTED_VIDEO_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".mov",
  ".avi",
  ".mkv",
  ".m4v",
];

/**
 * Check if a file key represents an image file based on extension
 * @param key - Object key/path from R2
 * @returns true if the file has a supported image extension
 */
export function isImageFile(key: string): boolean {
  const ext = key.toLowerCase().substring(key.lastIndexOf("."));
  return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Check if a file key represents a video file based on extension
 * @param key - Object key/path from R2
 * @returns true if the file has a supported video extension
 */
export function isVideoFile(key: string): boolean {
  const ext = key.toLowerCase().substring(key.lastIndexOf("."));
  return SUPPORTED_VIDEO_EXTENSIONS.includes(ext);
}

/**
 * Check if a file key represents a media file (image or video)
 * @param key - Object key/path from R2
 * @returns true if the file has a supported media extension
 */
export function isMediaFile(key: string): boolean {
  return isImageFile(key) || isVideoFile(key);
}

/**
 * Get media type from file key
 * @param key - Object key/path from R2
 * @returns "image", "video", or null
 */
export function getMediaType(key: string): "image" | "video" | null {
  if (isImageFile(key)) return "image";
  if (isVideoFile(key)) return "video";
  return null;
}

/**
 * Sort images by lastModified date (newest first)
 * @param images - Array of image objects to sort
 * @returns Sorted array with newest images first
 */
export function sortImagesByDate<
  T extends { lastModified: Date | string | null | undefined },
>(images: T[]): T[] {
  return [...images].sort((a, b) => {
    // Handle missing lastModified gracefully
    if (!a.lastModified && !b.lastModified) return 0;
    if (!a.lastModified) return 1; // Put missing dates at end
    if (!b.lastModified) return -1;

    // Convert to Date objects if strings
    const dateA =
      typeof a.lastModified === "string"
        ? new Date(a.lastModified)
        : a.lastModified;
    const dateB =
      typeof b.lastModified === "string"
        ? new Date(b.lastModified)
        : b.lastModified;

    // Handle invalid dates
    const timeA =
      dateA instanceof Date && !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
    const timeB =
      dateB instanceof Date && !isNaN(dateB.getTime()) ? dateB.getTime() : 0;

    // Sort descending (newest first)
    return timeB - timeA;
  });
}

/**
 * Format file size in bytes to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format date to readable string
 * @param date - Date object or date string
 * @returns Formatted date string (e.g., "Jan 15, 2024") or "Invalid date" if date is invalid
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Unknown date";

  // Convert string to Date if needed
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
}
