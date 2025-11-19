<!--
  Sync Impact Report:
  
  Version Change: N/A → 1.0.0 (Initial constitution)
  
  Modified Principles: N/A (new constitution)
  
  Added Sections:
  - Core Principles (Code Quality, Testing Standards, UX Consistency, Performance)
  - Code Quality Standards
  - Testing Standards
  - User Experience Consistency
  - Performance Requirements
  - Development Workflow
  - Governance
  
  Templates Requiring Updates:
  - ✅ plan-template.md (Constitution Check section references constitution)
  - ✅ spec-template.md (No direct references, but principles apply)
  - ✅ tasks-template.md (No direct references, but principles apply)
  
  Follow-up TODOs: None
-->

# AI Chatbox Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

All code MUST adhere to strict quality standards to ensure maintainability, readability, and long-term project health.

**Rules**:

- TypeScript strict mode MUST be enabled; all code MUST be fully typed with no `any` types except where explicitly justified
- ESLint rules MUST pass with zero warnings; Prettier formatting MUST be enforced
- Components MUST be functional React components using TypeScript; class components are prohibited
- All exported functions and components MUST include JSDoc or TypeScript doc comments
- File and folder names MUST use kebab-case convention
- Code MUST follow Next.js App Router conventions: server components by default, client components only when necessary
- Environment variables MUST never be exposed in frontend code; use Next.js `process.env` conventions
- All async operations MUST use async/await; promise chains are prohibited

**Rationale**: Consistent code quality reduces bugs, improves developer velocity, and ensures the codebase remains
maintainable as it scales.

### II. Testing Standards (NON-NEGOTIABLE)

Comprehensive testing is mandatory for all features to ensure reliability and prevent regressions.

**Rules**:

- All API routes MUST have integration tests covering success and error scenarios
- All custom hooks MUST have unit tests covering state changes and side effects
- All utility functions MUST have unit tests with edge case coverage
- Component tests MUST verify accessibility (ARIA attributes, keyboard navigation)
- Tests MUST be written before or alongside implementation (TDD preferred)
- Test coverage MUST be maintained above 80% for critical paths (API routes, hooks, utilities)
- Integration tests MUST verify authentication requirements where applicable
- Error handling paths MUST be tested explicitly

**Rationale**: Testing prevents regressions, documents expected behavior, and enables confident refactoring.

### III. User Experience Consistency

All user-facing features MUST provide a consistent, accessible, and intuitive experience.

**Rules**:

- All interactive elements MUST be keyboard accessible and include proper ARIA labels
- Loading states MUST be provided for all async operations (skeletons, spinners, progress indicators)
- Error states MUST display user-friendly messages with actionable guidance
- Empty states MUST provide clear context and next steps
- All forms MUST include validation with clear error messages
- Responsive design MUST work across mobile (320px+), tablet (768px+), and desktop (1024px+) breakpoints
- Color contrast MUST meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- shadcn/ui components MUST be used for UI primitives; custom components only when shadcn/ui lacks required functionality
- Tailwind CSS utility classes MUST be preferred; custom CSS is prohibited unless explicitly required

**Rationale**: Consistent UX reduces cognitive load, improves accessibility, and creates a professional user experience.

### IV. Performance Requirements

All features MUST meet performance benchmarks to ensure fast, responsive user experience.

**Rules**:

- Page load times MUST be under 2 seconds for initial render (LCP < 2.5s)
- API route response times MUST be under 500ms for p95 latency
- Images MUST be optimized: use Next.js Image component with proper sizing and lazy loading
- Client-side JavaScript bundles MUST be code-split; route-based splitting is automatic with App Router
- Server components MUST be used by default to minimize client-side JavaScript
- Infinite scroll implementations MUST use intersection observer with proper debouncing
- Database queries MUST be optimized with proper indexing and pagination
- Static assets MUST be served from CDN (Vercel Edge Network)

**Rationale**: Performance directly impacts user satisfaction, SEO rankings, and conversion rates.

## Code Quality Standards

### TypeScript Standards

- Strict mode enabled: `strict: true` in tsconfig.json
- No implicit any: all types must be explicit
- Path aliases: use `@/*` for imports from project root
- Type exports: prefer `export type` for type-only exports

### Component Standards

- Server components by default; add `'use client'` only when necessary
- Props interfaces MUST be defined with descriptive names (e.g., `ImageGalleryProps`)
- Default exports for page components; named exports for reusable components
- Component composition over prop drilling

### File Organization

- Feature-based structure: group related components, hooks, and utilities together
- Shared utilities in `/lib/utils.ts` or `/lib/utils/[category].ts`
- UI components in `/components/ui/` (shadcn/ui)
- Feature components in `/components/[feature-name]/`
- API routes in `/app/api/[route]/route.ts`

## Testing Standards

### Test Structure

- Unit tests: `__tests__/` directories adjacent to source files or `tests/unit/`
- Integration tests: `tests/integration/` for API routes and multi-component flows
- Test files: `*.test.ts` or `*.test.tsx` naming convention

### Test Requirements

- API routes: test authentication, request validation, error handling, success responses
- Hooks: test state updates, side effects, cleanup, error scenarios
- Components: test rendering, user interactions, accessibility, error boundaries
- Utilities: test edge cases, null/undefined handling, type safety

### Testing Tools

- Framework: Jest + React Testing Library (or equivalent)
- API testing: Supertest or fetch mocks
- Coverage: Minimum 80% for critical paths, 60% overall

## User Experience Consistency

### Accessibility Requirements

- Semantic HTML: use proper heading hierarchy (h1 → h2 → h3)
- ARIA labels: all interactive elements must have accessible names
- Keyboard navigation: all features must be fully keyboard accessible
- Focus management: visible focus indicators, logical tab order
- Screen reader support: test with screen readers for critical flows

### Design System

- shadcn/ui components: use as foundation for all UI primitives
- Tailwind CSS: utility-first styling, no custom CSS files
- Color system: use Tailwind color palette, maintain consistency
- Typography: use consistent font sizes and weights
- Spacing: use Tailwind spacing scale (4px base unit)

### Responsive Design

- Mobile-first approach: design for mobile, enhance for larger screens
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Touch targets: minimum 44x44px for interactive elements
- Content width: max-width constraints for readability on large screens

## Performance Requirements

### Core Web Vitals

- Largest Contentful Paint (LCP): < 2.5 seconds
- First Input Delay (FID): < 100 milliseconds
- Cumulative Layout Shift (CLS): < 0.1

### API Performance

- Response time p95: < 500ms
- Response time p99: < 1000ms
- Error rate: < 0.1%
- Rate limiting: implement to prevent abuse

### Optimization Strategies

- Image optimization: Next.js Image component with WebP/AVIF formats
- Code splitting: automatic with App Router, manual for large dependencies
- Caching: use Next.js caching strategies (static, dynamic, revalidate)
- Database: optimize queries, use connection pooling, implement pagination
- CDN: leverage Vercel Edge Network for static assets

## Development Workflow

### Pre-Commit Requirements

- Linting: `pnpm lint` must pass with zero errors
- Formatting: `pnpm format:check` must pass
- Type checking: `tsc --noEmit` must pass
- Tests: relevant tests must pass for changed code

### Code Review Standards

- All PRs MUST be reviewed before merge
- Reviewers MUST verify constitution compliance
- Reviewers MUST check for accessibility, performance, and testing coverage
- Complex changes MUST include architecture decision records (ADRs) if applicable

### Deployment Standards

- All deployments MUST pass CI/CD checks
- Production deployments MUST be tested in preview environments first
- Environment variables MUST be verified before deployment
- Performance metrics MUST be monitored post-deployment

## Governance

This constitution supersedes all other development practices and guidelines. All code contributions MUST comply
with these principles.

**Amendment Process**:

- Proposed amendments MUST be documented with rationale
- Amendments require review and approval
- Version MUST be incremented per semantic versioning:
  - MAJOR: Backward incompatible principle changes
  - MINOR: New principles or significant expansions
  - PATCH: Clarifications, wording improvements, non-semantic refinements
- Constitution changes MUST be propagated to dependent templates and documentation

**Compliance**:

- All PRs/reviews MUST verify constitution compliance
- Violations MUST be addressed before merge
- Complexity exceptions MUST be documented with justification
- Regular compliance audits SHOULD be conducted

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
