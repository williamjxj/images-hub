# Implementation Plan: Stock Image Search Hub

**Branch**: `004-image-search-hub` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-image-search-hub/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a unified image search hub that aggregates search results from three stock photo providers (Unsplash, Pixabay, Pexels) into a single interface. The feature includes:

- Unified search interface across multiple providers
- Masonry/waterfall grid layout for image results
- Provider filtering and selection
- Infinite scroll pagination
- Image detail modal with attribution and download links
- Authentication-protected access
- Graceful error handling for API failures and rate limits

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: Next.js 16.0.3, React 19.2.0, axios (for API calls), framer-motion 12.23.24, tailwindcss-animate 1.0.7, react-masonry-css 1.0.16  
**Storage**: No local database storage required - all data fetched from external APIs  
**Testing**: Jest + React Testing Library (to be added)  
**Target Platform**: Web (Next.js App Router), modern browsers  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**:

- Search results displayed within 3 seconds (SC-001)
- Support 50+ images without performance degradation (SC-007)
- Handle API errors gracefully - partial results when providers fail (SC-004)
- 95% success rate for displaying results from at least one provider (SC-002)

**Constraints**:

- Must use API keys from `.env.local` (UNSPLASH_ACCESS_KEY, PIXABAY_API_KEY, PEXELS_API_KEY)
- Authentication required (Clerk integration - consistent with R2 gallery)
- Infinite scroll instead of traditional pagination
- Results grouped by provider (Unsplash → Pixabay → Pexels) with section headers
- Must handle rate limiting gracefully (show partial results with warnings)
- Must normalize different API response formats into unified data structure

**Scale/Scope**:

- 3 external API providers (Unsplash, Pixabay, Pexels)
- Unlimited search results per query (via infinite scroll)
- All authenticated users have access
- Rate limits vary by provider (must handle gracefully)

**Existing Codebase**:

- `lib/hub/` folder contains working implementations:
  - `unsplash-client.ts` - Unsplash API client (needs enhancement for search queries)
  - `pexels-client.ts` - Pexels API client (needs enhancement for search queries)
  - `pixabay-client.ts` - Pixabay API client (needs enhancement for search queries)
  - `types.ts` - Common type definitions (needs enhancement for unified search)
  - `r2-client.ts` - R2 upload client (not directly relevant but shows pattern)
- Can reuse and improve existing client implementations
- Follow patterns from R2 image gallery (`003-r2-image-tabs`) for UI components

**NEEDS CLARIFICATION**:

- API rate limits per provider (to determine caching strategy)
- Exact API response structures for search endpoints (to finalize normalization)
- Whether to implement client-side caching for search results
- Image size preferences (thumbnails vs full-size for grid display)
- Attribution format requirements per provider

## Constitution Check

_No constitution file found - skipping gate checks. Proceeding with implementation planning._

## Project Structure

### Documentation (this feature)

```text
specs/004-image-search-hub/
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
├── images-hub/
│   └── page.tsx                    # Main images hub page (server component wrapper)
├── api/
│   └── images-hub/
│       └── search/route.ts        # API: Unified search endpoint (calls all providers)
components/
├── images-hub/
│   ├── images-hub-gallery.tsx     # Main gallery component (client)
│   ├── images-hub-search.tsx      # Search input component
│   ├── images-hub-provider-filter.tsx  # Provider selection checkboxes
│   ├── images-hub-grid.tsx        # Masonry grid display component
│   ├── images-hub-item.tsx        # Individual image item component
│   ├── images-hub-modal.tsx       # Image detail modal/lightbox
│   ├── images-hub-loading.tsx     # Loading states and skeletons
│   └── images-hub-error.tsx       # Error display component
lib/
├── hub/
│   ├── unsplash-client.ts         # Enhanced Unsplash client (search support)
│   ├── pexels-client.ts           # Enhanced Pexels client (search support)
│   ├── pixabay-client.ts          # Enhanced Pixabay client (search support)
│   ├── types.ts                   # Enhanced unified types
│   ├── normalizer.ts              # Data normalization utilities
│   └── search-aggregator.ts       # Unified search aggregator (calls all providers)
└── hooks/
    ├── use-image-search.ts        # Main search state hook
    └── use-infinite-scroll.ts     # Reuse from R2 gallery (already exists)
```

**Structure Decision**: Using Next.js App Router structure with:

- Server components for data fetching (API routes)
- Client components for interactive UI (gallery, search, filters)
- Separation of concerns: API clients in `/lib/hub`, UI components in `/components/images-hub`
- API routes for secure server-side API access (keys not exposed to client)
- Reuse existing `lib/hub/` implementations and enhance them
- Follow patterns from R2 image gallery for consistency

## Complexity Tracking

**Estimated Complexity**: Medium-High

- **API Integration**: Medium (3 different APIs with different formats)
- **Data Normalization**: Medium (need to unify different response structures)
- **UI Components**: Medium (reuse patterns from R2 gallery)
- **Error Handling**: Medium-High (rate limiting, partial failures)
- **State Management**: Medium (multiple providers, pagination, filters)

**Risk Areas**:

- API rate limiting and error handling
- Data normalization complexity
- Performance with large result sets
- Provider API changes/breaking changes

## Dependencies to install

```bash
# Already installed (from R2 gallery):
# - react-masonry-css (for masonry layout)
# - react-intersection-observer (for infinite scroll)
# - framer-motion (for animations)
# - tailwindcss-animate (for CSS animations)

# May need to add:
# - axios (if not already installed) - for API calls
# - @types/axios (if using TypeScript)
```

## Environment variables required

```bash
# API Keys (already in .env.local per spec):
UNSPLASH_ACCESS_KEY=your_unsplash_key
PIXABAY_API_KEY=your_pixabay_key
PEXELS_API_KEY=your_pexels_key
PIXABAY_URL=https://pixabay.com/api/  # Optional, defaults to this

# Authentication (already configured):
# Clerk authentication keys (existing)
```

## Reference Implementation Pattern

**R2 Image Gallery (`003-r2-image-tabs`)**:

- Similar gallery UI patterns (masonry grid, infinite scroll, modals)
- Similar component structure and organization
- Similar state management patterns
- Can reuse: `use-infinite-scroll.ts`, display mode patterns, loading skeletons

**Key Differences**:

- R2 gallery: Server-side data (R2 buckets), single source
- Images Hub: External APIs, multiple sources, requires normalization
- R2 gallery: Folder navigation, this feature: search-based
- R2 gallery: Presigned URLs, this feature: Direct API URLs

## Phase 0: Research & Technical Decisions ✅ COMPLETE

**Goal**: Resolve all NEEDS CLARIFICATION items and make technical decisions

**Research Tasks**:

1. ✅ Research Unsplash, Pixabay, Pexels API documentation for:
   - Search endpoint structures
   - Rate limits and quotas
   - Response formats and data structures
   - Image size options (thumbnails, regular, full)
   - Attribution requirements
2. ✅ Research data normalization patterns for multi-provider aggregation
3. ✅ Research caching strategies for API responses (client-side vs server-side)
4. ✅ Research error handling patterns for partial API failures
5. ✅ Review existing `lib/hub/` implementations to understand current patterns

**Output**: ✅ `research.md` with all clarifications resolved

## Phase 1: Design & Contracts ✅ COMPLETE

**Prerequisites**: ✅ `research.md` complete

**Design Tasks**:

1. ✅ **Data Model**: Define unified `ImageResult` type and normalization mapping
2. ✅ **API Contracts**: Design unified search API endpoint
3. ✅ **Component Design**: Design component hierarchy and props
4. ✅ **State Management**: Design search state, pagination, filtering

**Output**: ✅ `data-model.md`, ✅ `contracts/api-images-hub.yaml`, ✅ `quickstart.md`

## Phase 2: Implementation Planning

**Prerequisites**: Phase 1 complete

**Planning Tasks**:

1. Break down into implementation tasks
2. Define task dependencies
3. Estimate complexity
4. Create task checklist

**Output**: `tasks.md` (created by `/speckit.tasks` command)

---

**Next Steps**:

1. Execute Phase 0: Generate `research.md`
2. Execute Phase 1: Generate `data-model.md`, `contracts/`, `quickstart.md`
3. Run `/speckit.tasks` to create task breakdown
