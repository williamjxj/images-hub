# Data Model: Portrait.so Clone Page

**Date**: 2025-01-27  
**Feature**: Portrait.so Clone Page

## Overview

This feature is a static landing page with minimal data requirements. The page primarily consists of presentational content with client-side state for interactive elements (FAQ accordion, navigation active states).

## Entities

### Page Section

Represents a distinct content area on the landing page.

**Attributes**:
- `id`: string - Unique identifier for the section (e.g., "hero", "features", "faq")
- `title`: string - Section heading text
- `content`: ReactNode - Section content (text, images, components)
- `order`: number - Display order on the page

**Relationships**:
- Contains multiple `ContentBlock` entities
- Referenced by `NavigationItem` entities

**State**: Static (no persistence required)

### Navigation Item

Represents a link in the page-specific header navigation.

**Attributes**:
- `label`: string - Display text for the navigation link
- `href`: string - Anchor link to target section (e.g., "#features")
- `isActive`: boolean - Whether this item is currently active (client-side state)
- `icon?`: ReactNode - Optional icon component

**Relationships**:
- Links to a `PageSection` entity

**State**: Client-side only (no persistence)

### FAQ Item

Represents a question-answer pair in the FAQ section.

**Attributes**:
- `id`: string - Unique identifier
- `question`: string - FAQ question text
- `answer`: string - FAQ answer text
- `isExpanded`: boolean - Whether this item is currently expanded (client-side state)

**Relationships**:
- Belongs to FAQ `PageSection`

**State**: Client-side only (accordion state)

### Content Block

Represents a reusable content element within a section.

**Attributes**:
- `type`: "text" | "image" | "video" | "link" | "button"
- `content`: string | ReactNode - Content data
- `metadata?`: object - Optional metadata (alt text, href, etc.)

**Relationships**:
- Belongs to a `PageSection`

**State**: Static (no persistence)

## State Management

### Client-Side State

1. **FAQ Accordion State**
   - Type: `Record<string, boolean>` (FAQ item ID → expanded state)
   - Management: React `useState` hook
   - Scope: Component-level (FAQ component)

2. **Active Navigation Item**
   - Type: `string | null` (active section ID)
   - Management: React `useState` or scroll-based detection
   - Scope: Navigation component

3. **Scroll Position**
   - Type: `number` (scroll Y position)
   - Management: React `useEffect` with scroll event listener or Intersection Observer
   - Scope: Page-level for scroll animations

### No Server-Side State

This feature requires no:
- Database storage
- API endpoints
- Authentication state
- User preferences persistence
- Server-side rendering of dynamic content

## Data Flow

```
User Interaction
    ↓
Client-Side Event Handler
    ↓
React State Update
    ↓
UI Re-render
```

**Example Flow (FAQ Accordion)**:
1. User clicks FAQ question
2. Event handler toggles `isExpanded` state
3. Component re-renders with expanded/collapsed state
4. Animation plays (Framer Motion)

## Validation Rules

### Content Validation

- **FAQ Items**: Must have both question and answer text (non-empty)
- **Navigation Items**: Must have valid href (starts with "#" for anchor links)
- **Content Blocks**: Type must match content structure

### Client-Side Validation

- **Accordion**: Only one FAQ item expanded at a time (enforced by component logic)
- **Navigation**: Active state updates based on scroll position or click

## Data Sources

### Static Content

All content is statically defined in:
- React component files
- TypeScript/JavaScript constants
- Content adapted from portrait.so to match image hub/search theme

### Images

- Source: Direct from portrait.so (initially) or placeholders/SVGs
- Storage: `/public/portrait/` directory or Next.js Image optimization
- Format: WebP/AVIF with fallbacks

## Relationships Diagram

```
PageSection (Hero)
    ├── ContentBlock (Headline)
    ├── ContentBlock (Subheadline)
    └── ContentBlock (CTA Button)

PageSection (Features)
    ├── ContentBlock (Feature 1)
    ├── ContentBlock (Feature 2)
    └── ContentBlock (Feature 3)

PageSection (FAQ)
    ├── FAQItem (Q1/A1)
    ├── FAQItem (Q2/A2)
    └── FAQItem (Q3/A3)

NavigationItem
    └── links to → PageSection
```

## Implementation Notes

1. **No Database Required**: All content is static and defined in code
2. **Minimal State**: Only client-side UI state (accordion, navigation)
3. **Type Safety**: Use TypeScript interfaces for all entities
4. **Component Structure**: Each section can be a separate React component
5. **Content Management**: Consider extracting content to constants file for easy updates

## Future Considerations

If content needs to become dynamic in the future:
- Move content to CMS or database
- Create API endpoints for content fetching
- Add content management interface
- Implement caching strategy

For now, static content is sufficient and aligns with the feature scope.

