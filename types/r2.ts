/**
 * Type definitions for R2 Images Display feature
 * 
 * These types represent data structures used for displaying images
 * from Cloudflare R2 buckets in a tabbed gallery interface.
 */

/**
 * Supported R2 bucket names
 */
export type R2BucketName =
  | "bestitconsulting-assets"
  | "juewei-assets"
  | "static-assets";

/**
 * Display mode for image gallery
 */
export type DisplayMode = "grid" | "masonry" | "list";

/**
 * Represents a media asset (image or video) stored in Cloudflare R2
 */
export interface R2ImageAsset {
  /** Full object key/path in R2 bucket (e.g., "images/2024/photo.jpg") */
  key: string;
  /** Display name (filename extracted from key) */
  name: string;
  /** File size in bytes */
  size: number;
  /** Last modification timestamp */
  lastModified: Date;
  /** Presigned URL for media access */
  url: string | null;
  /** Expiration time for presigned URL */
  urlExpiresAt: Date | null;
  /** MIME type if available (e.g., "image/jpeg", "video/mp4") */
  mimeType: string | null;
  /** File format/extension (jpg, png, mp4, etc.) */
  type: string;
  /** Media type: "image" or "video" */
  mediaType: "image" | "video";
}

/**
 * Represents a file or folder object in an R2 bucket
 */
export interface R2Object extends R2ImageAsset {
  /** Whether this is a folder (key ends with "/") */
  isFolder: boolean;
}

/**
 * Response from R2 list objects API
 */
export interface R2ListResponse {
  /** List of image files (filtered to supported formats) */
  objects: R2Object[];
  /** List of folders in the current path */
  folders: R2Object[];
  /** Whether more objects are available (pagination) */
  hasMore: boolean;
  /** Continuation token for next page (null if no more pages) */
  nextToken: string | null;
}

/**
 * Client-side state for the image gallery UI
 */
export interface ImageGalleryState {
  /** Currently loaded images for current folder */
  images: R2Object[];
  /** Folders in current path */
  folders: R2Object[];
  /** Whether images are loading */
  loading: boolean;
  /** Error message if loading fails */
  error: string | null;
  /** Whether more images available */
  hasMore: boolean;
  /** Continuation token for pagination */
  cursor: string | undefined;
  /** Currently selected bucket name */
  activeBucket: R2BucketName;
  /** Current folder navigation path */
  currentFolder: string;
}

/**
 * Filter and search state for image gallery
 */
export interface ImageGalleryFilter {
  /** Sort option */
  sortBy: "date" | "name" | "size";
  /** Display mode */
  viewMode: DisplayMode;
  /** Search query string */
  search?: string;
  /** File type filters */
  fileTypes?: string[];
}

/**
 * Represents the current navigation path within a bucket
 */
export interface FolderPath {
  /** Bucket name */
  bucket: R2BucketName;
  /** Folder path (e.g., "images/2024/") */
  path: string;
  /** Array of folder names in path */
  parts: string[];
}

/**
 * Breadcrumb item for folder navigation
 */
export interface BreadcrumbItem {
  /** Display name */
  name: string;
  /** Folder path (empty string for root) */
  path: string;
}

