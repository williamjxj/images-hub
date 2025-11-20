# Quickstart Guide: Stock Image Search Hub

**Feature**: Stock Image Search Hub  
**Date**: 2025-01-27  
**Status**: Implementation Guide

This guide provides setup and development instructions for the Stock Image Search Hub feature.

---

## Prerequisites

- Node.js 20+ installed
- pnpm package manager installed
- Next.js 16.0.3 project set up
- Clerk authentication configured
- API keys for Unsplash, Pixabay, and Pexels

---

## Setup

### 1. Environment Variables

Add the following to `.env.local`:

```bash
# Stock Image API Keys
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
PIXABAY_API_KEY=your_pixabay_api_key
PEXELS_API_KEY=your_pexels_api_key
PIXABAY_URL=https://pixabay.com/api/  # Optional, defaults to this

# Clerk Authentication (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

**Getting API Keys**:

- **Unsplash**: https://unsplash.com/developers (free tier: 50 req/hour)
- **Pixabay**: https://pixabay.com/api/docs/ (free tier: 5,000 req/hour)
- **Pexels**: https://www.pexels.com/api/ (free tier: 200 req/hour)

### 2. Install Dependencies

```bash
# Check if axios is installed
pnpm list axios

# If not installed:
pnpm add axios
pnpm add -D @types/axios

# Dependencies already installed (from R2 gallery):
# - react-masonry-css
# - react-intersection-observer
# - framer-motion
# - tailwindcss-animate
```

---

## Project Structure

```
app/
├── images-hub/
│   └── page.tsx                    # Main page (server component)
├── api/
│   └── images-hub/
│       └── search/route.ts        # Search API endpoint

components/
└── images-hub/
    ├── images-hub-gallery.tsx     # Main gallery component
    ├── images-hub-search.tsx      # Search input
    ├── images-hub-provider-filter.tsx  # Provider checkboxes
    ├── images-hub-grid.tsx        # Masonry grid
    ├── images-hub-item.tsx        # Individual image
    ├── images-hub-modal.tsx       # Detail modal
    ├── images-hub-loading.tsx     # Loading skeletons
    └── images-hub-error.tsx       # Error display

lib/
├── hub/
│   ├── unsplash-client.ts         # Enhanced Unsplash client
│   ├── pexels-client.ts           # Enhanced Pexels client
│   ├── pixabay-client.ts          # Enhanced Pixabay client
│   ├── types.ts                  # Enhanced types
│   ├── normalizer.ts             # Data normalization
│   └── search-aggregator.ts      # Unified search aggregator
└── hooks/
    └── use-image-search.ts       # Search state hook
```

---

## Implementation Steps

### Step 1: Enhance API Clients

**File**: `lib/hub/unsplash-client.ts`

Add search method with query parameter:

```typescript
async search(query: string, page: number = 1, perPage: number = 20): Promise<ImageData[]> {
  const response = await axios.get<UnsplashSearchResponse>(
    `${this.baseUrl}/search/photos`,
    {
      params: {
        query,
        per_page: perPage,
        page,
        order_by: 'relevant',
      },
      headers: {
        Authorization: `Client-ID ${this.accessKey}`,
      },
    }
  );
  // ... normalization logic
}
```

**Repeat for**: `pexels-client.ts`, `pixabay-client.ts`

### Step 2: Create Normalizer

**File**: `lib/hub/normalizer.ts`

```typescript
import { ImageResult } from "./types";
import { UnsplashPhoto, PexelsPhoto, PixabayHit } from "./types";

export function normalizeUnsplash(photo: UnsplashPhoto): ImageResult {
  return {
    id: `u-${photo.id}`,
    source: "unsplash",
    urlThumb: photo.urls.small,
    urlRegular: photo.urls.regular,
    urlFull: photo.urls.full,
    width: photo.width,
    height: photo.height,
    description: photo.description || photo.alt_description,
    author: photo.user.name,
    authorUrl: photo.user.links?.html || null,
    sourceUrl: photo.links.html,
    tags: photo.tags?.map((t) => t.title) || [],
    attribution: `Photo by ${photo.user.name} on Unsplash`,
  };
}

// Similar functions for normalizePexels, normalizePixabay
```

### Step 3: Create Search Aggregator

**File**: `lib/hub/search-aggregator.ts`

```typescript
import { UnsplashClient } from "./unsplash-client";
import { PexelsClient } from "./pexels-client";
import { PixabayClient } from "./pixabay-client";
import {
  normalizeUnsplash,
  normalizePexels,
  normalizePixabay,
} from "./normalizer";
import { SearchResponse, ProviderResult } from "./types";

export async function searchImages(
  query: string,
  providers: ("unsplash" | "pexels" | "pixabay")[],
  page: number = 1,
  perPage: number = 20
): Promise<SearchResponse> {
  const unsplashClient = new UnsplashClient();
  const pexelsClient = new PexelsClient();
  const pixabayClient = new PixabayClient();

  // Call providers in parallel
  const results = await Promise.allSettled([
    providers.includes("unsplash")
      ? unsplashClient.search(query, page, perPage)
      : Promise.resolve([]),
    providers.includes("pexels")
      ? pexelsClient.search(query, page, perPage)
      : Promise.resolve([]),
    providers.includes("pixabay")
      ? pixabayClient.search(query, page, perPage)
      : Promise.resolve([]),
  ]);

  // Process results and build response
  // ... (see implementation)
}
```

### Step 4: Create API Route

**File**: `app/api/images-hub/search/route.ts`

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { searchImages } from "@/lib/hub/search-aggregator";

export async function GET(request: NextRequest) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 }
    );
  }

  // Extract query parameters
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const providersParam =
    searchParams.get("providers") || "unsplash,pexels,pixabay";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "20");

  // Validate query
  if (!query || query.trim() === "") {
    return NextResponse.json(
      { error: "Bad Request", message: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  // Parse providers
  const providers = providersParam.split(",") as (
    | "unsplash"
    | "pexels"
    | "pixabay"
  )[];

  try {
    const results = await searchImages(query.trim(), providers, page, perPage);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
```

### Step 5: Create Search Hook

**File**: `lib/hooks/use-image-search.ts`

```typescript
import { useState, useCallback } from "react";
import { SearchResponse, ImageResult } from "@/lib/hub/types";

export function useImageSearch() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (
      query: string,
      providers: ("unsplash" | "pexels" | "pixabay")[],
      page: number = 1
    ) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          providers: providers.join(","),
          page: page.toString(),
          per_page: "20",
        });

        const response = await fetch(`/api/images-hub/search?${params}`);
        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data: SearchResponse = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { results, loading, error, search };
}
```

### Step 6: Create UI Components

**File**: `components/images-hub/images-hub-gallery.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useImageSearch } from '@/lib/hooks/use-image-search';
import { ImagesHubSearch } from './images-hub-search';
import { ImagesHubProviderFilter } from './images-hub-provider-filter';
import { ImagesHubGrid } from './images-hub-grid';
import { ImagesHubModal } from './images-hub-modal';

export function ImagesHubGallery() {
  const [query, setQuery] = useState('');
  const [providers, setProviders] = useState<('unsplash' | 'pexels' | 'pixabay')[]>([
    'unsplash',
    'pexels',
    'pixabay',
  ]);
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

  const { results, loading, error, search } = useImageSearch();

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    search(searchQuery, providers, 1);
  };

  return (
    <div className="container mx-auto p-4">
      <ImagesHubSearch onSearch={handleSearch} />
      <ImagesHubProviderFilter
        providers={providers}
        onChange={setProviders}
      />
      {loading && <ImagesHubLoading />}
      {error && <ImagesHubError message={error} />}
      {results && <ImagesHubGrid results={results} onImageClick={setSelectedImage} />}
      {selectedImage && (
        <ImagesHubModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
```

### Step 7: Create Page Route

**File**: `app/images-hub/page.tsx`

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ImagesHubGallery } from '@/components/images-hub/images-hub-gallery';

export default async function ImagesHubPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <ImagesHubGallery />;
}
```

---

## Testing

### Manual Testing

1. **Search Functionality**:
   - Enter a search query (e.g., "sunset")
   - Verify results appear from selected providers
   - Check that results are grouped by provider

2. **Provider Filtering**:
   - Select/deselect providers
   - Verify results update accordingly

3. **Pagination**:
   - Scroll to bottom
   - Verify next page loads automatically

4. **Error Handling**:
   - Disable one API key temporarily
   - Verify partial results still display
   - Check error message appears

5. **Image Detail**:
   - Click on an image
   - Verify modal opens with full-size image
   - Check attribution information displays

### API Testing

```bash
# Test search endpoint
curl -X GET "http://localhost:3000/api/images-hub/search?q=sunset&providers=unsplash,pexels" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

---

## Troubleshooting

### Issue: API returns 401 Unauthorized

**Solution**: Ensure Clerk authentication is configured and user is signed in.

### Issue: No results from a provider

**Possible Causes**:

- API key invalid or missing
- Rate limit exceeded
- Provider API is down

**Solution**: Check `.env.local` for API keys, check rate limit headers in response.

### Issue: Images not loading

**Possible Causes**:

- CORS issues with provider URLs
- Invalid image URLs
- Network errors

**Solution**: Check browser console for errors, verify image URLs are valid.

### Issue: Slow performance

**Possible Causes**:

- Too many providers selected
- Large images loading
- No caching

**Solution**:

- Use smaller image sizes for grid (`urlRegular` instead of `urlFull`)
- Implement client-side caching
- Consider server-side caching for popular queries

---

## Next Steps

1. Implement infinite scroll pagination
2. Add loading skeletons
3. Add error retry functionality
4. Add image download functionality
5. Add attribution copy button
6. Add search history (localStorage)
7. Add advanced filters (color, orientation, size)

---

**References**:

- API Documentation: See `contracts/api-images-hub.yaml`
- Data Model: See `data-model.md`
- Research: See `research.md`
