import { streamText, convertToModelMessages } from "ai";

export const runtime = "edge"; // Edge runtime for lower latency

// Timeout: 60 seconds (per FR-018)
const REQUEST_TIMEOUT_MS = 60_000;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: {
            type: "validation",
            message: "Messages array is required and cannot be empty",
            retryable: false,
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate message length (approximate token check - FR-015)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user" && lastMessage?.content) {
      const estimatedTokens = lastMessage.content.length / 4; // Approximate: 1 token ≈ 4 characters
      if (estimatedTokens > 8000) {
        return new Response(
          JSON.stringify({
            error: {
              type: "validation",
              message: "Message exceeds token limit. Please shorten your message.",
              retryable: false,
              details: "Maximum tokens: 8000",
            },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages(messages);

    // Create AbortController for timeout handling (FR-018)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      // Stream text using Vercel AI Gateway routing
      // Model string format automatically routes through Gateway when deployed on Vercel
      const result = streamText({
        model: "deepseek/deepseek-chat", // Gateway routing via model string
        messages: modelMessages,
        temperature: 0.7,
        maxOutputTokens: 2000,
        abortSignal: controller.signal,
      });

      clearTimeout(timeoutId);
      return result.toUIMessageStreamResponse();
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout (FR-018)
      if (error instanceof Error && error.name === "AbortError") {
        return new Response(
          JSON.stringify({
            error: {
              type: "timeout",
              message: "Request timed out. Please try again.",
              retryable: true,
            },
          }),
          { status: 408, headers: { "Content-Type": "application/json" } }
        );
      }

      // Handle credit card requirement (Vercel AI Gateway)
      if (
        error instanceof Error &&
        (error.message.includes("credit card") ||
          error.message.includes("valid credit card") ||
          error.message.includes("add-credit-card"))
      ) {
        return new Response(
          JSON.stringify({
            error: {
              type: "configuration",
              message: "AI Gateway requires a valid credit card on file. Please add a credit card in Vercel dashboard to unlock free credits.",
              retryable: false,
              details: error.message,
              actionUrl: "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
            },
          }),
          { status: 402, headers: { "Content-Type": "application/json" } }
        );
      }

      // Handle rate limits (FR-011)
      if (
        error instanceof Error &&
        (error.message.includes("rate limit") ||
          error.message.includes("429") ||
          error.message.includes("too many requests"))
      ) {
        const retryAfter = 60; // Default retry after 60 seconds
        return new Response(
          JSON.stringify({
            error: {
              type: "rate_limit",
              message: "Rate limit exceeded. Please try again later.",
              retryable: true,
              retryAfter,
            },
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": retryAfter.toString(),
            },
          }
        );
      }

      // Handle other errors
      console.error("Chat API Error:", error);
      return new Response(
        JSON.stringify({
          error: {
            type: "service",
            message: "An error occurred processing your request. Please try again.",
            retryable: true,
            details: error instanceof Error ? error.message : "Unknown error",
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({
        error: {
          type: "network",
          message: "Network error occurred. Please check your connection and try again.",
          retryable: true,
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
