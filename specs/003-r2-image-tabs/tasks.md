# Implementation Tasks: R2 Images Display with Tabbed Buckets

**Feature**: R2 Images Display with Tabbed Buckets  
**Branch**: `003-r2-image-tabs`  
**Date**: 2025-01-27  
**Status**: Planning Complete, Ready for Implementation

## Overview

This document breaks down the implementation into actionable tasks, following the proven `pim-gallery` pattern while extending it for multi-bucket support with tabs and sub-folder navigation.

## Task Groups

### Phase 1: Setup & Configuration

#### Task 1.1: Install Dependencies
- [ ] Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- [ ] Install `react-intersection-observer` for infinite scroll
- [ ] Install `react-masonry-css` for masonry layout (optional, can use CSS columns)
- [ ] Verify all dependencies are compatible with Next.js 16 and React 19

**Estimated Time**: 5 minutes  
**Dependencies**: None  
**Reference**: [research.md](./research.md) - Dependencies section

---

#### Task 1.2: Configure Environment Variables
- [ ] Add R2 environment variables to `.env.local`:
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `NEXT_PUBLIC_R2_PUBLIC_URL` (optional, if public access enabled)
- [ ] Document environment variables in README or setup guide
- [ ] Add `.env.local.example` template file

**Estimated Time**: 10 minutes  
**Dependencies**: Task 1.1  
**Reference**: [quickstart.md](./quickstart.md) - Environment Variables section, pim-gallery pattern

---

### Phase 2: R2 Client Library & Types

#### Task 2.1: Create R2 Type Definitions
- [ ] Create `types/r2.ts` with interfaces:
  - `R2ImageAsset` (extends pim-gallery pattern)
  - `R2Object` (file/folder representation)
  - `R2ListResponse` (API response)
  - `ImageGalleryState` (client state)
  - `ImageGalleryFilter` (filter/search state)
  - `R2BucketConfig` (bucket configuration)
- [ ] Add TypeScript types for display modes: `"grid" | "masonry" | "list"`
- [ ] Add types for folder navigation: `FolderPath`, `BreadcrumbItem`

**Estimated Time**: 30 minutes  
**Dependencies**: None  
**Reference**: [data-model.md](./data-model.md), pim-gallery `types/r2.ts` pattern

---

#### Task 2.2: Create R2 Client Library
- [ ] Create `lib/r2/client.ts`:
  - Implement `isR2Configured()` check function (following pim-gallery pattern)
  - Initialize `S3Client` with R2 endpoint and credentials
  - Export `r2Client` instance
  - Export `R2_BUCKETS` constant array with three bucket names
  - Export `R2BucketName` type
- [ ] Create `lib/r2/list-objects.ts`:
  - Implement `listObjects()` function with bucket, prefix, cursor, limit params
  - Filter images by supported formats (JPEG, PNG, WebP, GIF)
  - Separate folders from files using `CommonPrefixes` and `Delimiter`
  - Handle pagination with `ContinuationToken`
  - Return `R2ListResponse` with `objects`, `folders`, `hasMore`, `nextToken`
- [ ] Create `lib/r2/get-object-url.ts`:
  - Implement `getPresignedUrl()` function
  - Generate presigned URLs with 1-hour expiration
  - Handle errors gracefully

**Estimated Time**: 2 hours  
**Dependencies**: Task 2.1, Task 1.2  
**Reference**: [research.md](./research.md) - R2 Integration section, pim-gallery `lib/r2-client.ts` pattern

---

### Phase 3: API Routes

#### Task 3.1: Create List Objects API Route
- [ ] Create `app/api/r2/list/route.ts`:
  - Implement GET handler with Clerk authentication check
  - Extract query parameters: `bucket`, `prefix`, `token`, `maxKeys`
  - Validate bucket name (must be one of three buckets)
  - Call `listObjects()` from R2 client library
  - Return JSON response with `objects`, `folders`, `hasMore`, `nextToken`
  - Handle errors with proper HTTP status codes (400, 401, 403, 500)
- [ ] Add error handling for missing/invalid bucket
- [ ] Add error handling for R2 connection failures
- [ ] Test API endpoint with curl/Postman

**Estimated Time**: 1.5 hours  
**Dependencies**: Task 2.2, Clerk authentication  
**Reference**: [contracts/api-r2.yaml](./contracts/api-r2.yaml), pim-gallery `app/api/r2/images/route.ts` pattern

---

#### Task 3.2: Create Image URL API Route
- [ ] Create `app/api/r2/image/route.ts`:
  - Implement GET handler with Clerk authentication check
  - Extract query parameters: `bucket`, `key`
  - Validate bucket name and key
  - Call `getPresignedUrl()` from R2 client library
  - Return JSON response with `url` and `expiresAt`
  - Handle errors (404 for not found, 500 for server errors)
- [ ] Test API endpoint with curl/Postman

**Estimated Time**: 1 hour  
**Dependencies**: Task 2.2, Clerk authentication  
**Reference**: [contracts/api-r2.yaml](./contracts/api-r2.yaml)

---

### Phase 4: Custom Hooks

#### Task 4.1: Create Infinite Scroll Hook
- [ ] Create `lib/hooks/use-r2-images.ts`:
  - Implement state management: `images`, `folders`, `loading`, `error`, `hasMore`, `cursor`
  - Implement `loadMore()` function for infinite scroll:
    - Check if already loading or no more items
    - Fetch from `/api/r2/list` with continuation token
    - Append new images to existing array
    - Update `hasMore` and `cursor` state
  - Implement `refreshGallery()` function:
    - Reset state to initial values
    - Fetch first page of images
  - Implement `navigateToFolder()` function:
    - Update folder path
    - Reset images and fetch folder contents
  - Handle errors with user-friendly messages
- [ ] Add support for bucket switching
- [ ] Add support for folder navigation

**Estimated Time**: 2 hours  
**Dependencies**: Task 3.1  
**Reference**: pim-gallery `lib/useImageGallery.ts` pattern, [research.md](./research.md) - Infinite Scroll section

---

#### Task 4.2: Create Display Mode Hook
- [ ] Create `lib/hooks/use-display-mode.ts`:
  - Manage display mode state: `"grid" | "masonry" | "list"`
  - Persist mode to localStorage (optional)
  - Provide `setDisplayMode()` function
- [ ] Integrate with gallery component

**Estimated Time**: 30 minutes  
**Dependencies**: None  
**Reference**: [research.md](./research.md) - Display Modes section

---

### Phase 5: UI Components - Core

#### Task 5.1: Create Tab Navigation Component
- [ ] Create `components/r2-images/r2-image-tabs.tsx`:
  - Display three tabs for three buckets
  - Use bucket names as tab labels (per spec clarification)
  - Highlight active tab with visual distinction
  - Handle tab click to switch buckets
  - Use shadcn/ui Tabs component or custom implementation
  - Add Framer Motion animations for tab switching
- [ ] Test tab switching behavior
- [ ] Ensure first tab is active by default (per spec)

**Estimated Time**: 1.5 hours  
**Dependencies**: Task 4.1  
**Reference**: [spec.md](./spec.md) - FR-001, FR-001a, FR-001b, pim-gallery navigation pattern

---

#### Task 5.2: Create Folder Navigation Component
- [ ] Create `components/r2-images/r2-folder-navigation.tsx`:
  - Display breadcrumb navigation
  - Show current folder path
  - Allow clicking breadcrumb items to navigate up
  - Display folder list when in a folder
  - Handle folder click to navigate into folder
  - Use shadcn/ui Breadcrumb component
  - Add folder icons (lucide-react)
- [ ] Test folder navigation
- [ ] Test breadcrumb navigation

**Estimated Time**: 2 hours  
**Dependencies**: Task 4.1  
**Reference**: [research.md](./research.md) - Sub-folder Navigation section, [data-model.md](./data-model.md) - FolderPath entity

---

#### Task 5.3: Create Image Item Component
- [ ] Create `components/r2-images/r2-image-item.tsx`:
  - Display single image with lazy loading
  - Show image thumbnail/preview
  - Handle image click to open modal/lightbox
  - Display image metadata on hover (filename, size, date)
  - Handle image load errors with placeholder
  - Use native `<img loading="lazy">` attribute
  - Add Intersection Observer for viewport-based loading
- [ ] Test image loading and error states

**Estimated Time**: 1.5 hours  
**Dependencies**: Task 3.2  
**Reference**: [research.md](./research.md) - Image Optimization section, pim-gallery image display pattern

---

### Phase 6: UI Components - Display Modes

#### Task 6.1: Create Grid Display Component
- [ ] Create `components/r2-images/r2-image-grid.tsx`:
  - Use CSS Grid layout
  - Responsive columns: 2 (mobile), 3 (tablet), 4 (desktop)
  - Fixed aspect ratio (square) for grid items
  - Use `object-cover` for image fitting
  - Add hover effects with Framer Motion
  - Integrate with `r2-image-item` component
- [ ] Test responsive behavior
- [ ] Test with various image sizes

**Estimated Time**: 1 hour  
**Dependencies**: Task 5.3  
**Reference**: [research.md](./research.md) - Display Modes section

---

#### Task 6.2: Create Masonry Display Component
- [ ] Create `components/r2-images/r2-image-masonry.tsx`:
  - Option A: Use CSS columns (`columns-2 md:columns-3 lg:columns-4`)
  - Option B: Use `react-masonry-css` library
  - Preserve image aspect ratios
  - Handle varying image heights
  - Add `break-inside-avoid` for column layout
  - Integrate with `r2-image-item` component
- [ ] Test with images of varying sizes
- [ ] Test responsive behavior

**Estimated Time**: 1.5 hours  
**Dependencies**: Task 5.3  
**Reference**: [research.md](./research.md) - Display Modes section

---

#### Task 6.3: Create List Display Component
- [ ] Create `components/r2-images/r2-image-list.tsx`:
  - Use Flexbox layout
  - Horizontal image thumbnails (fixed width/height)
  - Display image metadata (filename, size, date) next to thumbnail
  - Add hover effects
  - Integrate with `r2-image-item` component
- [ ] Test list layout
- [ ] Test with long filenames

**Estimated Time**: 1 hour  
**Dependencies**: Task 5.3  
**Reference**: [research.md](./research.md) - Display Modes section

---

### Phase 7: UI Components - Main Gallery

#### Task 7.1: Create Main Gallery Component
- [ ] Create `components/r2-images/r2-image-gallery.tsx`:
  - Integrate tab navigation (Task 5.1)
  - Integrate folder navigation (Task 5.2)
  - Integrate display mode switching
  - Conditionally render grid/masonry/list based on mode
  - Integrate infinite scroll hook (Task 4.1)
  - Add Intersection Observer trigger for infinite scroll
  - Handle loading states
  - Handle error states
  - Display empty state when no images
- [ ] Test full gallery flow
- [ ] Test tab switching
- [ ] Test folder navigation
- [ ] Test display mode switching

**Estimated Time**: 3 hours  
**Dependencies**: Tasks 5.1, 5.2, 6.1, 6.2, 6.3, 4.1, 4.2  
**Reference**: [quickstart.md](./quickstart.md) - Gallery Component section, pim-gallery `app/r2-gallery/page.tsx` pattern

---

#### Task 7.2: Create Loading States Component
- [ ] Create `components/r2-images/r2-image-loading.tsx`:
  - Skeleton loaders for grid mode
  - Skeleton loaders for masonry mode
  - Skeleton loaders for list mode
  - Use Tailwind `animate-pulse` for loading animation
  - Match layout of actual content
- [ ] Integrate with gallery component

**Estimated Time**: 1 hour  
**Dependencies**: Tasks 6.1, 6.2, 6.3  
**Reference**: Tailwind CSS animations

---

#### Task 7.3: Create Image Modal/Lightbox
- [ ] Create `components/r2-images/r2-image-modal.tsx`:
  - Display full-size image in modal
  - Add close button
  - Add navigation (previous/next) if multiple images
  - Use shadcn/ui Dialog component
  - Add Framer Motion animations for modal open/close
  - Handle keyboard navigation (Escape to close, Arrow keys for navigation)
- [ ] Integrate with image item click handler

**Estimated Time**: 2 hours  
**Dependencies**: Task 5.3  
**Reference**: shadcn/ui Dialog component, Framer Motion

---

### Phase 8: Page Route & Integration

#### Task 8.1: Create R2 Images Page
- [ ] Create `app/r2-images/page.tsx`:
  - Server component wrapper
  - Check authentication (redirect if not authenticated)
  - Render `R2ImageGallery` client component
  - Add page metadata (title, description)
- [ ] Test page access with/without authentication
- [ ] Test page routing

**Estimated Time**: 30 minutes  
**Dependencies**: Task 7.1, Clerk authentication  
**Reference**: [quickstart.md](./quickstart.md) - Main Page section

---

#### Task 8.2: Add Navigation Link
- [ ] Add R2 Images link to main navigation
- [ ] Update navigation component (`components/main-nav.tsx` or similar)
- [ ] Test navigation link

**Estimated Time**: 15 minutes  
**Dependencies**: Task 8.1  
**Reference**: pim-gallery navigation pattern

---

### Phase 9: Filter & Search (Nice to Have)

#### Task 9.1: Create Filter/Search Component
- [ ] Create `components/r2-images/r2-image-filters.tsx`:
  - Search input for filename filtering
  - Filter by file type (JPEG, PNG, WebP, GIF)
  - Sort options (date, name, size)
  - Use shadcn/ui Input, Select components
  - Implement client-side filtering
  - Add debouncing for search input
- [ ] Integrate with gallery component
- [ ] Test filtering functionality

**Estimated Time**: 2 hours  
**Dependencies**: Task 7.1  
**Reference**: [research.md](./research.md) - Filter and Search section

---

### Phase 10: Polish & Optimization

#### Task 10.1: Add Animations
- [ ] Add Framer Motion animations:
  - Tab switching transitions
  - Image loading fade-in
  - Modal open/close animations
  - Folder navigation transitions
- [ ] Use Tailwind animations for loading spinners
- [ ] Test animation performance

**Estimated Time**: 2 hours  
**Dependencies**: All UI components  
**Reference**: Framer Motion documentation, Tailwind CSS animations

---

#### Task 10.2: Optimize Performance
- [ ] Implement image URL caching (check expiration before regenerating)
- [ ] Optimize re-renders with React.memo where appropriate
- [ ] Add error boundaries for graceful error handling
- [ ] Test with large image collections (500+ images)
- [ ] Verify infinite scroll performance

**Estimated Time**: 2 hours  
**Dependencies**: All components  
**Reference**: [spec.md](./spec.md) - Success Criteria (SC-005)

---

#### Task 10.3: Error Handling & Edge Cases
- [ ] Handle empty buckets gracefully
- [ ] Handle empty folders gracefully
- [ ] Handle network errors
- [ ] Handle R2 connection failures
- [ ] Handle invalid bucket names
- [ ] Handle missing images (404)
- [ ] Add retry logic for failed requests
- [ ] Display user-friendly error messages

**Estimated Time**: 2 hours  
**Dependencies**: All components  
**Reference**: [spec.md](./spec.md) - User Story 3, Edge Cases

---

### Phase 11: Testing & Documentation

#### Task 11.1: Manual Testing
- [ ] Test tab switching between all three buckets
- [ ] Test folder navigation (navigate into folders, use breadcrumbs)
- [ ] Test infinite scroll (load more images)
- [ ] Test all three display modes (grid, masonry, list)
- [ ] Test image modal/lightbox
- [ ] Test filter/search (if implemented)
- [ ] Test error scenarios (network failure, empty buckets, etc.)
- [ ] Test authentication (redirect when not logged in)
- [ ] Test responsive design (mobile, tablet, desktop)

**Estimated Time**: 3 hours  
**Dependencies**: All tasks  
**Reference**: [spec.md](./spec.md) - Acceptance Scenarios

---

#### Task 11.2: Update Documentation
- [ ] Update README with R2 Images feature
- [ ] Document environment variables
- [ ] Add screenshots or demo GIF
- [ ] Update API documentation if needed
- [ ] Document any deviations from pim-gallery pattern

**Estimated Time**: 1 hour  
**Dependencies**: Task 11.1  
**Reference**: [quickstart.md](./quickstart.md)

---

## Implementation Order

**Recommended Sequence**:
1. Phase 1: Setup & Configuration (Tasks 1.1, 1.2)
2. Phase 2: R2 Client Library & Types (Tasks 2.1, 2.2)
3. Phase 3: API Routes (Tasks 3.1, 3.2)
4. Phase 4: Custom Hooks (Tasks 4.1, 4.2)
5. Phase 5: UI Components - Core (Tasks 5.1, 5.2, 5.3)
6. Phase 6: UI Components - Display Modes (Tasks 6.1, 6.2, 6.3)
7. Phase 7: UI Components - Main Gallery (Tasks 7.1, 7.2, 7.3)
8. Phase 8: Page Route & Integration (Tasks 8.1, 8.2)
9. Phase 9: Filter & Search (Task 9.1) - Optional/Nice to Have
10. Phase 10: Polish & Optimization (Tasks 10.1, 10.2, 10.3)
11. Phase 11: Testing & Documentation (Tasks 11.1, 11.2)

## Estimated Total Time

- **Core Features** (Phases 1-8): ~20 hours
- **Nice to Have** (Phase 9): ~2 hours
- **Polish** (Phase 10): ~6 hours
- **Testing & Documentation** (Phase 11): ~4 hours
- **Total**: ~32 hours

## Notes

- Follow the `pim-gallery` pattern for proven implementation approaches
- Extend pim-gallery pattern for multi-bucket support and tabs
- Use shadcn/ui components where possible for consistent UI
- Use Framer Motion for smooth animations
- Prioritize performance (infinite scroll, lazy loading)
- Ensure all authenticated users have access (no role restrictions)

## References

- [Specification](./spec.md)
- [Research](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api-r2.yaml)
- [Quickstart Guide](./quickstart.md)
- pim-gallery cursor rules pattern

