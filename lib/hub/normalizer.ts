/**
 * Data normalization utilities for converting provider-specific API responses
 * into unified ImageResult format
 */

import type {
  ImageResult,
  UnsplashPhoto,
  PexelsPhoto,
  PixabayHit,
} from "./types";

/**
 * Normalize Unsplash photo to unified ImageResult format
 */
export function normalizeUnsplash(photo: UnsplashPhoto): ImageResult {
  return {
    id: `u-${photo.id}`,
    source: "unsplash",
    urlThumb: photo.urls.small,
    urlRegular: photo.urls.regular,
    urlFull: photo.urls.full,
    width: photo.width,
    height: photo.height,
    description: photo.description || photo.alt_description || null,
    author: photo.user.name,
    authorUrl: photo.user.links?.html || null,
    sourceUrl: photo.links.html,
    tags: photo.tags?.map((tag) => tag.title) || [],
    attribution: `Photo by ${photo.user.name} on Unsplash`,
  };
}

/**
 * Normalize Pexels photo to unified ImageResult format
 */
export function normalizePexels(photo: PexelsPhoto): ImageResult {
  return {
    id: `px-${photo.id}`,
    source: "pexels",
    urlThumb: photo.src.small,
    urlRegular: photo.src.large,
    urlFull: photo.src.original,
    width: photo.width,
    height: photo.height,
    description: photo.alt || null,
    author: photo.photographer,
    authorUrl: photo.photographer_url || null,
    sourceUrl: photo.url,
    tags: photo.alt ? [photo.alt] : [],
    attribution: `Photo by ${photo.photographer} from Pexels`,
  };
}

/**
 * Normalize Pixabay hit to unified ImageResult format
 */
export function normalizePixabay(hit: PixabayHit): ImageResult {
  const tags = hit.tags ? hit.tags.split(", ").filter(Boolean) : [];
  const sourceUrl = `https://pixabay.com/photos/${hit.id}/`;

  return {
    id: `pb-${hit.id}`,
    source: "pixabay",
    urlThumb: hit.webformatURL,
    urlRegular: hit.largeImageURL,
    urlFull: hit.imageURL,
    width: hit.imageWidth,
    height: hit.imageHeight,
    description: null, // Pixabay doesn't provide descriptions
    author: hit.user,
    authorUrl: null, // Pixabay doesn't provide author URLs
    sourceUrl,
    tags,
    attribution: `Image by ${hit.user} from Pixabay`,
  };
}
