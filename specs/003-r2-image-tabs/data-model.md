# Data Model: R2 Images Display

**Feature**: R2 Images Display with Tabbed Buckets  
**Date**: 2025-01-27  
**Phase**: 1 - Design

## Overview

This document defines the data structures and entities used in the R2 Images Display feature. Since this feature primarily displays data from Cloudflare R2 (external storage), most entities represent data fetched from R2 rather than stored locally.

## Entities

### R2Bucket

**Description**: Represents a Cloudflare R2 bucket configuration and metadata.

**Attributes**:

| Attribute         | Type   | Description                                          | Source                   |
| ----------------- | ------ | ---------------------------------------------------- | ------------------------ |
| `name`            | string | Bucket name (e.g., "bestitconsulting-assets")        | Configuration            |
| `displayName`     | string | Human-readable name for UI (defaults to bucket name) | Configuration            |
| `accessKeyId`     | string | R2 API access key ID                                 | Environment (.env.local) |
| `secretAccessKey` | string | R2 API secret access key                             | Environment (.env.local) |
| `accountId`       | string | Cloudflare account ID                                | Environment (.env.local) |
| `endpoint`        | string | R2 endpoint URL                                      | Computed from accountId  |

**Relationships**:

- Contains many `R2Object` instances
- Has one `FolderPath` (current navigation path)

**Validation Rules**:

- `name` must be one of: "bestitconsulting-assets", "juewei-assets", "static-assets"
- `accessKeyId` and `secretAccessKey` must be present in environment variables
- `endpoint` format: `https://{accountId}.r2.cloudflarestorage.com`

**Example**:

```typescript
{
  name: "bestitconsulting-assets",
  displayName: "BestIT Consulting Assets",
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  accountId: process.env.R2_ACCOUNT_ID,
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
}
```

---

### R2Object

**Description**: Represents a file or folder object in an R2 bucket.

**Attributes**:

| Attribute      | Type    | Description                                          | Source                |
| -------------- | ------- | ---------------------------------------------------- | --------------------- |
| `key`          | string  | Full object key/path (e.g., "images/2024/photo.jpg") | R2 API                |
| `name`         | string  | Display name (filename or folder name)               | Computed from key     |
| `size`         | number  | File size in bytes (0 for folders)                   | R2 API                |
| `lastModified` | Date    | Last modification timestamp                          | R2 API                |
| `isFolder`     | boolean | Whether this is a folder (key ends with "/")         | Computed              |
| `url`          | string  | Presigned URL for image access (null for folders)    | Generated server-side |
| `urlExpiresAt` | Date    | Expiration time for presigned URL                    | Generated server-side |
| `mimeType`     | string  | MIME type if available (e.g., "image/jpeg")          | R2 API (optional)     |

**Relationships**:

- Belongs to one `R2Bucket`
- May be inside a `FolderPath`

**Validation Rules**:

- `key` must not be empty
- `isFolder` is true if `key.endsWith("/")`
- `url` is only present for image files (not folders)
- `size` is 0 for folders
- Image files must have supported extension: .jpg, .jpeg, .png, .webp, .gif

**Computed Properties**:

```typescript
// Extract filename from key
name: key.split("/").pop() || key;

// Check if folder
isFolder: key.endsWith("/");

// Extract folder path
folderPath: key.substring(0, key.lastIndexOf("/"));
```

**Example**:

```typescript
// Image file
{
  key: "images/2024/photo.jpg",
  name: "photo.jpg",
  size: 245678,
  lastModified: new Date("2024-01-15T10:30:00Z"),
  isFolder: false,
  url: "https://r2.example.com/presigned-url?expires=...",
  urlExpiresAt: new Date("2024-01-15T11:30:00Z"),
  mimeType: "image/jpeg"
}

// Folder
{
  key: "images/2024/",
  name: "2024",
  size: 0,
  lastModified: new Date("2024-01-15T10:30:00Z"),
  isFolder: true,
  url: null,
  urlExpiresAt: null,
  mimeType: null
}
```

---

### FolderPath

**Description**: Represents the current navigation path within a bucket.

**Attributes**:

| Attribute | Type     | Description                        | Source              |
| --------- | -------- | ---------------------------------- | ------------------- |
| `bucket`  | string   | Bucket name                        | URL query parameter |
| `path`    | string   | Folder path (e.g., "images/2024/") | URL query parameter |
| `parts`   | string[] | Array of folder names in path      | Computed from path  |

**Relationships**:

- Belongs to one `R2Bucket`
- Contains many `R2Object` instances

**Validation Rules**:

- `path` must start and end with "/" if not empty
- `path` is empty string "" for root folder
- `parts` is computed by splitting `path` and filtering empty strings

**Computed Properties**:

```typescript
// Split path into parts
parts: path.split("/").filter(Boolean);

// Breadcrumb items
breadcrumbs: [
  { name: bucket, path: "" },
  ...parts.map((part, index) => ({
    name: part,
    path: parts.slice(0, index + 1).join("/") + "/",
  })),
];

// Parent path
parentPath: parts.length > 0 ? parts.slice(0, -1).join("/") + "/" : "";
```

**Example**:

```typescript
{
  bucket: "bestitconsulting-assets",
  path: "images/2024/",
  parts: ["images", "2024"]
}
```

---

### ImageMetadata

**Description**: Extended metadata for image files (optional, for future enhancements).

**Attributes**:

| Attribute     | Type   | Description                           | Source                  |
| ------------- | ------ | ------------------------------------- | ----------------------- |
| `format`      | string | Image format (JPEG, PNG, WebP, GIF)   | Computed from extension |
| `width`       | number | Image width in pixels (if available)  | Image EXIF/metadata     |
| `height`      | number | Image height in pixels (if available) | Image EXIF/metadata     |
| `aspectRatio` | number | Width/height ratio                    | Computed                |

**Relationships**:

- Extends `R2Object` (for image files only)

**Validation Rules**:

- Only present for image files (`isFolder === false`)
- `format` must be one of: "JPEG", "PNG", "WebP", "GIF"
- `aspectRatio` computed as `width / height` if both available

**Example**:

```typescript
{
  format: "JPEG",
  width: 1920,
  height: 1080,
  aspectRatio: 1.777
}
```

---

### GalleryState

**Description**: Client-side state for the image gallery UI.

**Attributes**:

| Attribute           | Type                          | Description                          | Source              |
| ------------------- | ----------------------------- | ------------------------------------ | ------------------- |
| `activeBucket`      | string                        | Currently selected bucket name       | User selection      |
| `activeTab`         | number                        | Index of active tab (0-2)            | User selection      |
| `displayMode`       | "grid" \| "masonry" \| "list" | Current display mode                 | User selection      |
| `currentFolder`     | FolderPath                    | Current folder navigation path       | URL/User navigation |
| `images`            | R2Object[]                    | Loaded images for current folder     | API fetch           |
| `folders`           | R2Object[]                    | Folders in current path              | API fetch           |
| `isLoading`         | boolean                       | Whether images are loading           | API state           |
| `hasMore`           | boolean                       | Whether more images available        | API pagination      |
| `continuationToken` | string \| undefined           | Token for next page                  | API response        |
| `searchQuery`       | string                        | Current search/filter query          | User input          |
| `selectedImage`     | R2Object \| null              | Currently selected image (for modal) | User selection      |

**Relationships**:

- References one `R2Bucket` (activeBucket)
- Contains many `R2Object` instances (images, folders)

**Validation Rules**:

- `activeTab` must be 0, 1, or 2 (three buckets)
- `displayMode` must be one of the three supported modes
- `images` and `folders` are filtered by `searchQuery` when present

**Example**:

```typescript
{
  activeBucket: "bestitconsulting-assets",
  activeTab: 0,
  displayMode: "grid",
  currentFolder: {
    bucket: "bestitconsulting-assets",
    path: "images/2024/",
    parts: ["images", "2024"]
  },
  images: [/* R2Object[] */],
  folders: [/* R2Object[] */],
  isLoading: false,
  hasMore: true,
  continuationToken: "abc123...",
  searchQuery: "",
  selectedImage: null
}
```

---

## Data Flow

### Initial Page Load

```
1. User navigates to /r2-images
2. System reads bucket configuration from environment
3. Default bucket selected (first alphabetically)
4. API call: GET /api/r2/list?bucket={name}&prefix=
5. Response: { objects: R2Object[], folders: R2Object[], nextToken?: string }
6. Client state updated with images and folders
7. UI renders tabs and gallery
```

### Tab Switch

```
1. User clicks tab
2. activeBucket updated
3. currentFolder reset to root ("")
4. API call: GET /api/r2/list?bucket={newBucket}&prefix=
5. Response processed, images loaded
6. UI updates to show new bucket's images
```

### Folder Navigation

```
1. User clicks folder
2. currentFolder.path updated
3. API call: GET /api/r2/list?bucket={bucket}&prefix={folderPath}
4. Response processed, images loaded
5. Breadcrumb navigation updated
6. UI shows folder contents
```

### Infinite Scroll

```
1. User scrolls near bottom
2. Intersection Observer triggers
3. If hasMore && !isLoading:
   - API call: GET /api/r2/list?bucket={bucket}&prefix={path}&token={continuationToken}
   - Response processed
   - New images appended to existing images array
   - continuationToken updated
   - hasMore updated based on response
```

### Image URL Generation

```
1. API receives request for image
2. R2 client generates presigned URL (1 hour expiry)
3. URL returned to client
4. Client caches URL with expiration time
5. When URL expires, new request made for fresh URL
```

## Constraints

1. **Bucket Configuration**: Only three buckets supported: bestitconsulting-assets, juewei-assets, static-assets
2. **Image Formats**: Only JPEG, PNG, WebP, GIF supported
3. **URL Expiration**: Presigned URLs expire after 1 hour
4. **Pagination**: Uses R2's ContinuationToken for pagination (max 1000 objects per request)
5. **Folder Depth**: No explicit limit, but deep nesting may impact performance
6. **File Size**: No explicit limit, but very large images may impact loading performance

## Notes

- No local database storage required - all data fetched from R2
- State management handled client-side (React state/hooks)
- Presigned URLs cached client-side to reduce API calls
- Folder structure inferred from object keys (R2 doesn't have true folders)
- Image metadata (dimensions) may be fetched on-demand if needed for layout optimization
