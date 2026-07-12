/**
 * POST /api/insights — Proactive AI briefing endpoint.
 * Uses Gemini to analyze stadium state and suggest operational actions.
 * Server-side only — API key never exposed to client.
 */

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod/v4";
import { stadiumStateSchema } from "@/lib/schemas";

const insightsRequestSchema = z.object({
  stadiumState: stadiumStateSchema,
});

interface InsightsSuccessResponse {
  readonly insight: string;
}

interface InsightsErrorResponse {
  readonly error: string;
}

type InsightsResponse = InsightsSuccessResponse | InsightsErrorResponse;

export async function POST(
  request: Request
): Promise<NextResponse<InsightsResponse>> {
  try {
    const body: unknown = await request.json();
    const parseResult = insightsRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request format." },
        { status: 400 }
      );
    }

    const { stadiumState } = parseResult.data;
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        insight:
          "Stadium operations are optimal. Please configure Gemini API key for advanced insights.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are the AI Operations Director for a smart stadium. Based on this real-time stadium state data:
${JSON.stringify(stadiumState, null, 2)}

Provide a very concise, 2-sentence proactive executive brief identifying the most critical operational bottleneck and suggesting an immediate action for the stadium manager. Do NOT use markdown.`;

    const result = await model.generateContent([{ text: prompt }]);
    const insightText = result.response.text().trim();

    return NextResponse.json({ insight: insightText });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
