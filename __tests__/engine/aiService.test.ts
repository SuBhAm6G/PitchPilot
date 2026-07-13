import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateChatResponse, generateFallbackReply } from "@/lib/aiService";
import type {
  UserProfile,
  StadiumState,
  ContextRecommendation,
} from "@/lib/types";
import { generateStadiumState } from "@/lib/data/mockStadiumData";

const mockProfile: UserProfile = {
  role: "fan",
  stadiumId: "metlife",
  currentZone: "north-lower",
  accessibilityNeeds: {
    wheelchairAccess: false,
    visualAssistance: false,
    hearingAssistance: false,
  },
};
const mockState: StadiumState = {
  ...generateStadiumState("first_half", 42),
  weather: {
    condition: "clear",
    temperatureCelsius: 22,
    advisory: "Perfect conditions for a match.",
    recommendedGate: "Gate A",
    icon: "☀️",
  },
  matchState: {
    homeTeam: "USA",
    awayTeam: "Mexico",
    homeScore: 1,
    awayScore: 0,
    currentMinute: 14,
    events: [],
  },
};

describe("aiService Offline Gateway", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("should use deterministic fallback when API key is missing", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");

    const response = await generateChatResponse(
      "where is food?",
      mockProfile,
      mockState,
    );
    expect(response.reply).toMatch(/🍔/);
    expect(response.recommendations).toBeInstanceOf(Array);
  });

  it("should fallback when message asks about weather", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");

    const response = await generateChatResponse(
      "what is the weather?",
      mockProfile,
      mockState,
    );
    expect(response.reply).toMatch(/⛅/);
  });

  it("should fallback when message asks about score", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");

    const response = await generateChatResponse(
      "what's the score?",
      mockProfile,
      mockState,
    );
    expect(response.reply).toMatch(/⚽/);
  });

  it("generateFallbackReply handles edge cases securely without throwing", () => {
    const noRecs: ContextRecommendation[] = [];
    const reply = generateFallbackReply("hello", noRecs, mockState);
    expect(reply).toMatch(/Welcome/);
  });
});
