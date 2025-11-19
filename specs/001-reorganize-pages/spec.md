# Feature Specification: Page Reorganization

**Feature Branch**: `001-reorganize-pages`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "adjust pages: make 'Stock Images as home page', make 'AI Powered Chat' page as a small widget on the right bottom as a 'AI assistant', mkae 'Cloudflare Images' page as a custom demo, a link on 'Stock Images' page"

## Clarifications

### Session 2025-01-27

- Q: What should be the default size/dimensions of the AI chat widget when opened? → A: Widget is hidden by default, showing only a prompt icon (using angel.webp from public folder). When clicked, opens a responsive widget with reasonable defaults (e.g., 400px width on desktop, full-width on mobile) that accommodates chat functionality.
- Q: Should chat message history persist when users navigate between pages or close/reopen the widget? → A: Chat history persists across navigation and widget close/reopen within the same browser session.
- Q: Where should the Cloudflare Images link be placed on the Stock Images page? → A: In the page header/navigation area.
- Q: What should happen when users access the old AI chat route (the root URL that previously showed the chat page)? → A: Redirect to home page (Stock Images).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Stock Images as Home Page (Priority: P1)

When users visit the application root URL, they are presented with the Stock Images search and gallery interface as the primary landing page. This makes stock image search the main feature of the application, providing immediate access to image discovery functionality.

**Why this priority**: This establishes the primary user journey and main value proposition of the application. Users should immediately see the core functionality when they arrive.

**Independent Test**: Can be fully tested by navigating to the root URL and verifying that the Stock Images interface is displayed with all its search and gallery capabilities intact.

**Acceptance Scenarios**:

1. **Given** a user visits the application root URL, **When** the page loads, **Then** the Stock Images search and gallery interface is displayed as the main content
2. **Given** a user is authenticated, **When** they navigate to the root URL, **Then** they see the Stock Images interface without being redirected
3. **Given** a user is not authenticated, **When** they visit the root URL, **Then** they are redirected to sign-in (maintaining existing authentication flow)
4. **Given** the Stock Images page is set as home, **When** users access it, **Then** all existing Stock Images functionality (search, filters, gallery) works identically to before

---

### User Story 2 - AI Chat as Floating Widget (Priority: P2)

Users can access AI chat functionality through a small, floating widget positioned in the bottom-right corner of any page. The widget can be opened to reveal a compact chat interface, allowing users to interact with the AI assistant without leaving their current context.

**Why this priority**: This provides secondary functionality (AI chat) in a non-intrusive way, allowing users to access it when needed without disrupting their primary workflow of browsing images.

**Independent Test**: Can be fully tested by verifying the widget appears on pages, can be opened/closed, and maintains full chat functionality in the compact interface.

**Acceptance Scenarios**:

1. **Given** a user is on any page, **When** the page loads, **Then** a prompt icon (angel.webp) appears in the bottom-right corner as the AI assistant widget trigger
2. **Given** the AI widget is closed (showing only the icon), **When** a user clicks the icon, **Then** a responsive chat interface opens in a floating panel (400px width on desktop, full-width on mobile)
3. **Given** the AI widget is open, **When** a user clicks to close it, **Then** the chat interface closes and only the prompt icon remains visible
4. **Given** the chat widget is open, **When** a user interacts with it, **Then** all existing chat functionality (sending messages, receiving responses, error handling) works as before
5. **Given** the chat widget is open, **When** a user navigates to a different page, **Then** the widget state (open/closed) and chat message history persist across page navigation
6. **Given** a user has chat messages in the widget, **When** they close and reopen the widget, **Then** all previous chat messages are still visible within the same browser session
7. **Given** the chat widget is open, **When** a user scrolls the page, **Then** the widget remains fixed in the bottom-right corner position

---

### User Story 3 - Cloudflare Images as Link on Stock Images Page (Priority: P3)

The Cloudflare Images functionality is accessible through a link or button on the Stock Images page, rather than being a separate top-level page. This positions Cloudflare Images as a secondary feature or demo accessible from the main Stock Images interface.

**Why this priority**: This reorganizes navigation structure and makes Cloudflare Images a discoverable but secondary feature, reducing navigation complexity while maintaining access to the functionality.

**Independent Test**: Can be fully tested by verifying the link appears on the Stock Images page and successfully navigates to Cloudflare Images functionality.

**Acceptance Scenarios**:

1. **Given** a user is on the Stock Images page, **When** they view the page, **Then** a link or button to access Cloudflare Images is visible in the page header/navigation area
2. **Given** a user clicks the Cloudflare Images link, **When** they navigate, **Then** they are taken to the Cloudflare Images interface with all existing functionality intact
3. **Given** Cloudflare Images is accessed via link, **When** users interact with it, **Then** all existing Cloudflare Images features (browsing, filtering, viewing) work as before
4. **Given** Cloudflare Images is no longer a top-level navigation item, **When** users check the main navigation, **Then** it does not appear as a separate menu item

---

### Edge Cases

- What happens when a user has an active chat session and navigates between pages? The widget should maintain both widget state (open/closed) and chat message history.
- What happens when a user closes the widget and reopens it? Chat message history should persist within the same browser session.
- How does the AI widget behave on mobile devices with limited screen space? The widget should be responsive and appropriately sized.
- What happens if a user tries to access the old AI chat route directly? The system should redirect to the home page (Stock Images), where users can access chat via the widget.
- How does the widget handle multiple browser tabs? Each tab should have independent widget state.
- What happens when the Cloudflare Images link is clicked but the user is not authenticated? They should be redirected to sign-in.
- How does the widget appear when users are on pages with different layouts or content heights? It should remain consistently positioned.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the Stock Images search and gallery interface when users visit the root URL
- **FR-002**: System MUST maintain all existing Stock Images functionality (search, filters, gallery, authentication) when it becomes the home page
- **FR-003**: System MUST display a floating AI assistant prompt icon (using angel.webp) in the bottom-right corner on all pages when the widget is closed
- **FR-004**: System MUST allow users to open and close the AI chat widget interface by clicking the prompt icon
- **FR-013**: System MUST display the widget in a responsive size when opened (approximately 400px width on desktop, full-width on mobile devices)
- **FR-005**: System MUST maintain all existing AI chat functionality (message sending, streaming responses, error handling, session management) within the widget interface
- **FR-006**: System MUST keep the AI widget fixed in position when users scroll pages
- **FR-007**: System MUST persist widget open/closed state and chat message history across page navigation within the same browser session
- **FR-014**: System MUST persist chat message history when users close and reopen the widget within the same browser session
- **FR-008**: System MUST display a link or button to access Cloudflare Images in the page header/navigation area on the Stock Images page
- **FR-009**: System MUST maintain all existing Cloudflare Images functionality when accessed via the link
- **FR-010**: System MUST remove Cloudflare Images from top-level navigation menu items
- **FR-011**: System MUST handle authentication requirements consistently (redirect to sign-in when needed) for all reorganized pages
- **FR-015**: System MUST redirect any attempts to access the old AI chat route to the home page (Stock Images)
- **FR-012**: System MUST ensure the AI widget is responsive and appropriately sized on mobile devices

### Key Entities *(include if feature involves data)*

- **Page Route**: Represents the URL path and associated page component. Key attributes: route path, page component, authentication requirement.
- **Navigation Item**: Represents a menu or link item in the application navigation. Key attributes: label, target route, visibility condition.
- **Widget State**: Represents the open/closed state of the AI chat widget. Key attributes: isOpen, persists across navigation.
- **Chat History**: Represents the conversation messages within the AI chat widget. Key attributes: messages array, persists across navigation and widget close/reopen within browser session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users visiting the root URL see the Stock Images interface within 2 seconds of page load
- **SC-002**: All existing Stock Images functionality (search, filter, gallery) works identically to before reorganization, with 100% feature parity
- **SC-003**: AI chat widget is accessible and functional on all pages, with users able to open it and send messages successfully
- **SC-004**: AI chat widget maintains its position during page scroll without visual glitches or layout shifts
- **SC-005**: Users can successfully navigate to Cloudflare Images via the link on Stock Images page within 2 clicks
- **SC-006**: All existing Cloudflare Images functionality works identically when accessed via link, with 100% feature parity
- **SC-007**: Navigation menu no longer includes Cloudflare Images as a top-level item
- **SC-008**: Widget state and chat message history persist correctly across at least 5 consecutive page navigations without resetting
- **SC-010**: Chat message history persists correctly when users close and reopen the widget within the same browser session
- **SC-009**: AI widget interface is usable on mobile devices (screen width 320px and above) without requiring horizontal scrolling

## Assumptions

- The Stock Images page component can be reused as the home page without modification to its core functionality
- The AI chat component can be adapted to work within a floating widget interface while maintaining all existing features
- Cloudflare Images functionality remains unchanged when accessed via link rather than direct navigation
- Authentication flows remain consistent with existing Clerk-based authentication
- The widget is hidden by default, showing only a prompt icon (angel.webp) that users can click to open the chat interface
- When opened, the widget uses responsive sizing (approximately 400px width on desktop, full-width on mobile) that accommodates chat functionality without overwhelming the page
- Widget positioning (bottom-right) is appropriate for all page layouts in the application
- Users understand that the icon provides AI chat functionality based on its appearance and positioning
