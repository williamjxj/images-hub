# Research: R2 Images Display Implementation

**Feature**: R2 Images Display with Tabbed Buckets  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Overview

This document consolidates research findings for implementing a tabbed image gallery interface that displays images from three Cloudflare R2 buckets with sub-folder navigation, infinite scroll, and multiple display modes.

## Research Topics

### 1. Cloudflare R2 Integration with Next.js

**Decision**: Use `@aws-sdk/client-s3` SDK with S3-compatible API endpoints for R2.

**Rationale**:
- Cloudflare R2 provides S3-compatible API, allowing use of AWS SDK
- `@aws-sdk/client-s3` is the official, well-maintained SDK
- Supports all required operations: listObjectsV2, getObject, generatePresignedUrl
- TypeScript support included
- Works seamlessly with Next.js server-side API routes

**Configuration**:
```typescript
import { S3Client } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

**Environment Variables**:
- `R2_ACCESS_KEY_ID`: R2 API access key ID
- `R2_SECRET_ACCESS_KEY`: R2 API secret access key
- `R2_ACCOUNT_ID`: Cloudflare account ID (for endpoint)
- `R2_PUBLIC_URL`: Optional public URL if buckets have public access

**Alternatives Considered**:
- Direct REST API calls: Rejected - SDK provides better error handling and type safety
- `@cloudflare/r2`: Rejected - Not officially maintained, S3 SDK is recommended by Cloudflare
- Custom HTTP client: Rejected - More error-prone, less maintainable

**References**:
- [Cloudflare R2 S3 Compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)

---

### 2. Listing Objects and Folder Detection

**Decision**: Use `listObjectsV2` with `Prefix` parameter for folder navigation, detect folders by checking if object key ends with `/`.

**Rationale**:
- R2/S3 doesn't have true folders - folders are simulated by object keys with `/` separators
- `listObjectsV2` with `Prefix` efficiently filters objects in a "folder"
- Objects ending with `/` are folder markers (empty objects representing folders)
- Use `Delimiter: '/'` to get folder structure without listing all nested objects

**Implementation Pattern**:
```typescript
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

// List objects in a folder
const command = new ListObjectsV2Command({
  Bucket: bucketName,
  Prefix: folderPath, // e.g., "images/2024/"
  Delimiter: "/", // Group by folder
});

const response = await r2Client.send(command);

// Folders are in CommonPrefixes
const folders = response.CommonPrefixes?.map(p => p.Prefix) || [];

// Files are in Contents (excluding folder markers)
const files = response.Contents?.filter(
  obj => !obj.Key?.endsWith("/")
) || [];
```

**Alternatives Considered**:
- Listing all objects and filtering client-side: Rejected - inefficient for large buckets
- Using `listObjects` (v1): Rejected - v2 is more efficient and supports pagination better

**References**:
- [AWS S3 ListObjectsV2 Documentation](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html)

---

### 3. Infinite Scroll with Lazy Loading

**Decision**: Use React Intersection Observer API with `useInfiniteQuery` pattern (or custom hook) for pagination, native `<img loading="lazy">` for image lazy loading.

**Rationale**:
- Intersection Observer is modern, performant, and widely supported
- Native lazy loading reduces JavaScript overhead
- Server-side pagination using R2's `ContinuationToken` for efficient data fetching
- Prevents loading all images at once, improving initial page load

**Implementation Pattern**:
```typescript
// Custom hook for infinite scroll
const useInfiniteR2Images = (bucket: string, prefix: string) => {
  const [images, setImages] = useState<R2Object[]>([]);
  const [continuationToken, setContinuationToken] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    const response = await fetch(
      `/api/r2/list?bucket=${bucket}&prefix=${prefix}&token=${continuationToken || ""}`
    );
    const data = await response.json();
    
    setImages(prev => [...prev, ...data.objects]);
    setContinuationToken(data.nextToken);
    setHasMore(data.hasMore);
    setIsLoading(false);
  };

  return { images, loadMore, isLoading, hasMore };
};

// Intersection Observer trigger
const { ref, inView } = useInView({
  threshold: 0,
  triggerOnce: false,
});

useEffect(() => {
  if (inView && hasMore) {
    loadMore();
  }
}, [inView, hasMore]);
```

**Image Lazy Loading**:
```tsx
<img
  src={imageUrl}
  loading="lazy"
  alt={imageName}
  className="w-full h-auto"
/>
```

**Alternatives Considered**:
- `react-infinite-scroll-component`: Rejected - adds unnecessary dependency, native Intersection Observer is sufficient
- `react-window` or `react-virtualized`: Rejected - overkill for this use case, adds complexity
- Manual pagination buttons: Rejected - user requirement specifies infinite scroll

**References**:
- [MDN Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React Hook: useInView](https://github.com/thebuilder/react-intersection-observer)
- [Native Image Lazy Loading](https://web.dev/browser-level-image-lazy-loading/)

---

### 4. Display Modes: Grid, Masonry, List

**Decision**: 
- **Grid**: CSS Grid with fixed aspect ratios
- **Masonry**: CSS columns or `react-masonry-css` library
- **List**: Flexbox with horizontal image thumbnails

**Rationale**:
- CSS Grid provides excellent control for uniform grid layouts
- Masonry layout handles varying image heights elegantly
- List view is efficient for browsing many images quickly
- All can be implemented with Tailwind CSS utilities

**Grid Implementation**:
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {images.map(image => (
    <div className="aspect-square overflow-hidden rounded-lg">
      <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
    </div>
  ))}
</div>
```

**Masonry Implementation**:
```tsx
// Using CSS columns
<div className="columns-2 md:columns-3 lg:columns-4 gap-4">
  {images.map(image => (
    <div className="break-inside-avoid mb-4">
      <img src={image.url} alt={image.name} className="w-full h-auto rounded-lg" />
    </div>
  ))}
</div>

// Or using react-masonry-css for better control
import Masonry from "react-masonry-css";
<Masonry
  breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
  className="masonry-grid"
  columnClassName="masonry-grid_column"
>
  {images.map(image => <ImageItem key={image.key} image={image} />)}
</Masonry>
```

**List Implementation**:
```tsx
<div className="flex flex-col gap-2">
  {images.map(image => (
    <div className="flex items-center gap-4 p-2 hover:bg-gray-100 rounded">
      <img src={image.url} alt={image.name} className="w-24 h-24 object-cover rounded" />
      <div className="flex-1">
        <p className="font-medium">{image.name}</p>
        <p className="text-sm text-gray-500">{formatFileSize(image.size)}</p>
      </div>
    </div>
  ))}
</div>
```

**Alternatives Considered**:
- Third-party gallery libraries (react-image-gallery, react-photo-gallery): Rejected - too opinionated, we need custom control
- Pure CSS for all modes: Accepted - Tailwind CSS provides sufficient utilities

**References**:
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [CSS Multi-column Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Columns)
- [react-masonry-css](https://www.npmjs.com/package/react-masonry-css)

---

### 5. Image URL Generation (Presigned URLs)

**Decision**: Generate presigned URLs server-side for secure, time-limited access to R2 objects.

**Rationale**:
- Presigned URLs provide secure access without exposing R2 credentials
- Time-limited URLs (e.g., 1 hour) reduce security risk
- Server-side generation keeps credentials secure
- URLs can be cached client-side for performance

**Implementation Pattern**:
```typescript
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const command = new GetObjectCommand({
  Bucket: bucketName,
  Key: objectKey,
});

const presignedUrl = await getSignedUrl(r2Client, command, {
  expiresIn: 3600, // 1 hour
});
```

**Caching Strategy**:
- Generate presigned URLs in API route
- Cache URLs in React state (component-level)
- Regenerate when URL expires (check expiration time)

**Alternatives Considered**:
- Public bucket URLs: Rejected - security risk, all images would be publicly accessible
- Proxy through Next.js API route: Rejected - adds server load, presigned URLs are more efficient
- Long-lived presigned URLs (24+ hours): Rejected - security best practice is shorter expiration

**References**:
- [AWS SDK Presigned URLs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_s3_request_presigner.html)
- [Cloudflare R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)

---

### 6. Sub-folder Navigation and Breadcrumbs

**Decision**: Use URL query parameters for folder path, implement breadcrumb navigation with shadcn/ui components.

**Rationale**:
- URL-based navigation enables bookmarking and sharing
- Query parameters (`?folder=images/2024/`) are clean and readable
- Breadcrumbs improve UX for deep folder structures
- Can use Next.js `useSearchParams` for state management

**Implementation Pattern**:
```tsx
// URL: /r2-images?bucket=bestitconsulting-assets&folder=images/2024/
const searchParams = useSearchParams();
const bucket = searchParams.get("bucket") || "bestitconsulting-assets";
const folder = searchParams.get("folder") || "";

// Breadcrumb navigation
const pathParts = folder.split("/").filter(Boolean);
const breadcrumbs = [
  { name: bucket, path: "" },
  ...pathParts.map((part, index) => ({
    name: part,
    path: pathParts.slice(0, index + 1).join("/"),
  })),
];

// Navigate to folder
const navigateToFolder = (folderPath: string) => {
  router.push(`/r2-images?bucket=${bucket}&folder=${folderPath}`);
};
```

**Folder Detection**:
- Objects with key ending in `/` are folders
- `CommonPrefixes` from `listObjectsV2` with `Delimiter` provides folder list
- Clicking folder navigates to that path

**Alternatives Considered**:
- React state only (no URL): Rejected - breaks bookmarking and browser back/forward
- Nested routes (`/r2-images/folder1/folder2`): Rejected - more complex, query params are simpler

**References**:
- [Next.js useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [shadcn/ui Breadcrumb Component](https://ui.shadcn.com/docs/components/breadcrumb)

---

### 7. Image Format Filtering and Validation

**Decision**: Filter image files client-side and server-side by file extension (.jpg, .jpeg, .png, .webp, .gif), validate MIME types when available.

**Rationale**:
- File extension filtering is fast and sufficient for initial filtering
- MIME type validation provides additional safety
- Server-side filtering reduces unnecessary data transfer
- Client-side filtering provides immediate feedback

**Implementation Pattern**:
```typescript
const SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

const isImageFile = (key: string): boolean => {
  const ext = key.toLowerCase().substring(key.lastIndexOf("."));
  return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
};

// Filter in API route
const objects = response.Contents?.filter(obj => 
  obj.Key && isImageFile(obj.Key)
) || [];
```

**Alternatives Considered**:
- Reading file headers to detect format: Rejected - too slow, extension check is sufficient
- Allowing all file types: Rejected - spec requires filtering to image formats only

**References**:
- [MDN Image File Types](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types)

---

### 8. Animation and UI Polish

**Decision**: Use Framer Motion for complex animations, Tailwind CSS animations (animate-spin, animate-pulse) for simple loading states, shadcn/ui components for consistent UI.

**Rationale**:
- Framer Motion provides smooth, performant animations
- Tailwind animations are lightweight for simple cases
- shadcn/ui components ensure consistent design system
- Magic UI components can enhance visual appeal

**Animation Patterns**:
```tsx
// Tab switching animation
import { motion, AnimatePresence } from "framer-motion";

<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
    {/* Tab content */}
  </motion.div>
</AnimatePresence>

// Loading spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />

// Pulse loading skeleton
<div className="animate-pulse bg-gray-200 rounded h-64" />
```

**Alternatives Considered**:
- CSS animations only: Rejected - Framer Motion provides better control and performance
- No animations: Rejected - animations improve UX and perceived performance

**References**:
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

### 9. Filter and Search (Nice to Have)

**Decision**: Implement client-side filtering by filename, with optional server-side search if needed for large collections.

**Rationale**:
- Client-side filtering is fast for reasonable collection sizes (<1000 images)
- Server-side search can be added later if performance becomes an issue
- Simple text input with debouncing provides good UX
- Can filter by filename, size, date

**Implementation Pattern**:
```tsx
const [searchQuery, setSearchQuery] = useState("");
const [filteredImages, setFilteredImages] = useState(images);

useEffect(() => {
  const filtered = images.filter(image =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  setFilteredImages(filtered);
}, [images, searchQuery]);

// Debounced search input
<Input
  placeholder="Search images..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**Advanced Filters** (Future Enhancement):
- Filter by file size range
- Filter by date range
- Filter by image format
- Sort options (name, date, size)

**Alternatives Considered**:
- Server-side search only: Rejected - adds latency, client-side is sufficient for MVP
- No search/filter: Accepted for MVP - marked as "nice to have" in requirements

**References**:
- [React Debouncing](https://dmitripavlutin.com/react-throttle-debounce/)

---

## Summary of Technical Decisions

| Decision Area | Chosen Solution | Key Rationale |
|--------------|----------------|---------------|
| R2 SDK | `@aws-sdk/client-s3` | Official, well-maintained, S3-compatible |
| Folder Detection | `listObjectsV2` with `Delimiter` | Efficient, native R2/S3 pattern |
| Infinite Scroll | Intersection Observer + native lazy loading | Modern, performant, no extra deps |
| Grid Layout | CSS Grid | Native, flexible, Tailwind support |
| Masonry Layout | CSS columns or react-masonry-css | Handles varying heights elegantly |
| List Layout | Flexbox | Simple, efficient for browsing |
| Image URLs | Presigned URLs (1hr expiry) | Secure, time-limited access |
| Folder Navigation | URL query parameters | Bookmarkable, browser-friendly |
| Image Filtering | Extension-based (client + server) | Fast, sufficient for requirements |
| Animations | Framer Motion + Tailwind | Smooth UX, performance |
| Search/Filter | Client-side (MVP) | Fast, simple, can enhance later |

## Dependencies to Add

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.700.0",
    "@aws-sdk/s3-request-presigner": "^3.700.0",
    "react-intersection-observer": "^9.5.0",
    "react-masonry-css": "^1.0.16"
  }
}
```

## Next Steps

1. Install required dependencies
2. Set up R2 client configuration
3. Create API routes for listing objects and generating presigned URLs
4. Build UI components (tabs, gallery, display modes)
5. Implement infinite scroll and lazy loading
6. Add folder navigation and breadcrumbs
7. Polish with animations and loading states
8. Add filter/search (nice to have)

