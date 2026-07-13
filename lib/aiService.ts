import { GoogleGenerativeAI } from "@google/generative-ai";
import { llmResponseSchema } from "@/lib/schemas";
import { getPersonalizedRecommendations } from "@/lib/engine/contextDecisionEngine";
import { CHAT_CONFIG } from "@/lib/utils/constants";
import type {
  ChatResponse,
  ContextRecommendation,
  UserProfile,
  StadiumState,
  Incident,
} from "@/lib/types";

/**
 * Hardened AI Gateway that guarantees a response even if the LLM fails,
 * times out, or the API key is missing.
 */
export async function generateChatResponse(
  message: string,
  userProfile: UserProfile,
  stadiumState: StadiumState,
): Promise<ChatResponse> {
  const contextRecs = getPersonalizedRecommendations(userProfile, stadiumState);
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return {
      reply: generateFallbackReply(message, contextRecs, stadiumState),
      recommendations: contextRecs.slice(0, 3),
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const systemPrompt = buildSystemPrompt(
    userProfile,
    stadiumState,
    contextRecs,
  );

  try {
    // 5 second timeout for the LLM call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Provide abort signal to the fetch call inside SDK if supported,
    // otherwise wrap in Promise.race
    const generatePromise = model.generateContent([
      { text: systemPrompt },
      { text: message },
    ]);

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("LLM Timeout")), 5000),
    );

    const result = await Promise.race([generatePromise, timeoutPromise]);
    clearTimeout(timeoutId);

    const responseText = result.response.text();
    const structuredResponse = tryParseLLMResponse(responseText);

    if (structuredResponse) {
      return structuredResponse;
    }

    // If LLM returned plain text, wrap it
    return {
      reply: responseText,
      recommendations: contextRecs.slice(0, 3),
    };
  } catch (error) {
    console.warn(
      "LLM Gateway fallback triggered:",
      error instanceof Error ? error.message : error,
    );
    return {
      reply: generateFallbackReply(message, contextRecs, stadiumState),
      recommendations: contextRecs.slice(0, 3),
    };
  }
}

function buildSystemPrompt(
  userProfile: UserProfile,
  stadiumState: StadiumState,
  recommendations: readonly ContextRecommendation[],
): string {
  const recSummary = recommendations
    .slice(0, 5)
    .map((r) => `- [${r.type}] ${r.title}: ${r.message}`)
    .join("\n");

  const weatherStr = stadiumState.weather
    ? `${stadiumState.weather.temperatureCelsius}°C, ${stadiumState.weather.condition}`
    : "Unknown";
  const matchStr = stadiumState.matchState
    ? `${stadiumState.matchState.homeTeam} ${stadiumState.matchState.homeScore} - ${stadiumState.matchState.awayScore} ${stadiumState.matchState.awayTeam} (${stadiumState.matchState.currentMinute}')`
    : "Not Started";
  const incidentsCount = stadiumState.incidents.filter(
    (i: Incident) => i.status !== "resolved",
  ).length;

  return `You are ${CHAT_CONFIG.SYSTEM_PROMPT_ROLE}.

Current context:
- User role: ${userProfile.role}
- Current Zone: ${userProfile.currentZone}
- Match phase: ${stadiumState.matchPhase}
- Match score: ${matchStr}
- Weather: ${weatherStr}
- Active incidents: ${incidentsCount}
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

function tryParseLLMResponse(text: string): ChatResponse | null {
  try {
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

export function generateFallbackReply(
  message: string,
  recommendations: readonly ContextRecommendation[],
  stadiumState: StadiumState,
): string {
  const lowerMessage = message.toLowerCase();

  if (/\b(food|eat|hungry)\b/.test(lowerMessage)) {
    const foodRec = recommendations.find((r) => r.type === "food");
    return foodRec
      ? `🍔 ${foodRec.message}`
      : "There are food courts available in every zone. Check the dashboard for current wait times!";
  }

  if (/\b(restroom|bathroom|toilet)\b/.test(lowerMessage)) {
    const restroomRec = recommendations.find((r) => r.type === "restroom");
    return restroomRec
      ? `🚻 ${restroomRec.message}`
      : "Restrooms are available in every zone. The nearest ones should have short wait times right now.";
  }

  if (/\b(crowd|busy|packed)\b/.test(lowerMessage)) {
    const crowdRec = recommendations.find((r) => r.type === "crowd_alert");
    return crowdRec
      ? `👥 ${crowdRec.message}`
      : "The stadium is moderately busy right now. Check the Ops Dashboard for zone-by-zone density.";
  }

  if (/\b(weather)\b/.test(lowerMessage) && stadiumState.weather) {
    return `⛅ The weather is currently ${stadiumState.weather.condition} and ${stadiumState.weather.temperatureCelsius}°C.`;
  }

  if (/\b(score|match)\b/.test(lowerMessage) && stadiumState.matchState) {
    return `⚽ It's currently ${stadiumState.matchState.homeTeam} ${stadiumState.matchState.homeScore} - ${stadiumState.matchState.awayScore} ${stadiumState.matchState.awayTeam} in minute ${stadiumState.matchState.currentMinute}.`;
  }

  if (/\b(help|emergency|medical)\b/.test(lowerMessage)) {
    return "🏥 For medical emergencies, please notify the nearest staff member or call stadium security. First aid stations are located in every zone.";
  }

  const topRec = recommendations[0];
  return topRec
    ? `Welcome to PitchPilot (Offline Mode)! Here's a tip: ${topRec.message}\n\nAsk me about food, restrooms, match stats, weather, or anything else about your stadium experience!`
    : "Welcome to PitchPilot! I can help you with food options, restroom locations, match stats, weather, and more. What would you like to know?";
}
