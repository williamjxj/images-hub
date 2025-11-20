# Rate Limit Analysis: Per-Provider Image Limits

**Date**: 2025-01-27  
**Feature**: Image Search Hub  
**Question**: Should we limit each provider to 20 images per search?

---

## Executive Summary

**Recommendation**: **Keep 20 as default, but implement adaptive limits** based on provider capabilities and rate limit status.

**Rationale**:

- 20 is optimal for Unsplash (max 30, rate limit 50/hour)
- Provides good balance between UX and rate limit protection
- Allows flexibility for users who want more results

---

## Current Implementation

### Default Configuration

- **Default `perPage`**: 20 images per provider
- **Configurable**: Yes, via `per_page` query parameter (1-200)
- **Provider Max Limits**:
  - Unsplash: 30 per page
  - Pexels: 80 per page
  - Pixabay: 200 per page

### Rate Limits

| Provider     | Free Tier Rate Limit | Max Per Page | Requests/Hour at 20/page |
| ------------ | -------------------- | ------------ | ------------------------ |
| **Unsplash** | 50 requests/hour     | 30           | ~2.5 searches/hour       |
| **Pexels**   | 200 requests/hour    | 80           | ~10 searches/hour        |
| **Pixabay**  | 5,000 requests/hour  | 200          | ~250 searches/hour       |

---

## Analysis: Fixed 20 Limit vs. Flexible Limit

### ✅ **Pros of Fixed 20 Limit**

#### 1. **Rate Limit Protection**

- **Unsplash Protection**: With 50 requests/hour limit, 20 per page means:
  - Each search = 1 request per provider
  - ~2.5 searches/hour before hitting limit
  - Safer buffer for multiple users
- **Consistent Behavior**: Same limit across all providers simplifies UX

#### 2. **Performance Benefits**

- **Faster Initial Load**: Smaller payloads = faster API responses
- **Lower Bandwidth**: Fewer thumbnails to download initially
- **Better Mobile Experience**: Reduced data usage on mobile networks

#### 3. **Predictable Pagination**

- Consistent page sizes make infinite scroll logic simpler
- Easier to calculate "hasMore" status
- More predictable user experience

#### 4. **Cost Efficiency**

- Fewer API calls = lower risk of hitting paid tier limits
- Better for free tier usage

### ❌ **Cons of Fixed 20 Limit**

#### 1. **More API Calls for Large Result Sets**

- Users browsing many results = more requests
- Higher cumulative rate limit risk over time
- More network overhead

#### 2. **Slower Discovery**

- Users see fewer results per scroll
- More scrolling required to see variety
- May feel limiting for exploratory searches

#### 3. **Underutilizes Provider Capabilities**

- Pexels allows 80 per page (4x more)
- Pixabay allows 200 per page (10x more)
- Missing efficiency gains for providers with higher limits

---

## Recommended Strategy: **Adaptive Limits**

### Option 1: Provider-Specific Defaults (Recommended)

**Implementation**: Set different defaults per provider based on their capabilities:

```typescript
const PROVIDER_DEFAULTS = {
  unsplash: 20, // Conservative (max 30, rate limit 50/hour)
  pexels: 40, // Moderate (max 80, rate limit 200/hour)
  pixabay: 50, // Moderate (max 200, rate limit 5000/hour)
} as const;
```

**Benefits**:

- ✅ Optimizes for each provider's capabilities
- ✅ Still protects Unsplash (most restrictive)
- ✅ Better UX for Pexels/Pixabay users
- ✅ Maintains flexibility via `per_page` parameter

**Trade-offs**:

- Slightly more complex implementation
- Inconsistent page sizes across providers (but grouped by provider anyway)

### Option 2: Rate Limit-Aware Adaptive Limits

**Implementation**: Dynamically adjust limits based on rate limit headers:

```typescript
// Pseudo-code
function getOptimalPerPage(
  provider: string,
  rateLimitRemaining: number
): number {
  if (rateLimitRemaining < 10) return 10; // Conservative when low
  if (rateLimitRemaining < 30) return 20; // Standard

  // More aggressive when we have buffer
  switch (provider) {
    case "unsplash":
      return 30; // Max out Unsplash
    case "pexels":
      return 60; // High but safe
    case "pixabay":
      return 100; // High but safe
  }
}
```

**Benefits**:

- ✅ Maximizes efficiency when rate limits allow
- ✅ Automatically protects when limits are low
- ✅ Self-optimizing system

**Trade-offs**:

- More complex implementation
- Requires tracking rate limit headers
- May cause inconsistent UX

### Option 3: User-Selectable Limit (Current + Enhancement)

**Implementation**: Keep 20 as default, but add UI control:

```typescript
// Add to UI
<Select value={perPage} onValueChange={setPerPage}>
  <option value="20">20 per provider (Recommended)</option>
  <option value="30">30 per provider</option>
  <option value="50">50 per provider</option>
</Select>
```

**Benefits**:

- ✅ User control over their experience
- ✅ Power users can optimize for their needs
- ✅ Simple implementation
- ✅ Maintains safe defaults

**Trade-offs**:

- Users may not understand the implications
- Could lead to rate limit issues if misused

---

## Final Recommendation

### **Short Term (MVP)**: Keep 20 as Default ✅

**Rationale**:

1. **Safety First**: Protects against rate limits, especially Unsplash
2. **Good UX**: 20 images per provider = 60 total (with 3 providers) is plenty for initial view
3. **Infinite Scroll**: Users can load more as needed
4. **Simple**: No additional complexity

### **Medium Term (Enhancement)**: Implement Option 1 (Provider-Specific Defaults)

**Implementation Steps**:

1. Update `search-aggregator.ts` to use provider-specific defaults
2. Update API route to accept provider-specific `per_page` values
3. Update frontend to handle different page sizes per provider
4. Document the differences in UI (optional tooltip)

**Code Example**:

```typescript
// lib/hub/search-aggregator.ts
const PROVIDER_DEFAULTS = {
  unsplash: 20,
  pexels: 40,
  pixabay: 50,
} as const;

export async function searchImages(
  query: string,
  providers: ("unsplash" | "pexels" | "pixabay")[],
  page: number = 1,
  perPage?: number // Optional, will use provider defaults if not provided
): Promise<SearchResponse> {
  // Use provider-specific defaults if perPage not provided
  const perPageMap = providers.reduce(
    (acc, provider) => {
      acc[provider] = perPage || PROVIDER_DEFAULTS[provider];
      return acc;
    },
    {} as Record<string, number>
  );

  // ... rest of implementation
}
```

### **Long Term (Advanced)**: Consider Option 2 (Rate Limit-Aware)

Only if:

- Rate limit tracking infrastructure is in place
- Need to maximize efficiency
- Have monitoring/alerting for rate limit issues

---

## Implementation Impact

### If We Keep 20 (Current):

- ✅ **No changes needed** - already implemented
- ✅ **Safe** - protects against rate limits
- ✅ **Simple** - easy to maintain

### If We Implement Provider-Specific Defaults:

- **Effort**: ~2-3 hours
- **Files to Modify**:
  - `lib/hub/search-aggregator.ts` - Add provider defaults
  - `app/api/images-hub/search/route.ts` - Handle provider-specific perPage
  - `lib/hooks/use-image-search.ts` - Update hook if needed
  - `components/images-hub/images-hub-gallery.tsx` - Update UI if showing perPage info
- **Testing**: Verify each provider respects its limit
- **Documentation**: Update API docs and quickstart

---

## Metrics to Monitor

If implementing changes, track:

1. **Rate Limit Hits**: How often do we hit rate limits per provider?
2. **User Satisfaction**: Do users request more results per page?
3. **API Efficiency**: Average results per API call
4. **Load Times**: Impact of larger page sizes on performance

---

## Conclusion

**For MVP**: ✅ **Keep 20 as default** - it's safe, simple, and provides good UX.

**For Enhancement**: Consider **provider-specific defaults** (20/40/50) to optimize for each provider's capabilities while maintaining safety.

**Key Insight**: The infinite scroll pattern means users can always load more, so initial page size is less critical than rate limit protection.

---

**Last Updated**: 2025-01-27
