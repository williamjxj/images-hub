# Implementation Tasks: R2 Images Display with Tabbed Buckets

**Feature**: R2 Images Display with Tabbed Buckets  
**Branch**: `003-r2-image-tabs`  
**Date**: 2025-01-27  
**Status**: Ready for Implementation

## Overview

This document provides actionable, dependency-ordered tasks for implementing the R2 Images Display feature. Tasks are organized by user story priority to enable independent implementation and testing.

## User Stories Summary

- **User Story 1 (P1)**: View Images from Multiple R2 Buckets - Core functionality
- **User Story 2 (P2)**: Navigate and Browse Images - Enhanced browsing
- **User Story 3 (P2)**: Handle Errors and Edge Cases - Error handling

## Dependency Graph

```
Phase 1: Setup
  └─> Phase 2: Foundational (R2 Client, Types, API Routes)
       └─> Phase 3: User Story 1 (Core Gallery with Tabs)
            ├─> Phase 4: User Story 2 (Navigation & Browsing)
            └─> Phase 5: User Story 3 (Error Handling)
                 └─> Phase 6: Polish & Cross-Cutting
```

## Implementation Strategy

**MVP Scope**: User Story 1 only (Phase 3) - Core tabbed gallery functionality  
**Incremental Delivery**: Each user story phase is independently testable and deployable  
**Parallel Opportunities**: Tasks marked with [P] can be worked on in parallel

---

## Phase 1: Setup

**Goal**: Initialize project dependencies and configuration

### Setup Tasks

- [x] T001 Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner packages via pnpm
- [x] T002 Install react-intersection-observer package via pnpm
- [x] T003 Install react-masonry-css package via pnpm (optional, can use CSS columns)
- [x] T004 Add R2_ACCOUNT_ID to .env.local with Cloudflare account ID
- [x] T005 Add R2_ACCESS_KEY_ID to .env.local with R2 API access key
- [x] T006 Add R2_SECRET_ACCESS_KEY to .env.local with R2 API secret key
- [ ] T007 Add NEXT_PUBLIC_R2_PUBLIC_URL to .env.local if public access enabled (optional)
- [x] T008 Create .env.local.example template with R2 environment variable placeholders

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Create R2 client library, types, and API routes that all user stories depend on

### Type Definitions

- [x] T009 [P] Create types/r2.ts with R2ImageAsset interface (key, size, lastModified, url, etc.)
- [x] T010 [P] Create types/r2.ts with R2Object interface (extends R2ImageAsset with isFolder, urlExpiresAt)
- [x] T011 [P] Create types/r2.ts with R2ListResponse interface (objects, folders, hasMore, nextToken)
- [x] T012 [P] Create types/r2.ts with ImageGalleryState interface (images, loading, error, hasMore, cursor)
- [x] T013 [P] Create types/r2.ts with R2BucketName type union ("bestitconsulting-assets" | "juewei-assets" | "static-assets")
- [x] T014 [P] Create types/r2.ts with DisplayMode type union ("grid" | "masonry" | "list")
- [x] T015 [P] Create types/r2.ts with FolderPath interface (bucket, path, parts)

### R2 Client Library

- [x] T016 Create lib/r2/client.ts with isR2Configured() function checking environment variables
- [x] T017 Create lib/r2/client.ts with S3Client initialization using R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
- [x] T018 Create lib/r2/client.ts with R2_BUCKETS constant array ["bestitconsulting-assets", "juewei-assets", "static-assets"]
- [x] T019 Create lib/r2/client.ts with R2BucketName type export
- [x] T020 Create lib/r2/list-objects.ts with listObjects() function accepting bucket, prefix, cursor, limit parameters
- [x] T021 Create lib/r2/list-objects.ts with image format filtering (JPEG, PNG, WebP, GIF only)
- [x] T022 Create lib/r2/list-objects.ts with folder detection using CommonPrefixes and Delimiter
- [x] T023 Create lib/r2/list-objects.ts with pagination support using ContinuationToken
- [x] T024 Create lib/r2/list-objects.ts returning R2ListResponse with objects, folders, hasMore, nextToken
- [x] T025 Create lib/r2/get-object-url.ts with getPresignedUrl() function accepting bucket and key
- [x] T026 Create lib/r2/get-object-url.ts with 1-hour expiration for presigned URLs

### API Routes

- [x] T027 Create app/api/r2/list/route.ts with GET handler
- [x] T028 Create app/api/r2/list/route.ts with Clerk authentication check using auth() from @clerk/nextjs/server
- [x] T029 Create app/api/r2/list/route.ts extracting bucket query parameter and validating against R2_BUCKETS
- [x] T030 Create app/api/r2/list/route.ts extracting prefix query parameter (defaults to empty string)
- [x] T031 Create app/api/r2/list/route.ts extracting token query parameter for pagination
- [x] T032 Create app/api/r2/list/route.ts calling listObjects() from lib/r2/list-objects.ts
- [x] T033 Create app/api/r2/list/route.ts returning JSON response with objects, folders, hasMore, nextToken
- [x] T034 Create app/api/r2/list/route.ts with error handling returning 400 for invalid bucket
- [x] T035 Create app/api/r2/list/route.ts with error handling returning 401 for unauthenticated requests
- [x] T036 Create app/api/r2/list/route.ts with error handling returning 500 for R2 connection failures
- [x] T037 Create app/api/r2/image/route.ts with GET handler
- [x] T038 Create app/api/r2/image/route.ts with Clerk authentication check
- [x] T039 Create app/api/r2/image/route.ts extracting bucket and key query parameters
- [x] T040 Create app/api/r2/image/route.ts validating bucket name against R2_BUCKETS
- [x] T041 Create app/api/r2/image/route.ts calling getPresignedUrl() from lib/r2/get-object-url.ts
- [x] T042 Create app/api/r2/image/route.ts returning JSON response with url and expiresAt
- [x] T043 Create app/api/r2/image/route.ts with error handling returning 404 for not found
- [x] T044 Create app/api/r2/image/route.ts with error handling returning 500 for server errors

### Utility Functions

- [x] T045 [P] Create lib/utils/image-utils.ts with isImageFile() function checking file extensions (.jpg, .jpeg, .png, .webp, .gif)
- [x] T046 [P] Create lib/utils/image-utils.ts with sortImagesByDate() function sorting by lastModified descending (newest first)

---

## Phase 3: User Story 1 - View Images from Multiple R2 Buckets (P1)

**Goal**: Users can browse and view images stored in three different R2 buckets through a tabbed interface

**Independent Test**: Navigate to /r2-images, verify three tabs appear with bucket names, click tabs to switch buckets, verify images display from each bucket

**Acceptance Criteria**:

- Three tabs labeled with R2 bucket names
- First tab active by default
- Images display from active bucket
- Tab switching shows different bucket images
- Empty buckets show appropriate message
- Authentication required (redirect if not authenticated)

### Custom Hooks

- [x] T047 [US1] Create lib/hooks/use-r2-images.ts with useState for images array
- [x] T048 [US1] Create lib/hooks/use-r2-images.ts with useState for folders array
- [x] T049 [US1] Create lib/hooks/use-r2-images.ts with useState for loading boolean
- [x] T050 [US1] Create lib/hooks/use-r2-images.ts with useState for error string | null
- [x] T051 [US1] Create lib/hooks/use-r2-images.ts with useState for hasMore boolean
- [x] T052 [US1] Create lib/hooks/use-r2-images.ts with useState for cursor string | undefined
- [x] T053 [US1] Create lib/hooks/use-r2-images.ts with useState for activeBucket R2BucketName
- [x] T054 [US1] Create lib/hooks/use-r2-images.ts with useState for currentFolder string (defaults to empty string)
- [x] T055 [US1] Create lib/hooks/use-r2-images.ts with loadMore() function fetching from /api/r2/list with continuation token
- [x] T056 [US1] Create lib/hooks/use-r2-images.ts with refreshGallery() function resetting state and fetching first page
- [x] T057 [US1] Create lib/hooks/use-r2-images.ts with switchBucket() function updating activeBucket and resetting folder path
- [x] T058 [US1] Create lib/hooks/use-r2-images.ts with useEffect calling refreshGallery() when activeBucket or currentFolder changes

### Tab Navigation Component

- [x] T059 [US1] Create components/r2-images/r2-image-tabs.tsx as client component with "use client" directive
- [x] T060 [US1] Create components/r2-images/r2-image-tabs.tsx accepting buckets array and activeBucket prop
- [x] T061 [US1] Create components/r2-images/r2-image-tabs.tsx accepting onTabChange callback prop
- [x] T062 [US1] Create components/r2-images/r2-image-tabs.tsx rendering three tabs with bucket names as labels
- [x] T063 [US1] Create components/r2-images/r2-image-tabs.tsx highlighting active tab with visual distinction (border, background color)
- [x] T064 [US1] Create components/r2-images/r2-image-tabs.tsx handling tab click to call onTabChange with bucket name
- [x] T065 [US1] Create components/r2-images/r2-image-tabs.tsx using shadcn/ui Tabs component or custom implementation
- [x] T066 [US1] Create components/r2-images/r2-image-tabs.tsx adding Framer Motion animation for tab switching

### Image Display Components

- [x] T067 [US1] Create components/r2-images/r2-image-item.tsx as client component
- [x] T068 [US1] Create components/r2-images/r2-image-item.tsx accepting R2Object prop
- [x] T069 [US1] Create components/r2-images/r2-image-item.tsx rendering img tag with src from object.url
- [x] T070 [US1] Create components/r2-images/r2-image-item.tsx adding loading="lazy" attribute to img tag
- [x] T071 [US1] Create components/r2-images/r2-image-item.tsx handling image load errors with placeholder
- [x] T072 [US1] Create components/r2-images/r2-image-item.tsx displaying image metadata on hover (filename, size, date)
- [x] T073 [US1] Create components/r2-images/r2-image-grid.tsx as client component
- [x] T074 [US1] Create components/r2-images/r2-image-grid.tsx accepting images array prop
- [x] T075 [US1] Create components/r2-images/r2-image-grid.tsx using CSS Grid with responsive columns (2 mobile, 3 tablet, 4 desktop)
- [x] T076 [US1] Create components/r2-images/r2-image-grid.tsx rendering r2-image-item for each image
- [x] T077 [US1] Create components/r2-images/r2-image-grid.tsx using fixed aspect ratio (square) for grid items
- [x] T078 [US1] Create components/r2-images/r2-image-grid.tsx using object-cover for image fitting

### Main Gallery Component

- [x] T079 [US1] Create components/r2-images/r2-image-gallery.tsx as client component
- [x] T080 [US1] Create components/r2-images/r2-image-gallery.tsx importing use-r2-images hook
- [x] T081 [US1] Create components/r2-images/r2-image-gallery.tsx importing r2-image-tabs component
- [x] T082 [US1] Create components/r2-images/r2-image-gallery.tsx importing r2-image-grid component
- [x] T083 [US1] Create components/r2-images/r2-image-gallery.tsx initializing hook with default bucket (first in R2_BUCKETS)
- [x] T084 [US1] Create components/r2-images/r2-image-gallery.tsx rendering r2-image-tabs with buckets and activeBucket
- [x] T085 [US1] Create components/r2-images/r2-image-gallery.tsx handling tab change to call switchBucket()
- [x] T086 [US1] Create components/r2-images/r2-image-gallery.tsx rendering r2-image-grid with images from hook
- [x] T087 [US1] Create components/r2-images/r2-image-gallery.tsx displaying loading state when loading is true
- [x] T088 [US1] Create components/r2-images/r2-image-gallery.tsx displaying empty state message when images.length === 0 and !loading
- [x] T089 [US1] Create components/r2-images/r2-image-gallery.tsx displaying error message when error is not null

### Page Route

- [x] T090 [US1] Create app/r2-images/page.tsx as server component
- [x] T091 [US1] Create app/r2-images/page.tsx checking authentication using auth() from @clerk/nextjs/server
- [x] T092 [US1] Create app/r2-images/page.tsx redirecting to /sign-in if not authenticated using redirect() from next/navigation
- [x] T093 [US1] Create app/r2-images/page.tsx rendering R2ImageGallery client component
- [x] T094 [US1] Create app/r2-images/page.tsx adding page metadata (title: "R2 Images", description)

### Navigation Integration

- [x] T095 [US1] Add /r2-images route to main navigation component (components/main-nav.tsx or similar)

---

## Phase 4: User Story 2 - Navigate and Browse Images (P2)

**Goal**: Users can browse through images within each bucket, viewing image details and navigating between images efficiently

**Independent Test**: Scroll through images, verify infinite scroll loads more, hover over images to see details, click images to open modal

**Acceptance Criteria**:

- Infinite scroll loads additional images
- Image details visible on hover
- Click image opens larger view/modal
- Loading indicators shown during fetch

### Infinite Scroll

- [ ] T096 [US2] Create lib/hooks/use-infinite-scroll.ts with useRef for intersection observer target element
- [ ] T097 [US2] Create lib/hooks/use-infinite-scroll.ts with useInView hook from react-intersection-observer
- [ ] T098 [US2] Create lib/hooks/use-infinite-scroll.ts with useEffect calling loadMore() when inView and hasMore
- [ ] T099 [US2] Update components/r2-images/r2-image-gallery.tsx adding intersection observer trigger element at bottom
- [ ] T100 [US2] Update components/r2-images/r2-image-gallery.tsx connecting infinite scroll hook to loadMore() function

### Image Details Display

- [x] T101 [US2] Update components/r2-images/r2-image-item.tsx adding hover tooltip showing filename
- [x] T102 [US2] Update components/r2-images/r2-image-item.tsx adding hover tooltip showing file size (formatted)
- [x] T103 [US2] Update components/r2-images/r2-image-item.tsx adding hover tooltip showing upload date (formatted)
- [x] T104 [US2] Update components/r2-images/r2-image-item.tsx using shadcn/ui Tooltip component for hover details

### Image Modal/Lightbox

- [ ] T105 [US2] Create components/r2-images/r2-image-modal.tsx as client component
- [ ] T106 [US2] Create components/r2-images/r2-image-modal.tsx accepting selectedImage R2Object | null prop
- [ ] T107 [US2] Create components/r2-images/r2-image-modal.tsx accepting onClose callback prop
- [ ] T108 [US2] Create components/r2-images/r2-image-modal.tsx using shadcn/ui Dialog component
- [ ] T109 [US2] Create components/r2-images/r2-image-modal.tsx rendering full-size image when selectedImage is not null
- [ ] T110 [US2] Create components/r2-images/r2-image-modal.tsx adding close button
- [ ] T111 [US2] Create components/r2-images/r2-image-modal.tsx handling Escape key to close modal
- [ ] T112 [US2] Create components/r2-images/r2-image-modal.tsx adding Framer Motion animation for modal open/close
- [ ] T113 [US2] Update components/r2-images/r2-image-item.tsx adding onClick handler to open modal
- [ ] T114 [US2] Update components/r2-images/r2-image-gallery.tsx adding useState for selectedImage
- [ ] T115 [US2] Update components/r2-images/r2-image-gallery.tsx rendering r2-image-modal with selectedImage state

### Loading States

- [ ] T116 [US2] Create components/r2-images/r2-image-loading.tsx with skeleton loader for grid mode
- [ ] T117 [US2] Create components/r2-images/r2-image-loading.tsx using Tailwind animate-pulse class
- [ ] T118 [US2] Update components/r2-images/r2-image-gallery.tsx rendering r2-image-loading when loading is true

### Display Mode Switching

- [x] T119 [US2] Create lib/hooks/use-display-mode.ts with useState for displayMode ("grid" | "masonry" | "list")
- [x] T120 [US2] Create lib/hooks/use-display-mode.ts with localStorage persistence for displayMode
- [x] T121 [US2] Create components/r2-images/r2-image-masonry.tsx as client component
- [x] T122 [US2] Create components/r2-images/r2-image-masonry.tsx accepting images array prop
- [x] T123 [US2] Create components/r2-images/r2-image-masonry.tsx using CSS columns or react-masonry-css
- [x] T124 [US2] Create components/r2-images/r2-image-masonry.tsx rendering r2-image-item for each image
- [x] T125 [US2] Create components/r2-images/r2-image-list.tsx as client component
- [x] T126 [US2] Create components/r2-images/r2-image-list.tsx accepting images array prop
- [x] T127 [US2] Create components/r2-images/r2-image-list.tsx using Flexbox layout
- [x] T128 [US2] Create components/r2-images/r2-image-list.tsx rendering horizontal thumbnails with metadata
- [x] T129 [US2] Create components/r2-images/r2-image-list.tsx displaying filename, size, date next to thumbnail
- [x] T130 [US2] Update components/r2-images/r2-image-gallery.tsx adding display mode selector (grid/masonry/list buttons)
- [x] T131 [US2] Update components/r2-images/r2-image-gallery.tsx conditionally rendering grid/masonry/list based on displayMode

### Folder Navigation

- [x] T132 [US2] Create components/r2-images/r2-folder-navigation.tsx as client component
- [x] T133 [US2] Create components/r2-images/r2-folder-navigation.tsx accepting bucket, currentFolder, folders props
- [x] T134 [US2] Create components/r2-images/r2-folder-navigation.tsx accepting onFolderClick callback prop
- [x] T135 [US2] Create components/r2-images/r2-folder-navigation.tsx rendering breadcrumb navigation using shadcn/ui Breadcrumb
- [x] T136 [US2] Create components/r2-images/r2-folder-navigation.tsx computing breadcrumb items from currentFolder path
- [x] T137 [US2] Create components/r2-images/r2-folder-navigation.tsx handling breadcrumb click to navigate up folders
- [x] T138 [US2] Create components/r2-images/r2-folder-navigation.tsx rendering folder list when folders.length > 0
- [x] T139 [US2] Create components/r2-images/r2-folder-navigation.tsx handling folder click to call onFolderClick with folder path
- [x] T140 [US2] Update lib/hooks/use-r2-images.ts adding navigateToFolder() function updating currentFolder and resetting images
- [x] T141 [US2] Update components/r2-images/r2-image-gallery.tsx rendering r2-folder-navigation component
- [x] T142 [US2] Update components/r2-images/r2-image-gallery.tsx handling folder navigation to call navigateToFolder()

---

## Phase 5: User Story 3 - Handle Errors and Edge Cases (P2)

**Goal**: When errors occur while loading or displaying images, users receive clear feedback about what went wrong

**Independent Test**: Simulate network failures, bucket access issues, missing images, verify appropriate error messages display

**Acceptance Criteria**:

- Clear error message when bucket access fails
- Placeholder for individual image load failures
- Error message for unavailable bucket (other tabs remain functional)
- Network connectivity error message

### Error Handling in Hooks

- [x] T143 [US3] Update lib/hooks/use-r2-images.ts with try-catch in loadMore() catching fetch errors
- [x] T144 [US3] Update lib/hooks/use-r2-images.ts setting error state with user-friendly message on fetch failure
- [x] T145 [US3] Update lib/hooks/use-r2-images.ts with try-catch in refreshGallery() catching fetch errors
- [x] T146 [US3] Update lib/hooks/use-r2-images.ts handling HTTP error responses (400, 401, 403, 500)
- [x] T147 [US3] Update lib/hooks/use-r2-images.ts distinguishing network errors from API errors

### Error UI Components

- [ ] T148 [US3] Create components/r2-images/r2-image-error.tsx with error message display component
- [ ] T149 [US3] Create components/r2-images/r2-image-error.tsx accepting error message string prop
- [ ] T150 [US3] Create components/r2-images/r2-image-error.tsx accepting retry callback prop
- [ ] T151 [US3] Create components/r2-images/r2-image-error.tsx displaying error icon and message
- [ ] T152 [US3] Create components/r2-images/r2-image-error.tsx adding retry button calling retry callback
- [ ] T153 [US3] Update components/r2-images/r2-image-gallery.tsx rendering r2-image-error when error is not null
- [x] T154 [US3] Update components/r2-images/r2-image-item.tsx adding error placeholder for failed image loads
- [x] T155 [US3] Update components/r2-images/r2-image-item.tsx using onError handler on img tag to show placeholder

### Tab Error Handling

- [ ] T156 [US3] Update components/r2-images/r2-image-gallery.tsx handling per-bucket errors (error state per bucket)
- [ ] T157 [US3] Update components/r2-images/r2-image-gallery.tsx displaying error for specific bucket while other tabs remain functional
- [ ] T158 [US3] Update components/r2-images/r2-image-gallery.tsx canceling/pausing loading when switching tabs during load

### Network Error Handling

- [ ] T159 [US3] Update lib/hooks/use-r2-images.ts detecting network connectivity issues
- [ ] T160 [US3] Update lib/hooks/use-r2-images.ts displaying network error message suggesting user check connection
- [ ] T161 [US3] Update components/r2-images/r2-image-error.tsx adding specific UI for network errors

### Edge Case Handling

- [ ] T162 [US3] Update lib/r2/list-objects.ts handling very large image collections (thousands) efficiently
- [ ] T163 [US3] Update components/r2-images/r2-image-item.tsx handling unsupported image formats with error indicator
- [ ] T164 [US3] Update components/r2-images/r2-image-item.tsx handling corrupted image files with error indicator
- [ ] T165 [US3] Update lib/hooks/use-r2-images.ts handling concurrent tab switches preventing race conditions
- [ ] T166 [US3] Update lib/hooks/use-r2-images.ts ensuring only active tab's images are displayed

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Performance optimization, animations, and final polish

### Performance Optimization

- [ ] T167 Update lib/r2/get-object-url.ts implementing URL caching (check expiration before regenerating)
- [ ] T168 Update components/r2-images/r2-image-item.tsx wrapping with React.memo for performance
- [ ] T169 Update components/r2-images/r2-image-gallery.tsx optimizing re-renders with useMemo where appropriate
- [ ] T170 Create error boundary component for graceful error handling (components/r2-images/r2-error-boundary.tsx)

### Animations

- [ ] T171 Update components/r2-images/r2-image-tabs.tsx adding Framer Motion transitions for tab switching
- [ ] T172 Update components/r2-images/r2-image-item.tsx adding Framer Motion fade-in animation on image load
- [ ] T173 Update components/r2-images/r2-image-modal.tsx enhancing Framer Motion animations for open/close
- [ ] T174 Update components/r2-images/r2-folder-navigation.tsx adding Framer Motion transitions for folder navigation

### Image Sorting

- [x] T175 Update lib/r2/list-objects.ts sorting images by lastModified descending (newest first) before returning
- [x] T176 Update lib/utils/image-utils.ts ensuring sortImagesByDate() handles missing lastModified gracefully

### Empty States

- [ ] T177 Update components/r2-images/r2-image-gallery.tsx enhancing empty state message with helpful text
- [ ] T178 Update components/r2-images/r2-image-gallery.tsx adding empty state icon/illustration

### Accessibility

- [ ] T179 Update components/r2-images/r2-image-tabs.tsx adding ARIA labels for tabs
- [x] T180 Update components/r2-images/r2-image-item.tsx adding alt text to img tags using image filename
- [ ] T181 Update components/r2-images/r2-image-modal.tsx adding keyboard navigation (Arrow keys for next/prev if implemented)

---

## Parallel Execution Examples

### User Story 1 (Phase 3) - Parallel Opportunities

**Can work in parallel**:

- T009-T015 (Type definitions) - All independent type interfaces
- T045-T046 (Utility functions) - Independent helper functions
- T059-T066 (Tab component) - Can be built independently
- T067-T072 (Image item component) - Can be built independently
- T073-T078 (Grid component) - Can be built independently

**Must be sequential**:

- T047-T058 (Hooks) → T079-T089 (Gallery component) → T090-T094 (Page route)

### User Story 2 (Phase 4) - Parallel Opportunities

**Can work in parallel**:

- T096-T098 (Infinite scroll hook) - Independent feature
- T101-T104 (Image details) - Independent enhancement
- T105-T115 (Modal component) - Independent feature
- T116-T118 (Loading states) - Independent feature
- T119-T131 (Display modes) - Independent feature
- T132-T142 (Folder navigation) - Independent feature

### User Story 3 (Phase 5) - Parallel Opportunities

**Can work in parallel**:

- T143-T147 (Error handling in hooks) - Independent enhancement
- T148-T155 (Error UI components) - Independent feature
- T156-T158 (Tab error handling) - Independent enhancement
- T159-T161 (Network errors) - Independent enhancement
- T162-T166 (Edge cases) - Independent enhancements

---

## Task Summary

- **Total Tasks**: 181
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 38 tasks
- **Phase 3 (User Story 1)**: 49 tasks
- **Phase 4 (User Story 2)**: 47 tasks
- **Phase 5 (User Story 3)**: 24 tasks
- **Phase 6 (Polish)**: 15 tasks

## MVP Scope

**Minimum Viable Product**: Phase 1 + Phase 2 + Phase 3 (User Story 1)

- **Total MVP Tasks**: 95 tasks
- **Delivers**: Core tabbed gallery with three buckets, basic image display, authentication

## Independent Test Criteria

### User Story 1

- Navigate to /r2-images (authenticated)
- Verify three tabs appear with bucket names
- Click each tab, verify images switch
- Verify first tab is active by default
- Verify empty bucket shows message
- Test unauthenticated redirect

### User Story 2

- Scroll to bottom, verify more images load
- Hover over image, verify details appear
- Click image, verify modal opens
- Switch display modes, verify layout changes
- Navigate into folder, verify breadcrumb updates
- Click breadcrumb, verify navigation up

### User Story 3

- Simulate network failure, verify error message
- Load invalid image, verify placeholder
- Switch tabs during load, verify cancellation
- Test bucket access error, verify per-bucket error display

## Next Steps

1. Review tasks.md for completeness
2. Start with Phase 1 (Setup) - 8 tasks
3. Proceed to Phase 2 (Foundational) - 38 tasks
4. Implement Phase 3 (User Story 1) for MVP - 49 tasks
5. Test MVP independently
6. Continue with Phase 4-6 incrementally
