# Implementation Plan: Chat Feature Using Vercel AI Gateway + DeepSeek LLM

**Branch**: `001-vercel-ai-chat` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-vercel-ai-chat/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a real-time chat interface that routes AI requests through Vercel AI Gateway to access DeepSeek LLM services. The feature enables users to engage in multi-turn conversations with streaming responses, comprehensive error handling, and session management. The implementation migrates from direct DeepSeek API calls to Vercel AI Gateway routing, providing enhanced observability, rate limiting, and cost management while maintaining the existing user experience.

**Technical Approach**: Use Vercel AI SDK with model string format (`'deepseek/deepseek-chat'`) to automatically route through Vercel AI Gateway when deployed. Update API route to use Gateway routing, implement timeout handling, message validation, and error recovery mechanisms per specification requirements.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: 
- `ai: ^5.0.93` - Vercel AI SDK core
- `@ai-sdk/react: ^2.0.93` - React hooks for chat UI
- `next: 16.0.3` - Next.js framework with App Router
- `react: 19.2.0` - React library
- `@clerk/nextjs: ^6.35.2` - Authentication (existing)

**Storage**: In-memory session state (client-side React state). No persistent storage required per spec (out of scope: chat history persistence across sessions).

**Testing**: 
- Manual testing for user flows
- Integration testing for API routes (recommended)
- E2E testing for critical paths (recommended)

**Target Platform**: 
- Web browser (modern browsers supporting React 19)
- Vercel Edge Runtime for API routes
- Vercel deployment platform

**Project Type**: Web application (Next.js App Router with API routes)

**Performance Goals**: 
- First response token within 3 seconds (SC-001)
- 95% success rate for chat requests (SC-002)
- Support 20+ message exchanges without degradation (SC-003)
- Error messages displayed within 1 second (SC-004)
- Responsive UI with no blocking behavior (SC-005)

**Constraints**: 
- 60-second timeout for AI responses (FR-018)
- Message length validation against token limits (FR-015)
- Single active session per user (FR-016)
- 30-minute session inactivity timeout (FR-014)
- Edge runtime for API routes (low latency requirement)

**Scale/Scope**: 
- Single-user chat sessions (no multi-user concurrency requirements)
- Session-based conversation history (no cross-session persistence)
- Real-time streaming responses
- Error handling with retry mechanisms

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: ✅ PASS

**Notes**: 
- Constitution file appears to be a template and not yet customized for this project
- No explicit violations detected in proposed implementation
- Implementation follows Next.js and React best practices
- Security practices maintained (server-side API key handling, no client exposure)
- Code structure aligns with existing project patterns

**Re-check After Phase 1**: Will verify design decisions against any project-specific constraints.

## Project Structure

### Documentation (this feature)

```text
specs/001-vercel-ai-chat/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-chat.yaml    # OpenAPI specification for /api/chat endpoint
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   └── chat/
│       └── route.ts          # Updated: Use Vercel AI Gateway routing
├── page.tsx                   # Existing: Chat UI component (minimal changes)
├── layout.tsx                 # Existing: Root layout
└── globals.css                # Existing: Global styles

components/
└── ui/                        # Existing: shadcn/ui components
    ├── button.tsx
    ├── input.tsx
    ├── card.tsx
    └── scroll-area.tsx

lib/
└── utils.ts                   # Existing: Utility functions

.env.local                     # Environment variables (DEEPSEEK_API_KEY)
```

**Structure Decision**: This is a Next.js App Router web application. The feature modifies existing API route (`app/api/chat/route.ts`) and may require minor updates to the chat page component (`app/page.tsx`). No new directories or major structural changes needed. The implementation follows the existing project structure with API routes in `app/api/` and UI components in `components/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. Implementation complexity is justified by:
- Gateway integration provides observability and cost management benefits
- Error handling and timeout mechanisms are required by specification
- Session management is lightweight (client-side state)
- No additional architectural complexity introduced

## Phase 0: Research Complete

✅ All research questions resolved in `research.md`

**Key Findings**:
1. Use model string format `'deepseek/deepseek-chat'` for Gateway routing
2. Gateway automatically handles routing when deployed on Vercel
3. `DEEPSEEK_API_KEY` configured in Vercel dashboard for BYOK
4. Existing frontend pattern (`useChat` hook) remains compatible
5. Error handling and timeout mechanisms defined

## Phase 1: Design & Contracts

### Data Model

See `data-model.md` for entity definitions:
- **ChatMessage**: Message content, role, timestamp, ID
- **ChatSession**: Session metadata, message sequence, activity tracking
- **ErrorState**: Error type, message, recovery options

### API Contracts

See `contracts/api-chat.yaml` for OpenAPI specification:
- **POST /api/chat**: Chat message endpoint
  - Request: `{ messages: UIMessage[] }`
  - Response: Streaming UI message stream
  - Error responses: Structured error format

### Quick Start

See `quickstart.md` for:
- Environment variable setup
- Code changes required
- Testing instructions
- Deployment checklist

## Implementation Tasks (High-Level)

### 1. Update API Route (`app/api/chat/route.ts`)
- Replace direct DeepSeek provider with model string format
- Add `convertToModelMessages()` for message conversion
- Implement timeout handling (60 seconds)
- Add error handling with structured responses
- Add message length validation

### 2. Enhance Error Handling
- Update error responses to include error type and retry information
- Handle timeout errors specifically
- Handle malformed/empty response errors
- Handle rate limit errors with retry-after information

### 3. Update Frontend (if needed)
- Verify `useChat` hook compatibility
- Add error display components (if not present)
- Add retry functionality for errors
- Add session timeout handling

### 4. Environment Configuration
- Document `DEEPSEEK_API_KEY` requirement
- Verify Vercel dashboard configuration
- Update `.env.local` documentation

### 5. Testing & Validation
- Test Gateway routing in development
- Test error scenarios (timeout, rate limits, malformed responses)
- Test session lifecycle (start, timeout, new conversation)
- Validate token limit enforcement
- Verify streaming behavior

## Dependencies & Prerequisites

### Required
- Vercel account with AI Gateway enabled
- DeepSeek API key (for BYOK configuration)
- Next.js 16+ project
- Existing chat UI components

### Optional
- `@ai-sdk/gateway` package (only if custom Gateway configuration needed)

## Risk Assessment

### Low Risk
- ✅ Gateway routing is well-documented
- ✅ Existing code structure compatible
- ✅ No breaking changes to frontend API

### Medium Risk
- ⚠️ Model string format must match Gateway dashboard exactly
- ⚠️ Timeout implementation requires careful AbortController usage
- ⚠️ Error handling must match `useChat` hook expectations

### Mitigation
- Verify model ID in Vercel dashboard before deployment
- Test timeout scenarios thoroughly
- Review error response formats against AI SDK documentation

## Success Criteria Validation

Implementation must meet all success criteria from specification:
- ✅ SC-001: First token within 3 seconds
- ✅ SC-002: 95% success rate
- ✅ SC-003: 20+ message exchanges
- ✅ SC-004: Error messages within 1 second
- ✅ SC-005: Responsive UI
- ✅ SC-006: 90% first-time success

## Next Steps

1. Review `research.md` for technical decisions
2. Review `data-model.md` for entity definitions
3. Review `contracts/api-chat.yaml` for API specification
4. Review `quickstart.md` for implementation guide
5. Proceed to `/speckit.tasks` for detailed task breakdown
