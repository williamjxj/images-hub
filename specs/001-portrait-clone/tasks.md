# Tasks: Portrait.so Clone Page

**Input**: Design documents from `/specs/001-portrait-clone/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: No test tasks included (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure for portrait page components in `app/portrait/components/`
- [x] T002 [P] Create directory for portrait assets in `public/portrait/images/`
- [x] T003 [P] Create optional content constants file structure in `lib/portrait/content.ts`
- [x] T004 Verify all required dependencies are installed (Framer Motion, GSAP, next-themes, shadcn/ui)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create main page route component in `app/portrait/page.tsx` with basic structure
- [x] T006 [P] Add `/portrait` link to main application navigation in `app/layout.tsx`
- [x] T007 [P] Add smooth scroll behavior to `app/globals.css` or page component (Tailwind `scroll-smooth` utility)
- [x] T008 [P] Verify shadcn/ui Accordion component exists in `components/ui/accordion.tsx` (install if missing)
- [x] T009 [P] Verify shadcn/ui Button component exists in `components/ui/button.tsx` (install if missing)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Portrait Landing Page (Priority: P1) 🎯 MVP

**Goal**: A visitor navigates to the Portrait clone page and sees a visually appealing landing page that matches the design and content structure of portrait.so, including hero section, feature highlights, and call-to-action elements.

**Independent Test**: Navigate to `/portrait` route and verify all visual elements, sections, and content match the reference design. All sections should be visible and properly styled.

### Implementation for User Story 1

- [x] T010 [US1] Create page-specific navigation header component in `app/portrait/components/portrait-header.tsx` matching portrait.so design
- [x] T011 [US1] Create hero section component in `app/portrait/components/portrait-hero.tsx` with headline, subheadline, and CTA buttons
- [x] T012 [US1] Create features section component in `app/portrait/components/portrait-features.tsx` with feature cards
- [x] T013 [US1] Create benefits section component in `app/portrait/components/portrait-benefits.tsx` explaining key value propositions
- [x] T014 [US1] Create FAQ section component in `app/portrait/components/portrait-faq.tsx` using shadcn/ui Accordion
- [x] T015 [US1] Create footer component in `app/portrait/components/portrait-footer.tsx` with links, social media, and legal pages
- [x] T016 [US1] Integrate all section components into main page in `app/portrait/page.tsx`
- [x] T017 [US1] Add adapted content text matching image hub/search theme (replace portrait.so text) in component files or `lib/portrait/content.ts`
- [x] T018 [US1] Add images from portrait.so or placeholders in `public/portrait/images/` and reference in components
- [x] T019 [US1] Implement responsive design for all sections (mobile/tablet/desktop breakpoints) using Tailwind utilities
- [x] T020 [US1] Add CTA button placeholder behavior (show "Coming soon" message on click) in `app/portrait/components/portrait-hero.tsx`
- [x] T021 [US1] Implement FAQ accordion with one-at-a-time expansion logic in `app/portrait/components/portrait-faq.tsx`
- [x] T022 [US1] Add semantic HTML structure with proper heading hierarchy in all section components
- [x] T023 [US1] Add ARIA labels and accessibility attributes to all interactive elements

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. The page should display all sections with proper styling and responsive behavior.

---

## Phase 4: User Story 2 - Navigate Page Sections with Smooth Scrolling (Priority: P2)

**Goal**: A user can smoothly navigate between different sections of the landing page using navigation links or scroll behavior, experiencing smooth transitions and proper section highlighting.

**Independent Test**: Click navigation links in header and verify smooth scroll to sections. Scroll through page and verify section visibility and any active state indicators. Test keyboard navigation.

### Implementation for User Story 2

- [x] T024 [US2] Implement smooth scroll navigation links in `app/portrait/components/portrait-header.tsx` (anchor links to sections)
- [x] T025 [US2] Add scroll-based active navigation state detection in `app/portrait/components/portrait-header.tsx` (highlight current section)
- [x] T026 [US2] Implement scroll-triggered fade-in animations for sections using Framer Motion `useInView` in `app/portrait/components/portrait-hero.tsx`
- [x] T027 [US2] Add scroll-triggered fade-in animations to features section in `app/portrait/components/portrait-features.tsx`
- [x] T028 [US2] Add scroll-triggered fade-in animations to benefits section in `app/portrait/components/portrait-benefits.tsx`
- [x] T029 [US2] Add scroll-triggered fade-in animations to FAQ section in `app/portrait/components/portrait-faq.tsx`
- [x] T030 [US2] Add scroll-triggered fade-in animations to footer section in `app/portrait/components/portrait-footer.tsx`
- [x] T031 [US2] Implement keyboard navigation support for section links (Tab, Enter, Space) in `app/portrait/components/portrait-header.tsx`
- [x] T032 [US2] Add visible focus indicators for keyboard navigation in all interactive elements
- [ ] T033 [US2] Configure GSAP ScrollTrigger for advanced scroll animations (optional enhancement) in `app/portrait/page.tsx` or section components

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Navigation should smoothly scroll to sections, and sections should fade in on scroll.

---

## Phase 5: User Story 3 - View Interactive Content Elements (Priority: P3)

**Goal**: A user can interact with various content elements on the page such as animated graphics, interactive demonstrations, or hover effects that enhance the visual presentation and engagement.

**Independent Test**: Hover over interactive elements (buttons, cards) and verify hover effects. View animations on page load and scroll. Verify visual effects work smoothly without performance issues.

### Implementation for User Story 3

- [x] T034 [US3] Add hover effects to CTA buttons using Tailwind utilities and Framer Motion `whileHover` in `components/portrait/portrait-hero.tsx`
- [x] T035 [US3] Add hover effects to feature cards using Tailwind utilities and Framer Motion `whileHover` in `components/portrait/portrait-features.tsx`
- [x] T036 [US3] Integrate Magic UI text animation component (e.g., `animated-gradient-text`) for hero headline in `components/portrait/portrait-hero.tsx`
- [x] T037 [US3] Integrate Magic UI button component (e.g., `shimmer-button` or `ripple-button`) for CTA buttons in `components/portrait/portrait-hero.tsx` (using gradient button with hover effects)
- [x] T038 [US3] Integrate Magic UI background pattern component (e.g., `grid-pattern` or `dot-pattern`) for section backgrounds in relevant components
- [x] T039 [US3] Add Framer Motion page load animations (stagger effects) for feature cards in `components/portrait/portrait-features.tsx`
- [x] T040 [US3] Add Framer Motion page load animations for benefit items in `components/portrait/portrait-benefits.tsx`
- [x] T041 [US3] Add transition animations to FAQ accordion expand/collapse using Framer Motion in `components/portrait/portrait-faq.tsx`
- [x] T042 [US3] Integrate additional Magic UI effects as needed (e.g., `border-beam`, `animated-beam`, `meteors`) for visual interest
- [x] T043 [US3] Optimize animation performance (use CSS transforms, avoid layout properties) across all animated components
- [x] T044 [US3] Add `prefers-reduced-motion` media query support to respect user accessibility preferences

**Checkpoint**: All user stories should now be independently functional. The page should have polished animations, hover effects, and interactive elements matching portrait.so's aesthetic.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T045 [P] Optimize images using Next.js Image component with WebP/AVIF formats in all section components
- [ ] T046 [P] Add image loading fallbacks and error states in components using images
- [ ] T047 [P] Fine-tune animation timings and easing functions for smooth 60fps performance
- [ ] T048 [P] Add loading states for images (skeleton or placeholder) in `app/portrait/components/portrait-hero.tsx` and other image-using components
- [ ] T049 [P] Implement progressive enhancement (graceful degradation when JavaScript is disabled) in all components
- [ ] T050 [P] Run Lighthouse accessibility audit and fix any issues (target 90+ score)
- [ ] T051 [P] Run Lighthouse performance audit and optimize (target LCP < 2.5s)
- [ ] T052 [P] Test responsive design across viewport widths (320px to 2560px) and fix any layout issues
- [ ] T053 [P] Test in target browsers (Chrome, Firefox, Safari, Edge - last 2 versions) and fix compatibility issues
- [ ] T054 [P] Add JSDoc/TypeScript doc comments to all exported components and functions
- [ ] T055 [P] Verify all interactive elements are keyboard accessible and have proper focus indicators
- [ ] T056 [P] Verify color contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] T057 [P] Code cleanup and refactoring (extract common patterns, remove unused code)
- [ ] T058 [P] Update main application navigation styling if needed to accommodate new `/portrait` link
- [ ] T059 [P] Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 components existing but adds independent functionality (smooth scrolling, animations)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 components existing but adds independent functionality (hover effects, Magic UI)

### Within Each User Story

- Create components before integrating them
- Implement basic structure before adding animations
- Add content before styling
- Core implementation before polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different section components within US1 marked [P] can run in parallel (T011-T015)
- Different animation tasks within US2 marked [P] can run in parallel (T026-T030)
- Different Magic UI integration tasks within US3 marked [P] can run in parallel (T036-T042)
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all section components for User Story 1 together:
Task: "Create hero section component in app/portrait/components/portrait-hero.tsx"
Task: "Create features section component in app/portrait/components/portrait-features.tsx"
Task: "Create benefits section component in app/portrait/components/portrait-benefits.tsx"
Task: "Create FAQ section component in app/portrait/components/portrait-faq.tsx"
Task: "Create footer component in app/portrait/components/portrait-footer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently - navigate to `/portrait`, verify all sections display, test responsive design, verify CTA buttons show "Coming soon"
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Enhanced navigation and animations)
4. Add User Story 3 → Test independently → Deploy/Demo (Polished interactions)
5. Add Polish phase → Final optimization → Production ready
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (all sections)
   - Developer B: User Story 2 (scroll animations) - can start after US1 components exist
   - Developer C: User Story 3 (Magic UI, hover effects) - can start after US1 components exist
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Magic UI components should be fetched via MCP tools when needed
- All content should be adapted to match image hub/search theme (not exact portrait.so text)
- Images can be used directly from portrait.so initially, then replaced with placeholders or optimized versions later

---

## Task Summary

**Total Tasks**: 59

**Task Count by Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (User Story 1): 14 tasks
- Phase 4 (User Story 2): 10 tasks
- Phase 5 (User Story 3): 11 tasks
- Phase 6 (Polish): 15 tasks

**Task Count by User Story**:
- User Story 1 (P1): 14 tasks
- User Story 2 (P2): 10 tasks
- User Story 3 (P3): 11 tasks

**Parallel Opportunities Identified**: 
- Setup: 2 parallel tasks
- Foundational: 4 parallel tasks
- User Story 1: 5 section components can be created in parallel
- User Story 2: 5 scroll animation tasks can be done in parallel
- User Story 3: 7 Magic UI integration tasks can be done in parallel
- Polish: 15 tasks can all run in parallel

**Independent Test Criteria**:
- **User Story 1**: Navigate to `/portrait`, verify all sections display with proper styling and responsive behavior
- **User Story 2**: Click navigation links, verify smooth scroll and section fade-in animations, test keyboard navigation
- **User Story 3**: Hover over elements, verify hover effects and animations work smoothly

**Suggested MVP Scope**: User Story 1 only (Phase 1 + Phase 2 + Phase 3) - delivers complete landing page with all sections, responsive design, and basic interactions.

