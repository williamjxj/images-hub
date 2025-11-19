# Implementation Plan: Page Reorganization

**Branch**: `001-reorganize-pages` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-reorganize-pages/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Reorganize the application structure to make Stock Images the home page, convert AI Chat into a floating widget accessible across all pages, and reposition Cloudflare Images as a demo link accessible from the Stock Images page. This reorganization focuses on business value by positioning Stock Images as the primary feature while maintaining AI chat functionality as a secondary, non-intrusive assistant widget. The implementation includes navigation updates, widget state management, chat history persistence, and enhanced UI components using Magic UI and Tailwind CSS animations.

**Technical Approach**: 
- Move Stock Images page (`/images-hub`) to root (`/`) as home page
- Extract AI Chat component into a floating widget with persistent state management
- Update navigation to include Cloudflare Images link in header and add "powered by" branding
- Implement responsive widget with localStorage for state persistence
- Add dynamic loading placeholders for images
- Use Magic UI components and Tailwind CSS animations for enhanced UX

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**:
- `next: 16.0.3` - Next.js framework with App Router
- `react: 19.2.0` - React library
- `@clerk/nextjs: ^6.35.2` - Authentication (existing)
- `@ai-sdk/react: ^2.0.93` - React hooks for chat UI (existing)
- `ai: ^5.0.93` - Vercel AI SDK core (existing)
- `framer-motion: ^12.23.24` - Animation library (existing)
- `tailwindcss-animate: ^1.0.7` - Tailwind animation utilities (existing)
- Magic UI MCP - UI component library (to be integrated)

**Storage**: 
- Client-side localStorage for widget state and chat history persistence
- No server-side storage changes required

**Testing**: 
- Component tests for widget state management
- Integration tests for navigation and routing
- E2E tests for user flows (widget open/close, navigation persistence)
- Accessibility tests for widget and navigation

**Target Platform**:
- Web browser (modern browsers supporting React 19)
- Responsive design: mobile (320px+), tablet (768px+), desktop (1024px+)
- Vercel deployment platform

**Project Type**: Web application (Next.js App Router)

**Performance Goals**:
- Page load time < 2 seconds (LCP < 2.5s)
- Widget open/close animation < 300ms
- Chat history persistence read/write < 50ms
- Image loading placeholders render immediately

**Constraints**:
- Must maintain 100% feature parity with existing Stock Images and Cloudflare Images functionality
- Widget must not interfere with page content or accessibility
- Chat history must persist across page navigation within browser session
- Must support mobile devices (320px+ screen width)

**Scale/Scope**:
- 3 main pages to reorganize (home, stock images, cloudflare images)
- 1 new widget component (AI chat widget)
- Navigation updates across all pages
- State management for widget persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**:
- [x] Feature uses TypeScript with strict mode (no `any` types)
- [x] Components follow functional React + TypeScript conventions
- [x] File/folder naming uses kebab-case
- [x] All exports include JSDoc/TypeScript doc comments

**Testing Standards**:
- [x] API routes have integration test coverage planned (N/A - no new API routes)
- [x] Custom hooks have unit test coverage planned (widget state hook)
- [x] Utility functions have unit test coverage planned (localStorage utilities)
- [x] Component accessibility testing planned (widget, navigation)

**User Experience Consistency**:
- [x] Feature includes loading states for async operations (image loading placeholders)
- [x] Feature includes error states with user-friendly messages (existing chat error handling maintained)
- [x] Feature includes empty states where applicable (widget empty state)
- [x] Responsive design covers mobile/tablet/desktop breakpoints (widget responsive sizing)
- [x] shadcn/ui components used for UI primitives (existing components maintained)
- [x] Accessibility requirements met (ARIA labels, keyboard navigation for widget)

**Performance Requirements**:
- [x] API route performance targets defined (N/A - no new routes, existing routes maintained)
- [x] Image optimization strategy defined (Next.js Image component with loading placeholders)
- [x] Code splitting strategy identified (automatic with App Router)
- [x] Caching strategy defined (localStorage for widget state, existing API caching maintained)

## Project Structure

### Documentation (this feature)

```text
specs/001-reorganize-pages/
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
├── page.tsx                    # Home page (Stock Images - moved from /images-hub)
├── layout.tsx                   # Root layout (updated navigation, widget provider)
├── images-hub/
│   └── page.tsx                # Redirect to home (or removed if not needed)
├── r2-images/
│   └── page.tsx                # Cloudflare Images page (unchanged functionality)
└── api/
    └── chat/
        └── route.ts            # Chat API (unchanged)

components/
├── ui/                          # shadcn/ui components (existing)
├── images-hub/                  # Stock Images components (existing)
├── r2-images/                   # Cloudflare Images components (existing)
├── chat-widget/                 # NEW: AI Chat Widget components
│   ├── chat-widget.tsx          # Main widget component
│   ├── chat-widget-icon.tsx     # Widget icon/trigger button
│   ├── chat-widget-panel.tsx    # Chat interface panel
│   └── chat-widget-provider.tsx # Context provider for widget state
└── loading-placeholders/       # NEW: Dynamic loading placeholders
    ├── image-skeleton.tsx       # Image loading skeleton
    └── shimmer-effect.tsx       # Shimmer animation component

lib/
├── hooks/
│   ├── use-chat-widget.ts      # NEW: Widget state management hook
│   └── use-chat-history.ts     # NEW: Chat history persistence hook
└── utils/
    ├── storage.ts               # NEW: localStorage utilities
    └── image-utils.ts           # Existing (enhanced with placeholder support)
```

**Structure Decision**: Using existing Next.js App Router structure. New components organized by feature (chat-widget, loading-placeholders). Widget state managed via React Context and localStorage. Navigation updates centralized in root layout.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
