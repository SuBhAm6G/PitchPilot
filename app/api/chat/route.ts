/**
 * POST /api/chat — Server-side chat endpoint.
 * Reads GOOGLE_GENERATIVE_AI_API_KEY from process.env (never exposed to client).
 * Validates both incoming request and LLM response with Zod.
 */

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { chatRequestSchema, llmResponseSchema } from "@/lib/schemas";
import { getPersonalizedRecommendations } from "@/lib/engine/contextDecisionEngine";
import { CHAT_CONFIG } from "@/lib/utils/constants";
import type { ChatResponse, ContextRecommendation } from "@/lib/types";

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

    // Get context-aware recommendations from the deterministic engine
    const contextRecs = getPersonalizedRecommendations(
      userProfile,
      stadiumState
    );

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      // Fallback: return engine-generated response without LLM
      return NextResponse.json(
        {
          reply: generateFallbackReply(message, contextRecs),
          recommendations: contextRecs.slice(0, 3),
        },
        { headers: { "X-RateLimit-Policy": "60;w=60" } }
      );
    }

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = buildSystemPrompt(userProfile.role, stadiumState.matchPhase, contextRecs);

    let responseText = "";
    try {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: message },
      ]);
      responseText = result.response.text();
    } catch (llmError) {
      console.warn("LLM generation failed, using fallback:", llmError);
      return NextResponse.json({
        reply: generateFallbackReply(message, contextRecs),
        recommendations: contextRecs.slice(0, 3),
      });
    }

    // Attempt to parse structured JSON from LLM
    const structuredResponse = tryParseLLMResponse(responseText);

    if (structuredResponse) {
      return NextResponse.json(structuredResponse, {
        headers: { "X-RateLimit-Policy": "60;w=60" },
      });
    }

    // If LLM returned plain text, wrap it with engine recommendations
    return NextResponse.json(
      {
        reply: responseText,
        recommendations: contextRecs.slice(0, 3),
      },
      { headers: { "X-RateLimit-Policy": "60;w=60" } }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request. Please try again." },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  role: string,
  matchPhase: string,
  recommendations: readonly ContextRecommendation[]
): string {
  const recSummary = recommendations
    .slice(0, 5)
    .map((r) => `- [${r.type}] ${r.title}: ${r.message}`)
    .join("\n");

  return `You are ${CHAT_CONFIG.SYSTEM_PROMPT_ROLE}.

Current context:
- User role: ${role}
- Match phase: ${matchPhase}
- Active recommendations from the stadium system:
${recSummary}

Instructions:
- Be helpful, concise, and stadium-aware.
- If the user asks about food, restrooms, or navigation, use the recommendations above.
- For staff users, focus on operations, crowd management, and incident handling.
- For fan users, focus on enhancing their match-day experience.
- Keep responses under 200 words.
- Be friendly and professional.

Respond naturally to the user's message.`;
}

function tryParseLLMResponse(
  text: string
): ChatResponse | null {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    if (!jsonString) return null;

    const parsed: unknown = JSON.parse(jsonString);
    const validated = llmResponseSchema.safeParse(parsed);

    if (validated.success) {
      return {
        reply: validated.data.reply,
        recommendations: validated.data.recommendations.map((r, i) => ({
          ...r,
          id: `llm-rec-${String(i)}`,
        })),
      };
    }

    return null;
  } catch {
    return null;
  }
}

function generateFallbackReply(
  message: string,
  recommendations: readonly ContextRecommendation[]
): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("food") || lowerMessage.includes("eat") || lowerMessage.includes("hungry")) {
    const foodRec = recommendations.find((r) => r.type === "food");
    return foodRec
      ? `🍔 ${foodRec.message}`
      : "There are food courts available in every zone. Check the dashboard for current wait times!";
  }

  if (lowerMessage.includes("restroom") || lowerMessage.includes("bathroom") || lowerMessage.includes("toilet")) {
    const restroomRec = recommendations.find((r) => r.type === "restroom");
    return restroomRec
      ? `🚻 ${restroomRec.message}`
      : "Restrooms are available in every zone. The nearest ones should have short wait times right now.";
  }

  if (lowerMessage.includes("crowd") || lowerMessage.includes("busy") || lowerMessage.includes("packed")) {
    const crowdRec = recommendations.find((r) => r.type === "crowd_alert");
    return crowdRec
      ? `👥 ${crowdRec.message}`
      : "The stadium is moderately busy right now. Check the Ops Dashboard for zone-by-zone density.";
  }

  if (lowerMessage.includes("help") || lowerMessage.includes("emergency") || lowerMessage.includes("medical")) {
    return "🏥 For medical emergencies, please notify the nearest staff member or call stadium security. First aid stations are located in every zone.";
  }

  const topRec = recommendations[0];
  return topRec
    ? `Welcome to PitchPilot! Here's a tip: ${topRec.message}\n\nAsk me about food, restrooms, crowd info, or anything else about your stadium experience!`
    : "Welcome to PitchPilot! I can help you with food options, restroom locations, crowd information, and more. What would you like to know?";
}
