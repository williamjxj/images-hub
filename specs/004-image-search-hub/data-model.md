# Data Model: Stock Image Search Hub

**Feature**: Stock Image Search Hub  
**Date**: 2025-01-27  
**Status**: Complete

This document defines the data structures and entities for the Stock Image Search Hub feature.

---

## Entities

### 1. ImageResult

**Description**: Unified representation of an image from any provider (Unsplash, Pixabay, or Pexels)

**Attributes**:

| Field         | Type                                  | Required | Description                            | Example                                    |
| ------------- | ------------------------------------- | -------- | -------------------------------------- | ------------------------------------------ |
| `id`          | `string`                              | Yes      | Unique identifier with provider prefix | `"u-abc123"`, `"px-456789"`, `"pb-789012"` |
| `source`      | `'unsplash' \| 'pexels' \| 'pixabay'` | Yes      | Provider source                        | `"unsplash"`                               |
| `urlThumb`    | `string`                              | Yes      | Thumbnail URL (400-640px width)        | `"https://images.unsplash.com/..."`        |
| `urlRegular`  | `string`                              | Yes      | Regular size URL (1080-1280px width)   | `"https://images.unsplash.com/..."`        |
| `urlFull`     | `string`                              | Yes      | Full-size URL (original)               | `"https://images.unsplash.com/..."`        |
| `width`       | `number`                              | Yes      | Image width in pixels                  | `1920`                                     |
| `height`      | `number`                              | Yes      | Image height in pixels                 | `1080`                                     |
| `description` | `string \| null`                      | Yes      | Image description/alt text             | `"Beautiful sunset over mountains"`        |
| `author`      | `string`                              | Yes      | Photographer/creator name              | `"John Doe"`                               |
| `authorUrl`   | `string \| null`                      | Yes      | Link to photographer's profile         | `"https://unsplash.com/@johndoe"`          |
| `sourceUrl`   | `string`                              | Yes      | Link to image on provider site         | `"https://unsplash.com/photos/abc123"`     |
| `tags`        | `string[]`                            | Yes      | Array of tags/keywords                 | `["sunset", "mountains", "nature"]`        |
| `attribution` | `string`                              | Yes      | Formatted attribution text             | `"Photo by John Doe on Unsplash"`          |

**Relationships**:

- Belongs to a `SearchQuery` (many-to-one)
- Grouped by `Provider` (many-to-one)

**Validation Rules**:

- `id` must start with provider prefix (`u-`, `px-`, `pb-`)
- `urlThumb`, `urlRegular`, `urlFull` must be valid URLs
- `width` and `height` must be positive numbers
- `tags` must be non-empty array (can be empty array `[]`)

**Example**:

```typescript
{
  id: "u-abc123",
  source: "unsplash",
  urlThumb: "https://images.unsplash.com/photo-123?w=400",
  urlRegular: "https://images.unsplash.com/photo-123?w=1080",
  urlFull: "https://images.unsplash.com/photo-123",
  width: 1920,
  height: 1080,
  description: "Beautiful sunset over mountains",
  author: "John Doe",
  authorUrl: "https://unsplash.com/@johndoe",
  sourceUrl: "https://unsplash.com/photos/abc123",
  tags: ["sunset", "mountains", "nature"],
  attribution: "Photo by John Doe on Unsplash"
}
```

---

### 2. SearchQuery

**Description**: Represents a user's search request with query text and provider selections

**Attributes**:

| Field       | Type                                      | Required | Description                     | Example                  |
| ----------- | ----------------------------------------- | -------- | ------------------------------- | ------------------------ |
| `query`     | `string`                                  | Yes      | Search query text               | `"sunset mountains"`     |
| `providers` | `('unsplash' \| 'pexels' \| 'pixabay')[]` | Yes      | Selected providers to search    | `["unsplash", "pexels"]` |
| `page`      | `number`                                  | Yes      | Current page number (1-indexed) | `1`                      |
| `perPage`   | `number`                                  | Yes      | Results per page per provider   | `20`                     |

**Relationships**:

- Has many `ImageResult` (one-to-many)
- Has many `ProviderResult` (one-to-many)

**Validation Rules**:

- `query` must be non-empty string (trimmed)
- `providers` must contain at least one provider
- `page` must be positive integer (>= 1)
- `perPage` must be between 1 and 200

**Example**:

```typescript
{
  query: "sunset mountains",
  providers: ["unsplash", "pexels", "pixabay"],
  page: 1,
  perPage: 20
}
```

---

### 3. ProviderResult

**Description**: Represents search results from a single provider

**Attributes**:

| Field         | Type                                  | Required | Description                           | Example                           |
| ------------- | ------------------------------------- | -------- | ------------------------------------- | --------------------------------- |
| `provider`    | `'unsplash' \| 'pexels' \| 'pixabay'` | Yes      | Provider name                         | `"unsplash"`                      |
| `images`      | `ImageResult[]`                       | Yes      | Array of normalized image results     | `[...]`                           |
| `total`       | `number`                              | Yes      | Total results available from provider | `1250`                            |
| `totalPages`  | `number`                              | Yes      | Total pages available                 | `63`                              |
| `currentPage` | `number`                              | Yes      | Current page number                   | `1`                               |
| `hasMore`     | `boolean`                             | Yes      | Whether more pages are available      | `true`                            |
| `error`       | `string \| null`                      | Yes      | Error message if provider failed      | `null` or `"Rate limit exceeded"` |

**Relationships**:

- Belongs to a `SearchQuery` (many-to-one)
- Has many `ImageResult` (one-to-many)

**Validation Rules**:

- `images` must be array (can be empty if error occurred)
- `total` must be non-negative integer
- `totalPages` must be positive integer (>= 1)
- `currentPage` must be positive integer (>= 1)
- If `error` is not null, `images` may be empty

**Example**:

```typescript
{
  provider: "unsplash",
  images: [
    { id: "u-abc123", ... },
    { id: "u-def456", ... }
  ],
  total: 1250,
  totalPages: 63,
  currentPage: 1,
  hasMore: true,
  error: null
}
```

---

### 4. SearchResponse

**Description**: Complete search response containing results from all providers

**Attributes**:

| Field          | Type                     | Required | Description                                      | Example                                |
| -------------- | ------------------------ | -------- | ------------------------------------------------ | -------------------------------------- |
| `query`        | `string`                 | Yes      | Original search query                            | `"sunset mountains"`                   |
| `providers`    | `ProviderResult[]`       | Yes      | Results grouped by provider                      | `[...]`                                |
| `totalResults` | `number`                 | Yes      | Total images across all providers                | `3750`                                 |
| `hasMore`      | `boolean`                | Yes      | Whether more results available from any provider | `true`                                 |
| `errors`       | `Record<string, string>` | Yes      | Provider-specific errors                         | `{ "pixabay": "Rate limit exceeded" }` |

**Relationships**:

- Contains many `ProviderResult` (one-to-many)
- Contains many `ImageResult` (one-to-many, via ProviderResult)

**Validation Rules**:

- `providers` must contain results for all requested providers (even if empty/error)
- `providers` must be ordered: Unsplash → Pixabay → Pexels
- `totalResults` must equal sum of all provider totals
- `hasMore` must be true if any provider has more results

**Example**:

```typescript
{
  query: "sunset mountains",
  providers: [
    {
      provider: "unsplash",
      images: [...],
      total: 1250,
      totalPages: 63,
      currentPage: 1,
      hasMore: true,
      error: null
    },
    {
      provider: "pixabay",
      images: [...],
      total: 2000,
      totalPages: 100,
      currentPage: 1,
      hasMore: true,
      error: null
    },
    {
      provider: "pexels",
      images: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      hasMore: false,
      error: "Rate limit exceeded"
    }
  ],
  totalResults: 3250,
  hasMore: true,
  errors: {
    "pexels": "Rate limit exceeded"
  }
}
```

---

## State Transitions

### Search Flow

1. **Initial State**: No search performed
   - `query`: `""`
   - `providers`: `["unsplash", "pexels", "pixabay"]` (all selected)
   - `results`: `[]`
   - `loading`: `false`

2. **Search Initiated**: User submits query
   - `query`: User input
   - `providers`: Selected providers
   - `results`: `[]`
   - `loading`: `true`
   - `page`: `1`

3. **Search In Progress**: API calls in flight
   - `loading`: `true`
   - `errors`: `{}`

4. **Search Complete**: Results received
   - `loading`: `false`
   - `results`: `ImageResult[]` (grouped by provider)
   - `errors`: Provider-specific errors (if any)
   - `hasMore`: `true` if more pages available

5. **Load More**: User scrolls to bottom
   - `page`: Incremented
   - `loading`: `true`
   - `results`: Appended with new results

6. **Error State**: Provider fails
   - `errors`: Updated with provider error
   - `results`: Partial results from successful providers
   - `loading`: `false`

---

## Data Normalization

### Normalization Functions

Each provider requires a normalization function to convert provider-specific responses to `ImageResult`:

1. **`normalizeUnsplash(photo: UnsplashPhoto): ImageResult`**
   - Maps Unsplash response to unified format
   - Prefixes ID with `"u-"`
   - Extracts URLs from `urls` object
   - Formats attribution

2. **`normalizePexels(photo: PexelsPhoto): ImageResult`**
   - Maps Pexels response to unified format
   - Prefixes ID with `"px-"`
   - Extracts URLs from `src` object
   - Formats attribution

3. **`normalizePixabay(hit: PixabayHit): ImageResult`**
   - Maps Pixabay response to unified format
   - Prefixes ID with `"pb-"`
   - Extracts URLs from hit object
   - Formats attribution

**See**: `lib/hub/normalizer.ts` (to be created)

---

## Type Definitions

### TypeScript Interfaces

```typescript
// Unified image result
export interface ImageResult {
  id: string;
  source: "unsplash" | "pexels" | "pixabay";
  urlThumb: string;
  urlRegular: string;
  urlFull: string;
  width: number;
  height: number;
  description: string | null;
  author: string;
  authorUrl: string | null;
  sourceUrl: string;
  tags: string[];
  attribution: string;
}

// Search query
export interface SearchQuery {
  query: string;
  providers: ("unsplash" | "pexels" | "pixabay")[];
  page: number;
  perPage: number;
}

// Provider result
export interface ProviderResult {
  provider: "unsplash" | "pexels" | "pixabay";
  images: ImageResult[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  error: string | null;
}

// Complete search response
export interface SearchResponse {
  query: string;
  providers: ProviderResult[];
  totalResults: number;
  hasMore: boolean;
  errors: Record<string, string>;
}
```

**Location**: `lib/hub/types.ts` (to be enhanced)

---

## Validation Rules Summary

### ImageResult

- ✅ ID must have provider prefix
- ✅ URLs must be valid HTTP/HTTPS URLs
- ✅ Dimensions must be positive integers
- ✅ Tags must be array of strings

### SearchQuery

- ✅ Query must be non-empty (trimmed)
- ✅ At least one provider must be selected
- ✅ Page must be >= 1
- ✅ PerPage must be 1-200

### ProviderResult

- ✅ Total must be non-negative
- ✅ Pages must be >= 1
- ✅ If error, images may be empty

### SearchResponse

- ✅ Providers must match requested providers
- ✅ Providers must be in correct order
- ✅ Total must match sum of provider totals

---

**Next Steps**: See `contracts/api-images-hub.yaml` for API endpoint definitions.
