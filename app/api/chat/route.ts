/**
 * POST /api/chat — Server-side chat endpoint.
 * Reads GOOGLE_GENERATIVE_AI_API_KEY from process.env (never exposed to client).
 * Validates both incoming request and LLM response with Zod.
 */

import { NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/schemas";
import { generateChatResponse } from "@/lib/aiService";
import type { ChatResponse } from "@/lib/types";

export async function POST(request: Request): Promise<NextResponse<ChatResponse | { error: string }>> {
  try {
    const body: unknown = await request.json();

    // Validate incoming request with Zod
    const parseResult = chatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request format. Please check your input." },
        { status: 400 }
      );
    }

    const { message, userProfile, stadiumState } = parseResult.data;

    const response = await generateChatResponse(message, userProfile, stadiumState);

    return NextResponse.json(response, {
      headers: { "X-RateLimit-Policy": "60;w=60" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request. Please try again." },
      { status: 500 }
    );
  }
}
