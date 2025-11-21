# Implementation Plan: Portrait.so Clone Page

**Branch**: `001-portrait-clone` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-portrait-clone/spec.md` and user requirements to clone portrait.so landing page with focus on UI/UX/CSS/animation

## Summary

This plan implements a visual clone of portrait.so's landing page at the `/portrait` route, focusing on replicating the UI/UX, CSS techniques, and animation patterns. The implementation uses shadcn/ui and Magic UI as primary component libraries, with Framer Motion and GSAP for animations. Content is adapted to match the current application's image hub/search theme while maintaining the same structure and visual design as the reference site.

**Primary Requirements**:

- Visual clone of portrait.so landing page (P1)
- Page-specific navigation header matching reference design (P1)
- Hero section with adapted content and CTA placeholders (P1)
- Feature sections with scroll-triggered animations (P1)
- FAQ accordion (one-at-a-time expansion) (P1)
- Smooth scrolling and section navigation (P2)
- Interactive hover effects and transitions (P2)
- Magic UI components for text/button animations (P3)
- Responsive design (mobile/tablet/desktop) (P1)
- Accessibility compliance (WCAG AA) (P1)

**Technical Approach**: Create a new Next.js page route with page-specific components, integrate Magic UI components via MCP, use Framer Motion for scroll animations, GSAP for advanced scroll effects, and Tailwind CSS for all styling. All content is static with client-side state only for interactive elements (FAQ accordion, navigation).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), React 19.2.0, Next.js 16.0.3  
**Primary Dependencies**:

- Next.js 16 (App Router)
- React 19.2.0
- TypeScript 5.x (strict mode)
- Tailwind CSS 4
- Framer Motion 12.23.24 (existing)
- GSAP 3.13.0 (existing)
- next-themes 0.2.1 (existing)
- Magic UI components (via MCP or manual integration)
- shadcn/ui components (existing)
- react-intersection-observer 10.0.0 (existing)

**Storage**: N/A (static content, client-side state only)

**Testing**: 
- Component tests with React Testing Library
- Accessibility tests with jest-axe
- Visual regression tests (optional)
- Manual testing for animations and interactions

**Target Platform**: Web (Next.js App Router, Vercel deployment)

**Project Type**: Web application (Next.js App Router structure)

**Performance Goals**:
- Page load: < 2 seconds (LCP < 2.5s)
- Interactive element response: < 100ms
- Smooth scrolling: < 500ms transition time
- 60fps animations

**Constraints**:
- Must use existing design system (shadcn/ui, Tailwind CSS)
- No backend functionality (static page)
- No authentication required (publicly accessible)
- Browser support: Chrome, Firefox, Safari, Edge (last 2 versions)
- Accessibility: WCAG 2.1 AA compliance

**Scale/Scope**:
- Single page route (`/portrait`)
- ~5-7 major sections (hero, features, benefits, FAQ, footer)
- ~15-20 FAQ items
- Static content (no CMS or database)
- Client-side state only (FAQ accordion, navigation)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Code Quality**:

- [x] Feature uses TypeScript with strict mode (no `any` types)
- [x] Components follow functional React + TypeScript conventions
- [x] File/folder naming uses kebab-case
- [x] All exports include JSDoc/TypeScript doc comments

**Testing Standards**:

- [x] API routes have integration test coverage planned (N/A - no API routes)
- [x] Custom hooks have unit test coverage planned (if hooks are created)
- [x] Utility functions have unit test coverage planned (if utilities are created)
- [x] Component accessibility testing planned (FAQ accordion, navigation, buttons)

**User Experience Consistency**:

- [x] Feature includes loading states for async operations (N/A - static content)
- [x] Feature includes error states with user-friendly messages (image loading fallbacks)
- [x] Feature includes empty states where applicable (N/A - always has content)
- [x] Responsive design covers mobile/tablet/desktop breakpoints
- [x] shadcn/ui components used for UI primitives (Accordion, Button)
- [x] Accessibility requirements met (ARIA labels, keyboard navigation)

**Performance Requirements**:

- [x] API route performance targets defined (N/A - no API routes)
- [x] Image optimization strategy defined (Next.js Image component with WebP/AVIF)
- [x] Code splitting strategy identified (automatic with App Router, dynamic imports for GSAP if needed)
- [x] Caching strategy defined (static page generation, image caching via Next.js)

## Project Structure

### Documentation (this feature)

```text
specs/001-portrait-clone/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (N/A - no API contracts needed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── portrait/
│   ├── page.tsx                 # Main page component (server component)
│   └── components/
│       ├── portrait-header.tsx  # Page-specific navigation header
│       ├── portrait-hero.tsx    # Hero section with headline and CTAs
│       ├── portrait-features.tsx # Features section with cards
│       ├── portrait-benefits.tsx # Benefits section
│       ├── portrait-faq.tsx     # FAQ accordion section
│       └── portrait-footer.tsx  # Footer with links
├── layout.tsx                   # Updated: Add /portrait to navigation
└── globals.css                  # Updated: Add scroll-smooth if needed

components/
└── ui/                          # Existing shadcn/ui components
    ├── accordion.tsx            # Used for FAQ section
    ├── button.tsx               # Base for CTA buttons
    └── ...                      # Other existing components

lib/
└── portrait/                    # New: Portrait-specific utilities (if needed)
    └── content.ts               # Static content constants (optional)

public/
└── portrait/                    # New: Portrait page assets
    ├── images/                  # Images from portrait.so or placeholders
    └── ...                      # Other assets
```

**Structure Decision**: Next.js App Router structure with feature-based component organization. Page-specific components live in `app/portrait/components/` to keep them isolated. Static content can be extracted to `lib/portrait/content.ts` for easier maintenance. Images stored in `public/portrait/` for easy access.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. Implementation follows Next.js App Router best practices and uses existing design system components.

## Phase 0: Research & Analysis

**Status**: ✅ Complete

**Output**: [research.md](./research.md)

**Key Findings**:

1. **Smooth Scrolling**: Use Tailwind's `scroll-smooth` utility + GSAP ScrollSmoother for advanced features
2. **Scroll Animations**: Framer Motion's `useInView` hook for React-friendly scroll-triggered animations
3. **Text Effects**: Magic UI components (`animated-gradient-text`, `typing-animation`, `text-reveal`)
4. **Button Effects**: Magic UI components (`shimmer-button`, `ripple-button`)
5. **Background Patterns**: Magic UI pattern components (`grid-pattern`, `dot-pattern`)
6. **Accordion**: shadcn/ui Accordion component with Framer Motion animations
7. **Hover Effects**: Tailwind utilities + Framer Motion `whileHover` for advanced interactions
8. **Typography**: Tailwind typography utilities with responsive breakpoints
9. **Section Transitions**: GSAP ScrollTrigger for complex scroll animations

**Technology Decisions**:
- All required libraries already installed (Framer Motion, GSAP, next-themes)
- Magic UI components available via MCP
- No additional dependencies required
- Performance-optimized approach using CSS transforms and Intersection Observer

## Phase 1: Design & Contracts

**Status**: ✅ Complete

### Data Model

**Output**: [data-model.md](./data-model.md)

**Key Entities**:
- **PageSection**: Static content sections (hero, features, FAQ, footer)
- **NavigationItem**: Header navigation links with active state
- **FAQItem**: Question-answer pairs with expand/collapse state
- **ContentBlock**: Reusable content elements (text, image, video, link, button)

**State Management**:
- Client-side only (React `useState`)
- FAQ accordion state (one expanded at a time)
- Active navigation item (scroll-based detection)
- No server-side state or database required

### API Contracts

**Output**: N/A (no API endpoints required)

This feature is a static landing page with no backend functionality. All interactions are client-side only.

### Quickstart Guide

**Output**: [quickstart.md](./quickstart.md)

**Key Steps**:
1. Create page route at `app/portrait/page.tsx`
2. Integrate Magic UI components via MCP
3. Create component structure for sections
4. Add navigation link to main app navigation
5. Implement scroll animations and hover effects
6. Test responsive design and accessibility

## Phase 2: Implementation Planning

**Status**: Ready for `/speckit.tasks`

The implementation plan is complete. Next step is to break down into specific tasks using `/speckit.tasks` command.

**Implementation Phases**:

1. **Foundation** (P1):
   - Create page route and component structure
   - Implement hero section with adapted content
   - Create page-specific navigation header
   - Build feature sections

2. **Interactions** (P2):
   - Add smooth scrolling behavior
   - Implement scroll-triggered animations
   - Add FAQ accordion functionality
   - Create hover effects

3. **Polish** (P3):
   - Integrate Magic UI components
   - Fine-tune animations
   - Optimize performance
   - Accessibility audit

## Dependencies

### Existing Dependencies (No Installation Required)
- ✅ Framer Motion 12.23.24
- ✅ GSAP 3.13.0
- ✅ next-themes 0.2.1
- ✅ react-intersection-observer 10.0.0
- ✅ Tailwind CSS 4
- ✅ shadcn/ui components

### Magic UI Components (Via MCP)
- Text animations: `animated-gradient-text`, `typing-animation`, `text-reveal`
- Button effects: `shimmer-button`, `ripple-button`
- Background patterns: `grid-pattern`, `dot-pattern`, `interactive-grid-pattern`
- Other effects: `border-beam`, `animated-beam`, `meteors`

## Performance Strategy

1. **Image Optimization**: Next.js Image component with WebP/AVIF formats
2. **Code Splitting**: Automatic with App Router, dynamic imports for GSAP if needed
3. **Animation Performance**: Use CSS transforms, `will-change` sparingly
4. **Lazy Loading**: Images and below-fold content
5. **Scroll Animations**: Use `once: true` in Framer Motion to prevent re-triggering
6. **Bundle Size**: Tree-shake Magic UI components, use dynamic imports where possible

## Accessibility Strategy

1. **Semantic HTML**: Proper heading hierarchy, landmarks
2. **ARIA Labels**: All interactive elements properly labeled
3. **Keyboard Navigation**: Full keyboard support for all interactions
4. **Focus Management**: Visible focus indicators, logical tab order
5. **Reduced Motion**: Respect `prefers-reduced-motion` media query
6. **Screen Reader Support**: Test with screen readers for critical flows

## Testing Strategy

1. **Component Tests**: Test FAQ accordion, navigation, button interactions
2. **Accessibility Tests**: Use jest-axe for automated accessibility testing
3. **Visual Testing**: Manual testing for animations and responsive design
4. **Performance Testing**: Lighthouse audits for performance and accessibility
5. **Browser Testing**: Test in target browsers (Chrome, Firefox, Safari, Edge)

## Next Steps

1. Run `/speckit.tasks` to break down implementation into specific tasks
2. Begin implementation with Phase 1 (Foundation)
3. Integrate Magic UI components as needed
4. Test and refine animations
5. Accessibility audit and fixes
6. Performance optimization
7. Final polish and deployment

## References

- [Research Document](./research.md) - Detailed technical analysis
- [Data Model](./data-model.md) - Entity definitions and state management
- [Quickstart Guide](./quickstart.md) - Development workflow
- [Specification](./spec.md) - Feature requirements
- [Framer Motion Docs](https://motion.dev/docs)
- [GSAP Docs](https://greensock.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- Magic UI Components (via MCP)
