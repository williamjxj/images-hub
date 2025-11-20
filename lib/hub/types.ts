/**
 * Unified image result structure for all providers
 */
export interface ImageResult {
  id: string; // Prefixed: "u-{id}", "px-{id}", "pb-{id}"
  source: "unsplash" | "pexels" | "pixabay";
  urlThumb: string; // Thumbnail URL (400-640px width)
  urlRegular: string; // Regular size URL (1080-1280px width)
  urlFull: string; // Full-size URL (original)
  width: number;
  height: number;
  description: string | null;
  author: string;
  authorUrl: string | null;
  sourceUrl: string; // Link to image on provider site
  tags: string[];
  attribution: string; // Formatted attribution text
}

/**
 * Legacy image data structure (kept for backward compatibility)
 * @deprecated Use ImageResult instead
 */
export interface ImageData {
  id: string;
  url: string;
  width: number;
  height: number;
  source: "unsplash" | "pixabay" | "pexels";
  author?: string;
  tags?: string[];
}

/**
 * Unsplash API response types
 */
export interface UnsplashPhoto {
  id: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  links: {
    html: string;
  };
  width: number;
  height: number;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  description: string | null;
  alt_description: string | null;
  tags: Array<{
    title: string;
  }>;
}

export interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

/**
 * Pixabay API response types
 */
export interface PixabayHit {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  fullHDURL?: string;
  imageURL: string; // Original size
  imageWidth: number;
  imageHeight: number;
  user: string;
  tags: string; // Comma-separated
}

export interface PixabaySearchResponse {
  hits: PixabayHit[];
  total: number;
  totalHits: number;
}

/**
 * Pexels API response types
 */
export interface PexelsPhoto {
  id: number;
  url: string;
  src: {
    tiny: string;
    small: string;
    medium: string;
    large: string;
    large2x: string;
    original: string;
  };
  width: number;
  height: number;
  photographer: string;
  photographer_url: string;
  alt?: string;
}

export interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
  page: number;
  per_page: number;
}

/**
 * Provider result from search
 */
export interface ProviderResult {
  provider: "unsplash" | "pexels" | "pixabay";
  images: ImageResult[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  error: string | null;
}

/**
 * Complete search response
 */
export interface SearchResponse {
  query: string;
  providers: ProviderResult[];
  totalResults: number;
  hasMore: boolean;
  errors: Record<string, string>; // provider -> error message
}

/**
 * R2 upload result
 */
export interface UploadResult {
  success: boolean;
  key: string;
  url?: string;
  error?: string;
}
