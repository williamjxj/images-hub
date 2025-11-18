# Implementation Tasks: Chat Feature Using Vercel AI Gateway + DeepSeek LLM

**Branch**: `001-vercel-ai-chat` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Summary

This document breaks down the implementation into executable tasks organized by user story priority. Each user story phase is independently testable and can be developed incrementally.

**Total Tasks**: 28  
**User Story Breakdown**: US1 (8 tasks), US2 (7 tasks), US3 (6 tasks), Setup (3 tasks), Foundational (2 tasks), Polish (2 tasks)

## Implementation Strategy

**MVP Scope**: User Story 1 (P1) - Send and Receive Chat Messages  
**Incremental Delivery**: Each user story phase delivers independently testable functionality  
**Parallel Opportunities**: Tasks marked with [P] can be worked on in parallel when dependencies allow

## Dependencies & Story Completion Order

```
Setup (Phase 1)
  ↓
Foundational (Phase 2) - API Route Migration
  ↓
User Story 1 (Phase 3) - Core Chat Functionality [MVP]
  ↓
User Story 2 (Phase 4) - Error Handling (depends on US1)
  ↓
User Story 3 (Phase 5) - Conversation Context (depends on US1)
  ↓
Polish (Phase 6) - Cross-cutting concerns
```

**Note**: User Stories 2 and 3 can be developed in parallel after User Story 1 is complete, as they enhance different aspects of the core functionality.

## Phase 1: Setup

**Goal**: Configure environment and verify prerequisites for Vercel AI Gateway integration.

### Independent Test Criteria

- Environment variables configured correctly
- Model availability verified in Vercel dashboard
- Project dependencies are up to date

- [x] T001 Configure DEEPSEEK_API_KEY in .env.local file at project root
- [ ] T002 Verify deepseek/deepseek-chat model availability in Vercel Dashboard → AI Gateway → Model List
- [x] T003 Document environment variable setup requirements in README.md or .env.example

## Phase 2: Foundational

**Goal**: Migrate API route from direct DeepSeek provider to Vercel AI Gateway routing. This is a blocking prerequisite for all user stories.

### Independent Test Criteria

- API route uses model string format for Gateway routing
- Basic chat functionality works through Gateway
- No breaking changes to existing frontend

- [x] T004 Update app/api/chat/route.ts to replace deepseek provider import with model string format 'deepseek/deepseek-chat'
- [x] T005 Update app/api/chat/route.ts to use convertToModelMessages() for message conversion and toUIMessageStreamResponse() for response format

## Phase 3: User Story 1 - Send and Receive Chat Messages (Priority: P1)

**Goal**: Users can engage in real-time conversations with streaming responses. This is the core MVP functionality.

**Independent Test**: Can be fully tested by sending a message and verifying that a response is received and displayed in the chat interface.

**Acceptance Scenarios**:

1. User sends message → message appears in chat history → response streams in real-time
2. Multiple messages → all displayed in chronological order with clear distinction
3. Processing state → loading indicator shown
4. Streaming response → text appears incrementally

- [x] T006 [US1] Ensure app/api/chat/route.ts uses streamText() with model string 'deepseek/deepseek-chat' for Gateway routing
- [x] T007 [US1] Verify app/page.tsx uses useChat hook with DefaultChatTransport pointing to '/api/chat'
- [x] T008 [US1] Ensure app/page.tsx displays messages in chronological order with user/assistant distinction
- [x] T009 [US1] Verify app/page.tsx shows loading indicator when status is 'streaming' or 'submitted'
- [x] T010 [US1] Ensure app/page.tsx renders streaming response text incrementally as it arrives
- [x] T011 [US1] Verify app/page.tsx prevents sending new messages while isLoading is true (FR-008)
- [x] T012 [US1] Ensure app/api/chat/route.ts validates messages array is not empty before processing (FR-012)
- [ ] T013 [US1] Test complete message send/receive flow: send message → see in UI → receive streaming response → see response in UI

## Phase 4: User Story 2 - Handle Errors Gracefully (Priority: P2)

**Goal**: Users receive clear, actionable error messages when system errors occur.

**Independent Test**: Can be fully tested by simulating error conditions and verifying appropriate error messages are displayed.

**Acceptance Scenarios**:

1. Service unavailable → clear error message with retry suggestion
2. Rate limit exceeded → message explaining limit and retry timing
3. Error retry → message successfully processed after retry
4. Network error → connection issue message
5. Token limit exceeded → rejection before sending with clear message
6. Malformed response → user-friendly error with retry option
7. Timeout exceeded → timeout error with retry option

- [x] T014 [US2] Implement timeout handling in app/api/chat/route.ts using AbortController with 60-second timeout (FR-018)
- [x] T015 [US2] Add timeout error response in app/api/chat/route.ts returning structured error with type 'timeout' and retryable: true
- [x] T016 [US2] Implement message length validation in app/api/chat/route.ts checking estimated tokens (length/4) against 8000 limit (FR-015)
- [x] T017 [US2] Add validation error response in app/api/chat/route.ts for token limit exceeded with type 'validation' and clear message
- [x] T018 [US2] Implement rate limit error handling in app/api/chat/route.ts detecting rate limit errors and returning structured error with retryAfter
- [x] T019 [US2] Add malformed/empty response detection in app/api/chat/route.ts and return error with type 'malformed' and retryable: true (FR-017) - Note: Streaming format handles this via useChat hook error handling
- [x] T020 [US2] Update app/page.tsx to display error messages from useChat hook error state with retry functionality

## Phase 5: User Story 3 - Maintain Conversation Context (Priority: P2)

**Goal**: Users can have multi-turn conversations where the AI remembers previous messages.

**Independent Test**: Can be fully tested by sending a series of related messages and verifying AI responses reference earlier messages.

**Acceptance Scenarios**:

1. Follow-up question → AI responds with context from earlier exchange
2. Ongoing conversation → AI considers all previous messages
3. New conversation → AI responds without referencing previous conversations

- [x] T021 [US3] Ensure app/api/chat/route.ts passes entire messages array to streamText() to maintain conversation history (FR-005, FR-009)
- [x] T022 [US3] Verify app/page.tsx maintains messages array in useChat hook state preserving all conversation history
- [x] T023 [US3] Implement session start logic in app/page.tsx detecting first message and initializing session (FR-013)
- [x] T024 [US3] Implement new conversation handler in app/page.tsx clearing messages array when user starts new chat (FR-016)
- [x] T025 [US3] Implement session timeout in app/page.tsx using useEffect and setTimeout for 30-minute inactivity timeout (FR-014)
- [ ] T026 [US3] Test multi-turn conversation: send question → receive answer → send follow-up → verify AI references previous context

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Final refinements, error handling improvements, and user experience enhancements.

- [x] T027 Update app/page.tsx header text to indicate "Powered by Vercel AI Gateway" instead of "Powered by Vercel AI SDK"
- [x] T028 Add client-side message length validation in app/page.tsx handleSubmit function to prevent sending messages exceeding token limit before API call

## Parallel Execution Examples

### After Phase 2 (Foundational) Complete:

**User Story 1 Tasks** (can work on in parallel):

- T006, T007, T008 can be worked on simultaneously (different aspects of frontend)
- T009, T010 can be done in parallel (both UI rendering concerns)

**User Story 2 Tasks** (can work on in parallel after US1):

- T014, T015 (timeout handling) can be done independently
- T016, T017 (validation) can be done independently
- T018, T019 (error detection) can be done independently

**User Story 3 Tasks** (can work on in parallel after US1):

- T021, T022 (conversation history) can be done together
- T023, T024, T025 (session management) can be done together

### After Phase 3 (User Story 1) Complete:

**User Stories 2 and 3** can be developed in parallel as they enhance different aspects:

- User Story 2 focuses on error handling (backend + frontend error display)
- User Story 3 focuses on session and context management (frontend state + backend message passing)

## MVP Scope

**Minimum Viable Product**: Complete Phase 1, Phase 2, and Phase 3 (User Story 1)

This delivers:

- ✅ Core chat functionality with streaming responses
- ✅ Vercel AI Gateway routing
- ✅ Basic message display and loading states
- ✅ Input validation

**Post-MVP Enhancements**:

- Phase 4: Comprehensive error handling
- Phase 5: Session management and conversation context
- Phase 6: Polish and refinements

## Validation Checklist

Before considering implementation complete, verify:

- [ ] All tasks in Phase 1-3 completed (MVP)
- [ ] Chat messages send and receive successfully
- [ ] Streaming responses work correctly
- [ ] Loading indicators display properly
- [ ] Messages display in chronological order
- [ ] User/assistant messages are visually distinct
- [ ] API route uses Vercel AI Gateway routing
- [ ] Environment variables configured correctly

## Notes

- **File Paths**: All file paths are relative to project root
- **Dependencies**: Tasks must be completed in phase order
- **Testing**: Manual testing recommended after each phase
- **Error Handling**: User Story 2 enhances error handling but basic error handling exists in current code
- **Session Management**: User Story 3 adds session lifecycle but basic message history already works via useChat hook
