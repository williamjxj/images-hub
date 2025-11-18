import { deepseek } from "@ai-sdk/deepseek";
import { streamText, convertToModelMessages } from "ai";

export const runtime = "edge"; // or "nodejs" — but edge gives lower latency

// Configure DeepSeek provider with API key
const deepseekProvider = deepseek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages(messages);

    // Call DeepSeek model directly
    const result = streamText({
      model: deepseekProvider("deepseek-chat"),
      messages: modelMessages,
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error processing chat' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
