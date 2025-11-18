# Research: Chat Feature Using Vercel AI Gateway + DeepSeek LLM

**Date**: 2025-01-27  
**Feature**: Chat Feature Using Vercel AI Gateway + DeepSeek LLM  
**Branch**: `001-vercel-ai-chat`

## Research Questions & Findings

### 1. Vercel AI Gateway Integration Pattern

**Question**: How to route requests through Vercel AI Gateway instead of calling DeepSeek directly?

**Decision**: Use model string format `'deepseek/deepseek-chat'` directly in `streamText()` calls. When deployed on Vercel, the AI SDK automatically routes through Vercel AI Gateway.

**Rationale**:

- Vercel AI Gateway is the default provider when models are specified as strings (format: `provider/model-name`)
- No need for explicit gateway provider import when deployed on Vercel
- Simplifies code by removing direct provider configuration
- Gateway handles authentication, rate limiting, and observability automatically

**Alternatives Considered**:

- Using `@ai-sdk/gateway` package with explicit `gateway()` provider - More verbose, only needed for custom base URLs or non-Vercel deployments
- Using `@ai-sdk/deepseek` directly - Current approach, but bypasses Gateway benefits (observability, rate limiting, cost tracking)
- Using `@ai-sdk/deepinfra` - Alternative provider, but Gateway provides unified access

**Sources**:

- Vercel AI Gateway Models & Providers documentation
- docs/gemini.md (expert architectural report)
- Current implementation analysis

---

### 2. Model String Format

**Question**: What is the correct model identifier format for DeepSeek via Vercel AI Gateway?

**Decision**: Use `'deepseek/deepseek-chat'` as the model string. Verify exact model ID in Vercel AI Gateway Dashboard Model List.

**Rationale**:

- Format follows `provider/model-name` convention
- Gateway dashboard provides authoritative model list
- `deepseek-chat` is the standard chat model identifier

**Alternatives Considered**:

- `deepseek/deepseek-v3.1` - Specific version, may not be available via Gateway
- `deepseek-ai/DeepSeek-V3.1` - DeepInfra format, not Gateway format
- Direct API calls - Bypasses Gateway benefits

**Sources**:

- docs/gemini.md (mentions verifying model ID in Gateway dashboard)
- docs/chatgpt.md (mentions model version selection)
- Vercel AI Gateway documentation

---

### 3. Environment Variables Configuration

**Question**: What environment variables are needed for Vercel AI Gateway + DeepSeek?

**Decision**:

- `DEEPSEEK_API_KEY` - Required for BYOK (Bring Your Own Key) model
- `VERCEL_AI_GATEWAY_API_KEY` - Optional, only needed for non-Vercel deployments or custom configurations

**Rationale**:

- When deployed on Vercel, Gateway uses internal OIDC tokens for authentication
- `DEEPSEEK_API_KEY` must be configured in Vercel dashboard for BYOK access
- Gateway manages secure injection of API keys server-side
- Keys should NEVER be exposed to client-side code

**Alternatives Considered**:

- Using system credentials instead of BYOK - Less control over costs, but simpler setup
- Storing keys in code - Security risk, violates best practices

**Sources**:

- docs/gemini.md (security section on secret management)
- docs/chatgpt.md (environment variables section)
- Vercel AI Gateway documentation

---

### 4. API Route Implementation Pattern

**Question**: How should the API route be structured to use Vercel AI Gateway?

**Decision**: Use `streamText()` with model string, `convertToModelMessages()` for message conversion, and `toUIMessageStreamResponse()` for response format.

**Rationale**:

- `streamText()` provides real-time token-by-token streaming
- `convertToModelMessages()` ensures proper message format conversion from UI format
- `toUIMessageStreamResponse()` returns format compatible with `useChat` hook
- Edge runtime recommended for lower latency

**Code Pattern**:

```typescript
import { streamText, convertToModelMessages } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: "deepseek/deepseek-chat",
    messages: convertToModelMessages(messages),
    temperature: 0.7,
    maxOutputTokens: 2000,
  });

  return result.toUIMessageStreamResponse();
}
```

**Alternatives Considered**:

- `toDataStreamResponse()` - Different format, requires custom client handling
- `toTextStreamResponse()` - Text-only, loses structured message format
- Non-streaming `generateText()` - Higher perceived latency, worse UX

**Sources**:

- docs/gemini.md (backend streaming implementation)
- docs/grok.md (API route example)
- Current implementation analysis

---

### 5. Error Handling & Timeout Configuration

**Question**: How to implement error handling and timeout requirements from spec?

**Decision**:

- Implement try-catch in API route with proper error responses
- Use `AbortController` for timeout handling (60 seconds per spec)
- Return structured error responses that `useChat` hook can handle
- Validate message length before sending (client-side and server-side)

**Rationale**:

- Spec requires 60-second timeout (FR-018)
- Spec requires error messages with retry options (FR-007, FR-017)
- Client-side validation prevents unnecessary API calls
- Server-side validation provides security layer

**Implementation Notes**:

- Timeout can be implemented using `AbortSignal` with `setTimeout`
- Error responses should include error type and user-friendly messages
- Rate limit errors should include retry-after information

**Sources**:

- Feature specification (FR-007, FR-015, FR-017, FR-018)
- docs/gemini.md (error handling considerations)
- Vercel AI SDK documentation

---

### 6. Frontend Integration Pattern

**Question**: How should the frontend integrate with the updated API route?

**Decision**: Continue using `useChat` hook from `@ai-sdk/react` with `DefaultChatTransport` pointing to `/api/chat`.

**Rationale**:

- Current implementation already uses correct pattern
- `useChat` hook handles streaming, state management, and error states
- `DefaultChatTransport` simplifies API communication
- No changes needed to frontend integration pattern

**Alternatives Considered**:

- Custom fetch implementation - More code, less maintainable
- Different transport mechanism - Unnecessary complexity

**Sources**:

- Current implementation (`app/page.tsx`)
- docs/gemini.md (frontend implementation section)
- Vercel AI SDK React documentation

---

### 7. Provider Options & Fallback Strategy

**Question**: Should we configure provider fallbacks or routing options?

**Decision**: Optional enhancement - Can use `providerOptions.gateway.order` to specify provider priority and fallbacks.

**Rationale**:

- Gateway supports automatic fallback to other providers
- Can specify order: `['deepseek', 'anthropic']` for failover
- Improves reliability but adds complexity
- Not required for MVP, can be added later

**Implementation Example**:

```typescript
providerOptions: {
  gateway: {
    order: ['deepseek', 'anthropic'], // Try DeepSeek first, fallback to Anthropic
  },
}
```

**Alternatives Considered**:

- No fallback configuration - Simpler, relies on Gateway defaults
- Multiple model fallbacks - More complex, may not be needed

**Sources**:

- Vercel AI Gateway Provider Options documentation
- docs/gemini.md (optimization and fallback strategy)

---

### 8. Token Limit Validation

**Question**: How to validate message length against token limits before sending?

**Decision**: Use approximate token estimation (1 token ≈ 4 characters) for client-side validation, with server-side validation as backup.

**Rationale**:

- Spec requires validation before sending (FR-015)
- Client-side validation provides immediate feedback
- Server-side validation ensures security
- Exact token counting requires API call, so approximation is practical

**Implementation Notes**:

- Estimate: `messageLength / 4` for approximate token count
- Set reasonable limit (e.g., 8000 tokens for input)
- Display clear error message with limit information

**Sources**:

- Feature specification (FR-015)
- Common token estimation practices
- DeepSeek API documentation

---

### 9. Session Management

**Question**: How to implement session lifecycle (start on first message, end after 30 min inactivity)?

**Decision**: Client-side session management using React state and `useEffect` for timeout tracking.

**Rationale**:

- Spec states sessions are in-memory (Out of Scope: persistence across sessions)
- Client-side management sufficient for single-session requirement
- 30-minute timeout can be tracked with `setTimeout` and reset on activity
- Starting new conversation clears previous session state

**Implementation Notes**:

- Track last activity timestamp
- Reset timeout on each message send/receive
- Clear messages when timeout expires or new conversation starts
- Single active session enforced by clearing state on new conversation

**Sources**:

- Feature specification (FR-013, FR-014, FR-016)
- Clarifications (session lifecycle)

---

### 10. Dependencies & Package Updates

**Question**: What packages need to be installed or updated?

**Decision**:

- Keep existing packages: `ai`, `@ai-sdk/react`
- Remove direct DeepSeek provider usage (no longer need `@ai-sdk/deepseek` for Gateway routing)
- Optional: Add `@ai-sdk/gateway` if explicit gateway provider needed (not required for Vercel deployment)

**Rationale**:

- `ai` package provides core SDK functionality
- `@ai-sdk/react` provides `useChat` hook
- Model strings work with default Gateway provider on Vercel
- Removing unused provider reduces bundle size

**Current Dependencies** (from package.json):

- ✅ `ai: ^5.0.93` - Core SDK
- ✅ `@ai-sdk/react: ^2.0.93` - React hooks
- ⚠️ `@ai-sdk/deepseek: ^1.0.28` - Can be removed if not using direct provider
- ✅ `@ai-sdk/openai: ^2.0.68` - May be used for other features

**Sources**:

- Current package.json
- Vercel AI SDK documentation
- Feature requirements

---

## Summary of Key Decisions

1. **Use model string format** `'deepseek/deepseek-chat'` for Gateway routing
2. **Keep existing frontend pattern** with `useChat` hook
3. **Update API route** to use model string instead of direct provider
4. **Implement error handling** with timeout and validation
5. **Client-side session management** for lifecycle tracking
6. **Environment variables**: `DEEPSEEK_API_KEY` for BYOK (configured in Vercel dashboard)

## Open Questions Resolved

- ✅ How to route through Gateway: Use model string format
- ✅ Model identifier: `deepseek/deepseek-chat` (verify in dashboard)
- ✅ Environment setup: `DEEPSEEK_API_KEY` in Vercel dashboard
- ✅ API pattern: `streamText()` with model string
- ✅ Error handling: Try-catch with structured responses
- ✅ Timeout: 60 seconds using AbortController
- ✅ Token validation: Approximate estimation + server validation
- ✅ Session management: Client-side with timeout tracking

## References

- Vercel AI Gateway Documentation: https://vercel.com/docs/ai-gateway
- Vercel AI Gateway Models: https://vercel.com/ai-gateway/models
- Vercel AI SDK Documentation: https://ai-sdk.dev/docs
- Feature Specification: `specs/001-vercel-ai-chat/spec.md`
- Project Documentation: `docs/chatgpt.md`, `docs/claude.md`, `docs/gemini.md`, `docs/grok.md`
