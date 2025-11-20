# Research & Technical Decisions: Stock Image Search Hub

**Feature**: Stock Image Search Hub  
**Date**: 2025-01-27  
**Status**: Complete

This document consolidates research findings and technical decisions for implementing the unified image search hub that aggregates results from Unsplash, Pixabay, and Pexels APIs.

---

## 1. API Integration Research

### 1.1 Unsplash API

**Decision**: Use `/search/photos` endpoint with query parameter support

**Rationale**:

- Existing implementation in `lib/hub/unsplash-client.ts` uses `/search/photos` endpoint
- Supports query-based search with pagination
- Returns structured response with `results` array
- Provides multiple image sizes (thumbnails, regular, full)

**API Details**:

- **Base URL**: `https://api.unsplash.com`
- **Search Endpoint**: `/search/photos`
- **Authentication**: `Authorization: Client-ID {accessKey}` header
- **Parameters**:
  - `query` (required): Search query string
  - `per_page` (optional): Results per page (default: 10, max: 30)
  - `page` (optional): Page number (default: 1)
  - `order_by` (optional): `latest`, `oldest`, `popular` (default: `relevant`)
  - `orientation` (optional): `landscape`, `portrait`, `squarish`
- **Response Structure**:
  ```typescript
  {
    total: number;
    total_pages: number;
    results: Array<{
      id: string;
      urls: { regular: string; full: string; small: string; thumb: string };
      width: number;
      height: number;
      user: { name: string; username: string };
      description: string | null;
      alt_description: string | null;
      tags: Array<{ title: string }>;
    }>;
  }
  ```

**Rate Limits**:

- Free tier: 50 requests/hour
- Rate limit headers: `X-Ratelimit-Limit`, `X-Ratelimit-Remaining`
- HTTP 403 when rate limited

**Image Sizes**:

- `thumb`: 200px width
- `small`: 400px width (good for thumbnails)
- `regular`: 1080px width (good for grid display)
- `full`: Original size (for detail view)

**Attribution Requirements**:

- Must credit photographer: "Photo by {user.name} on Unsplash"
- Link to Unsplash: `https://unsplash.com/?utm_source={app_name}&utm_medium=referral`

**Alternatives Considered**:

- `/photos/random`: Rejected - doesn't support search queries
- `/photos/{id}`: Rejected - requires specific photo ID, not search

**References**:

- Existing implementation: `lib/hub/unsplash-client.ts`
- API docs: https://unsplash.com/documentation#search-photos

---

### 1.2 Pexels API

**Decision**: Use `/v1/search` endpoint with query parameter support

**Rationale**:

- Existing implementation in `lib/hub/pexels-client.ts` uses `/v1/search` endpoint
- Simple query-based search with pagination
- Returns structured response with `photos` array
- Provides multiple image sizes (large, medium, small, portrait, landscape)

**API Details**:

- **Base URL**: `https://api.pexels.com/v1`
- **Search Endpoint**: `/search`
- **Authentication**: `Authorization: {apiKey}` header
- **Parameters**:
  - `query` (required): Search query string
  - `per_page` (optional): Results per page (default: 15, max: 80)
  - `page` (optional): Page number (default: 1)
  - `orientation` (optional): `landscape`, `portrait`, `square`
  - `size` (optional): `large`, `medium`, `small`
  - `color` (optional): Hex color code for color filtering
- **Response Structure**:
  ```typescript
  {
    total_results: number;
    page: number;
    per_page: number;
    photos: Array<{
      id: number;
      width: number;
      height: number;
      url: string;
      photographer: string;
      photographer_url: string;
      src: {
        original: string;
        large: string;
        large2x: string;
        medium: string;
        small: string;
        portrait: string;
        landscape: string;
        tiny: string;
      };
      alt: string;
    }>;
  }
  ```

**Rate Limits**:

- Free tier: 200 requests/hour
- Rate limit headers: `X-Ratelimit-Limit`, `X-Ratelimit-Remaining`
- HTTP 429 when rate limited

**Image Sizes**:

- `tiny`: 350px width
- `small`: 400px width (good for thumbnails)
- `medium`: 600px width
- `large`: 1280px width (good for grid display)
- `large2x`: 2560px width
- `original`: Original size (for detail view)

**Attribution Requirements**:

- Must credit photographer: "Photo by {photographer} from Pexels"
- Link to Pexels: `https://www.pexels.com/photo/{id}/`

**Alternatives Considered**:

- `/v1/curated`: Rejected - doesn't support search queries
- `/v1/photos/{id}`: Rejected - requires specific photo ID, not search

**References**:

- Existing implementation: `lib/hub/pexels-client.ts`
- API docs: https://www.pexels.com/api/documentation/

---

### 1.3 Pixabay API

**Decision**: Use root endpoint with query parameter support

**Rationale**:

- Existing implementation in `lib/hub/pixabay-client.ts` uses root endpoint
- Query-based search with pagination
- Returns structured response with `hits` array
- Provides multiple image sizes (webformatURL, largeImageURL, fullHDURL)

**API Details**:

- **Base URL**: `https://pixabay.com/api/`
- **Search Endpoint**: Root endpoint (all parameters in query string)
- **Authentication**: `key` query parameter
- **Parameters**:
  - `key` (required): API key
  - `q` (required): Search query string
  - `per_page` (optional): Results per page (default: 20, max: 200)
  - `page` (optional): Page number (default: 1)
  - `image_type` (optional): `all`, `photo`, `illustration`, `vector`
  - `orientation` (optional): `all`, `horizontal`, `vertical`
  - `order` (optional): `popular`, `latest`
  - `min_width` (optional): Minimum image width
  - `min_height` (optional): Minimum image height
- **Response Structure**:
  ```typescript
  {
    total: number;
    totalHits: number;
    hits: Array<{
      id: number;
      webformatURL: string;
      largeImageURL: string;
      fullHDURL?: string;
      imageURL: string;
      imageWidth: number;
      imageHeight: number;
      user: string;
      userImageURL: string;
      tags: string; // Comma-separated
      views: number;
      downloads: number;
      likes: number;
    }>;
  }
  ```

**Rate Limits**:

- Free tier: 5,000 requests/hour
- No explicit rate limit headers
- HTTP 429 when rate limited

**Image Sizes**:

- `webformatURL`: 640px width (good for thumbnails)
- `largeImageURL`: 1280px width (good for grid display)
- `fullHDURL`: 1920px width (if available)
- `imageURL`: Original size (for detail view)

**Attribution Requirements**:

- Must credit photographer: "Image by {user} from Pixabay"
- Link to Pixabay: `https://pixabay.com/photos/{id}/`

**Alternatives Considered**:

- None - Pixabay uses single endpoint with query parameters

**References**:

- Existing implementation: `lib/hub/pixabay-client.ts`
- API docs: https://pixabay.com/api/docs/

---

## 2. Data Normalization Strategy

**Decision**: Create unified `ImageResult` interface and normalization functions per provider

**Rationale**:

- Each API returns different structures (`results`, `photos`, `hits`)
- Each API uses different field names (`user.name`, `photographer`, `user`)
- Each API provides different image size options
- Unified interface simplifies frontend consumption
- Enables consistent display and filtering

**Normalized Interface**:

```typescript
interface ImageResult {
  id: string; // Prefixed: "u-{id}", "px-{id}", "pb-{id}"
  source: "unsplash" | "pexels" | "pixabay";
  urlThumb: string; // Thumbnail URL (400px width)
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
```

**Normalization Mapping**:

| Normalized Field | Unsplash                                       | Pexels                            | Pixabay                                  |
| ---------------- | ---------------------------------------------- | --------------------------------- | ---------------------------------------- |
| `id`             | `"u-" + photo.id`                              | `"px-" + photo.id`                | `"pb-" + hit.id`                         |
| `source`         | `"unsplash"`                                   | `"pexels"`                        | `"pixabay"`                              |
| `urlThumb`       | `photo.urls.small`                             | `photo.src.small`                 | `hit.webformatURL`                       |
| `urlRegular`     | `photo.urls.regular`                           | `photo.src.large`                 | `hit.largeImageURL`                      |
| `urlFull`        | `photo.urls.full`                              | `photo.src.original`              | `hit.imageURL`                           |
| `width`          | `photo.width`                                  | `photo.width`                     | `hit.imageWidth`                         |
| `height`         | `photo.height`                                 | `photo.height`                    | `hit.imageHeight`                        |
| `description`    | `photo.description \|\| photo.alt_description` | `photo.alt`                       | `null`                                   |
| `author`         | `photo.user.name`                              | `photo.photographer`              | `hit.user`                               |
| `authorUrl`      | `photo.user.links.html`                        | `photo.photographer_url`          | `null`                                   |
| `sourceUrl`      | `photo.links.html`                             | `photo.url`                       | `"https://pixabay.com/photos/" + hit.id` |
| `tags`           | `photo.tags.map(t => t.title)`                 | `photo.alt ? [photo.alt] : []`    | `hit.tags.split(", ")`                   |
| `attribution`    | `"Photo by {author} on Unsplash"`              | `"Photo by {author} from Pexels"` | `"Image by {author} from Pixabay"`       |

**Implementation Pattern**:

- Create `lib/hub/normalizer.ts` with provider-specific normalization functions
- Each function takes provider-specific response and returns `ImageResult[]`
- Handle missing/null fields gracefully with fallbacks

**Alternatives Considered**:

- Keep provider-specific types: Rejected - adds complexity to frontend
- Use adapter pattern: Considered but normalization functions are simpler
- Transform at API route level: Chosen - keeps normalization logic centralized

**References**:

- Existing types: `lib/hub/types.ts`
- Similar pattern: R2 gallery normalization in `lib/r2/list-objects.ts`

---

## 3. Caching Strategy

**Decision**: Implement client-side caching with React state, no server-side caching initially

**Rationale**:

- API responses are dynamic (search results change)
- Rate limits are per-hour, not per-request
- Client-side caching prevents duplicate requests during same session
- Server-side caching adds complexity (cache invalidation, storage)
- Can add server-side caching later if needed

**Caching Approach**:

- **Client-side**: Cache search results in React state/context
  - Cache key: `{query}-{providers}-{page}`
  - Cache duration: Session (cleared on page refresh)
  - Use `useMemo` for filtered results
- **No server-side caching**:
  - API routes call providers directly
  - No Redis/cache layer needed initially
  - Can add later if rate limits become issue

**Rate Limit Handling**:

- Track rate limit headers in responses
- Show warnings when approaching limits
- Continue showing results from non-rate-limited providers
- Display user-friendly error messages

**Alternatives Considered**:

- Server-side Redis caching: Rejected - adds infrastructure complexity
- Browser localStorage caching: Considered but session cache is sufficient
- No caching: Rejected - would cause duplicate API calls

**Future Enhancement**:

- Add server-side caching with TTL (e.g., 5 minutes) if rate limits become issue
- Use Next.js API route caching with `revalidate` option

---

## 4. Image Size Selection

**Decision**: Use medium-sized images for grid display, full-size for detail modal

**Rationale**:

- Balance between image quality and load performance
- Different providers offer different size options
- Grid display doesn't need full resolution
- Detail modal should show high-quality image

**Size Selection**:

- **Grid/Thumbnails**:
  - Unsplash: `urls.small` (400px) or `urls.regular` (1080px)
  - Pexels: `src.small` (400px) or `src.large` (1280px)
  - Pixabay: `webformatURL` (640px) or `largeImageURL` (1280px)
  - **Decision**: Use `urlRegular` (1080-1280px) for grid - good balance
- **Detail Modal**:
  - All providers: Use `urlFull` (original size)
  - Lazy load full-size only when modal opens

**Lazy Loading**:

- Use `loading="lazy"` attribute on `<img>` tags
- Load thumbnails first, then upgrade to regular size
- Load full-size only when image clicked/opened in modal

**Alternatives Considered**:

- Always use thumbnails: Rejected - poor quality
- Always use full-size: Rejected - slow loading
- Progressive loading: Chosen - best user experience

**References**:

- Similar pattern: R2 gallery uses presigned URLs with lazy loading
- Next.js Image component: Could use but external URLs may not optimize

---

## 5. Error Handling Strategy

**Decision**: Graceful degradation - show partial results when providers fail

**Rationale**:

- Multiple providers means partial failures are acceptable
- Better UX than showing error for entire search
- Users can still find images from working providers
- Clear error messaging helps users understand what happened

**Error Handling Approach**:

- **API Route Level**:
  - Call all selected providers in parallel (`Promise.allSettled`)
  - Collect successful results and errors separately
  - Return combined results with error metadata
- **Client Level**:
  - Display results from successful providers
  - Show warning banner for failed providers
  - Allow retry for failed providers
  - Handle rate limit errors specifically (show "rate limited" message)

**Error Types**:

- **Rate Limit** (HTTP 403/429): Show "Rate limited" message, suggest retry later
- **Network Error**: Show "Connection error" message, allow retry
- **Invalid API Key**: Show "Configuration error" message (admin-facing)
- **Malformed Response**: Log error, skip provider, show warning

**Error Display**:

- Warning banner at top of results: "Pixabay is temporarily unavailable"
- Per-provider error indicators in section headers
- Retry button for failed providers
- Graceful fallback: Show results from available providers

**Alternatives Considered**:

- Fail fast (show error if any provider fails): Rejected - poor UX
- Retry automatically: Considered but manual retry gives user control
- Hide failed providers silently: Rejected - users should know what happened

**References**:

- Similar pattern: R2 gallery handles errors per bucket
- Next.js error handling: Use error boundaries for component-level errors

---

## 6. Search Aggregation Strategy

**Decision**: Parallel API calls with `Promise.allSettled`, merge results, group by provider

**Rationale**:

- Parallel calls are faster than sequential
- `Promise.allSettled` handles partial failures gracefully
- Grouping by provider matches spec requirement (Unsplash → Pixabay → Pexels)
- Maintains provider order for consistent UX

**Aggregation Flow**:

1. User submits search query with selected providers
2. API route calls selected providers in parallel:
   ```typescript
   const [unsplashResults, pexelsResults, pixabayResults] =
     await Promise.allSettled([
       unsplashClient.search(query, page),
       pexelsClient.search(query, page),
       pixabayClient.search(query, page),
     ]);
   ```
3. Normalize each provider's results
4. Merge into single array, grouped by provider
5. Return to client with metadata (errors, pagination info)

**Result Grouping**:

- Maintain provider order: Unsplash → Pixabay → Pexels
- Add section headers: "Unsplash Results", "Pixabay Results", "Pexels Results"
- Show provider badge on each image
- Allow filtering by provider in UI

**Pagination**:

- Each provider paginates independently
- Load next page for all selected providers simultaneously
- Maintain page state per provider
- Infinite scroll loads next page from all providers

**Alternatives Considered**:

- Sequential calls: Rejected - slower
- Interleaved results: Rejected - doesn't match spec (grouped by provider)
- Single unified list: Rejected - spec requires grouping

**References**:

- Similar pattern: R2 gallery aggregates from multiple buckets
- Promise.allSettled: Standard JavaScript pattern for parallel calls with error handling

---

## 7. UI Component Patterns

**Decision**: Reuse patterns from R2 image gallery (`003-r2-image-tabs`)

**Rationale**:

- Consistent UX across features
- Proven component patterns
- Reusable hooks and utilities
- Faster development

**Reusable Components**:

- `use-infinite-scroll.ts`: Already exists, can reuse
- Loading skeletons: Similar pattern from R2 gallery
- Modal/lightbox: Similar pattern from R2 gallery
- Masonry grid: Can reuse `react-masonry-css` pattern

**New Components Needed**:

- Search input with debouncing
- Provider filter checkboxes
- Provider section headers
- Attribution display component
- Error/warning banners

**Component Structure**:

```
images-hub-gallery.tsx (main)
├── images-hub-search.tsx (search input)
├── images-hub-provider-filter.tsx (provider checkboxes)
├── images-hub-grid.tsx (masonry grid)
│   └── images-hub-item.tsx (individual image)
├── images-hub-modal.tsx (detail view)
└── images-hub-loading.tsx (skeletons)
```

**Alternatives Considered**:

- Build from scratch: Rejected - reinventing wheel
- Use different library: Considered but R2 gallery patterns work well
- Copy R2 components: Chosen - adapt for search use case

**References**:

- R2 gallery components: `components/r2-images/`
- Similar patterns: Masonry grid, infinite scroll, modals

---

## 8. State Management

**Decision**: React hooks (`useState`, `useCallback`, `useMemo`) with custom hook for search logic

**Rationale**:

- Simple state management sufficient for this feature
- No need for Redux/Context for search state
- Custom hook encapsulates search logic
- Follows R2 gallery pattern

**State Structure**:

```typescript
interface SearchState {
  query: string;
  selectedProviders: ("unsplash" | "pexels" | "pixabay")[];
  results: ImageResult[];
  loading: boolean;
  errors: Record<string, string>; // provider -> error message
  hasMore: boolean;
  currentPage: number;
}
```

**Custom Hook**:

- `use-image-search.ts`: Manages search state and API calls
- Handles pagination, filtering, error states
- Returns state and actions (search, loadMore, retryProvider)

**Alternatives Considered**:

- Redux: Rejected - overkill for this feature
- Context API: Considered but hooks are simpler
- Zustand: Considered but hooks are sufficient

**References**:

- R2 gallery: `lib/hooks/use-r2-images.ts`
- React hooks patterns: Standard React patterns

---

## Summary of Resolved Clarifications

✅ **API Rate Limits**:

- Unsplash: 50 req/hour (free)
- Pexels: 200 req/hour (free)
- Pixabay: 5,000 req/hour (free)

✅ **API Response Structures**: Documented in sections 1.1-1.3

✅ **Caching Strategy**: Client-side session caching, no server-side initially

✅ **Image Size Preferences**: Medium for grid (1080-1280px), full for detail modal

✅ **Attribution Format**: Provider-specific formats documented in sections 1.1-1.3

✅ **Error Handling**: Graceful degradation with partial results and clear error messages

✅ **Search Aggregation**: Parallel calls with `Promise.allSettled`, grouped by provider

---

**Next Steps**: Proceed to Phase 1 (Design & Contracts) with all clarifications resolved.
