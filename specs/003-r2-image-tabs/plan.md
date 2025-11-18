# Implementation Plan: R2 Images Display with Tabbed Buckets

**Branch**: `003-r2-image-tabs` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-r2-image-tabs/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a tabbed image gallery interface that displays images from three Cloudflare R2 buckets (bestitconsulting-assets, juewei-assets, static-assets). The feature includes:
- Three tabs for three R2 buckets with sub-folder navigation
- Infinite scroll with lazy loading for performance
- Three display modes: grid, masonry, list
- Filter/search capabilities (nice to have)
- Authentication-protected access for all authenticated users

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: Next.js 16.0.3, React 19.2.0, @aws-sdk/client-s3 (for R2 compatibility), framer-motion 12.23.24, tailwindcss-animate 1.0.7  
**Storage**: Cloudflare R2 (S3-compatible API) - no local database storage required  
**Testing**: Jest + React Testing Library (to be added)  
**Target Platform**: Web (Next.js App Router), modern browsers  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: 
- Tab switching < 100ms (SC-008)
- Image load within 3 seconds for 100 images (SC-002)
- Support 500+ images without performance degradation (SC-005)
- 95% success rate for image loads (SC-003)

**Constraints**: 
- Must use R2 API keys from `.env.local`
- Authentication required (Clerk integration)
- Infinite scroll instead of pagination
- Lazy loading for images
- Support sub-folder navigation

**Scale/Scope**: 
- 3 R2 buckets (fixed)
- Unlimited images per bucket
- All authenticated users have access

## Constitution Check

_No constitution file found - skipping gate checks. Proceeding with implementation planning._

## Project Structure

### Documentation (this feature)

```text
specs/003-r2-image-tabs/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── r2-images/
│   └── page.tsx                    # Main R2 images display page (server component wrapper)
├── api/
│   └── r2/
│       ├── list/route.ts          # API: List objects in bucket/folder
│       └── image/route.ts         # API: Get image URL/metadata
components/
├── r2-images/
│   ├── r2-image-gallery.tsx       # Main gallery component (client)
│   ├── r2-image-tabs.tsx          # Tab navigation component
│   ├── r2-image-grid.tsx          # Grid display mode
│   ├── r2-image-masonry.tsx       # Masonry display mode
│   ├── r2-image-list.tsx          # List display mode
│   ├── r2-folder-navigation.tsx   # Folder breadcrumb/navigation
│   ├── r2-image-item.tsx          # Individual image item component
│   ├── r2-image-modal.tsx         # Image modal/lightbox
│   ├── r2-image-filters.tsx       # Filter/search UI (nice to have)
│   └── r2-image-loading.tsx        # Loading states
lib/
├── r2/
│   ├── client.ts                  # R2 S3 client initialization
│   ├── list-objects.ts           # List objects in bucket/folder
│   ├── get-object-url.ts         # Generate presigned URLs
│   └── types.ts                   # R2-related TypeScript types
└── utils/
    └── image-utils.ts             # Image format validation, sorting utilities
```

**Structure Decision**: Using Next.js App Router structure with:
- Server components for data fetching (API routes)
- Client components for interactive UI (gallery, tabs, filters)
- Separation of concerns: R2 client logic in `/lib/r2`, UI components in `/components/r2-images`
- API routes for secure server-side R2 access (credentials not exposed to client)

## Complexity Tracking

> **No violations detected - standard Next.js App Router structure**

## Phase 0: Research & Technical Decisions

See [research.md](./research.md) for detailed research findings.

### Key Research Areas

1. **Cloudflare R2 Integration**
   - S3-compatible API usage with @aws-sdk/client-s3
   - Authentication via API keys (access key ID + secret access key)
   - Listing objects with prefix filtering for folders
   - Generating presigned URLs for image access

2. **Infinite Scroll Implementation**
   - React Intersection Observer API for lazy loading
   - Pagination strategy using R2 listObjectsV2 with ContinuationToken
   - Performance optimization for large image collections

3. **Display Modes**
   - Grid layout with CSS Grid
   - Masonry layout using CSS columns or library (react-masonry-css)
   - List layout with flexbox

4. **Sub-folder Navigation**
   - Detecting folders vs files in R2 (objects ending with `/`)
   - Breadcrumb navigation
   - State management for current folder path

5. **Image Optimization**
   - Lazy loading with native `<img loading="lazy">`
   - Intersection Observer for viewport-based loading
   - Placeholder/loading states

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for detailed entity definitions.

**Key Entities**:
- `R2Bucket`: Configuration for each bucket (name, credentials)
- `R2Object`: Represents a file/folder in R2 (key, size, lastModified, isFolder)
- `ImageMetadata`: Extended metadata for image files (format, dimensions if available)
- `FolderPath`: Current navigation path within a bucket

### API Contracts

See [contracts/api-r2.yaml](./contracts/api-r2.yaml) for OpenAPI specification.

**Endpoints**:
- `GET /api/r2/list?bucket={name}&prefix={path}` - List objects in bucket/folder
- `GET /api/r2/image?bucket={name}&key={path}` - Get image presigned URL

### Quickstart Guide

See [quickstart.md](./quickstart.md) for setup and development instructions.
