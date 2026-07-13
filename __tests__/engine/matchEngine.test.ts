/**
 * Unit tests for matchEngine — match-context recommendations.
 * Tests event-driven recommendations, edge cases, and deterministic output.
 */

import { describe, it, expect } from "vitest";
import { getMatchRecommendations } from "@/lib/engine/matchEngine";
import type { MatchState } from "@/lib/types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function createMatchState(overrides: Partial<MatchState> = {}): MatchState {
  return {
    homeTeam: "USA",
    awayTeam: "Mexico",
    homeScore: 1,
    awayScore: 0,
    currentMinute: 15,
    events: [
      {
        id: "e1",
        minute: 14,
        type: "goal",
        team: "home",
        playerName: "Pulisic",
        description: "Free kick from 25 yards.",
      },
    ],
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("matchEngine", () => {
  describe("getMatchRecommendations", () => {
    it("should return an empty array when matchState has no events", () => {
      const state = createMatchState({ events: [] });
      const recs = getMatchRecommendations(state);
      expect(recs).toEqual([]);
    });

    it("should return a goal recommendation for a recent goal event", () => {
      const state = createMatchState(); // goal at 14', current=15'
      const recs = getMatchRecommendations(state);
      expect(recs.length).toBeGreaterThanOrEqual(1);
      expect(recs[0]!.title).toContain("GOAL");
    });

    it("should include the player name in the goal recommendation message", () => {
      const state = createMatchState();
      const recs = getMatchRecommendations(state);
      expect(recs.some((r) => r.message.includes("Pulisic"))).toBe(true);
    });

    it("should return empty array when goal is older than 3 minutes", () => {
      const state = createMatchState({ currentMinute: 30 }); // goal at 14', current=30'
      const recs = getMatchRecommendations(state);
      expect(recs).toEqual([]);
    });

    it("should generate a half_time recommendation for half_time event", () => {
      const state = createMatchState({
        currentMinute: 45,
        events: [
          {
            id: "ht1",
            minute: 45,
            type: "half_time",
            team: "home",
            playerName: "",
            description: "Half time.",
          },
        ],
      });
      const recs = getMatchRecommendations(state);
      expect(recs.some((r) => r.title.includes("Half-time"))).toBe(true);
    });

    it("should return only readonly recommendations", () => {
      const state = createMatchState();
      const recs = getMatchRecommendations(state);
      expect(Array.isArray(recs)).toBe(true);
    });

    it("should return recommendations with valid priority values", () => {
      const state = createMatchState();
      const recs = getMatchRecommendations(state);
      for (const rec of recs) {
        expect(rec.priority).toBeGreaterThanOrEqual(1);
        expect(rec.priority).toBeLessThanOrEqual(4);
      }
    });

    it("should return recommendations with valid icon values", () => {
      const state = createMatchState();
      const recs = getMatchRecommendations(state);
      const validIcons = [
        "utensils",
        "toilet",
        "map",
        "shield",
        "wheelchair",
        "users",
        "alert",
        "info",
      ];
      for (const rec of recs) {
        expect(validIcons).toContain(rec.icon);
      }
    });

    it("should attribute goal to the correct team", () => {
      const homeGoal = createMatchState();
      const homeRecs = getMatchRecommendations(homeGoal);
      expect(homeRecs[0]!.title).toContain("USA");

      const awayGoal = createMatchState({
        currentMinute: 15,
        events: [
          {
            id: "e2",
            minute: 14,
            type: "goal",
            team: "away",
            playerName: "Lozano",
            description: "Counter-attack.",
          },
        ],
      });
      const awayRecs = getMatchRecommendations(awayGoal);
      expect(awayRecs[0]!.title).toContain("Mexico");
    });

    it("should handle null-ish matchState gracefully", () => {
      const state = createMatchState({ events: [] });
      const recs = getMatchRecommendations(state);
      expect(recs).toHaveLength(0);
    });

    it("should generate unique IDs for each recommendation", () => {
      const state = createMatchState();
      const recs = getMatchRecommendations(state);
      const ids = recs.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should produce deterministic output for the same input", () => {
      const state = createMatchState();
      const recs1 = getMatchRecommendations(state);
      const recs2 = getMatchRecommendations(state);
      expect(recs1).toEqual(recs2);
    });
  });
});
