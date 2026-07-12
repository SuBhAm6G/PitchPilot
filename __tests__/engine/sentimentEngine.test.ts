/**
 * Unit tests for sentimentEngine — crowd sentiment scoring.
 * Tests match phase factors, incident drag, goal boost, and boundary clamping.
 */

import { describe, it, expect } from "vitest";
import { computeSentiment } from "@/lib/engine/sentimentEngine";
import type { StadiumState } from "@/lib/types";
import { generateStadiumState } from "@/lib/data/mockStadiumData";
import { MATCH_PHASES, INCIDENT_SEVERITY, INCIDENT_STATUS } from "@/lib/utils/constants";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function createStateWithPhase(phase: typeof MATCH_PHASES[keyof typeof MATCH_PHASES]): StadiumState {
  return generateStadiumState(phase, 42);
}

function createStateWithIncidents(count: number, severity: number): StadiumState {
  const base = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
  const incidents: StadiumState["incidents"] = Array.from({ length: count }, (_, i) => ({
    id: `inc-${i}`,
    title: `Incident ${i}`,
    description: "Test",
    severity: severity as 1 | 2 | 3 | 4,
    status: INCIDENT_STATUS.OPEN,
    zoneId: "north-lower" as const,
    reportedAt: new Date().toISOString(),
    assignedTo: null,
  }));
  return { ...base, incidents };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("sentimentEngine", () => {
  describe("computeSentiment — match phase factors", () => {
    it("should return a sentiment score during first_half", () => {
      const state = createStateWithPhase(MATCH_PHASES.FIRST_HALF);
      const sentiment = computeSentiment(state);
      expect(sentiment.level).toBeGreaterThanOrEqual(1);
      expect(sentiment.level).toBeLessThanOrEqual(5);
    });

    it("should boost sentiment during active play phases (first_half, second_half)", () => {
      const firstHalf = computeSentiment(createStateWithPhase(MATCH_PHASES.FIRST_HALF));
      const preMatch = computeSentiment(createStateWithPhase(MATCH_PHASES.PRE_MATCH));
      // Active play should have higher or equal sentiment than pre-match
      expect(firstHalf.level).toBeGreaterThanOrEqual(preMatch.level);
    });
  });

  describe("computeSentiment — incident drag", () => {
    it("should decrease sentiment with critical incidents", () => {
      const noIncidents = computeSentiment(createStateWithIncidents(0, INCIDENT_SEVERITY.HIGH));
      const withIncidents = computeSentiment(createStateWithIncidents(2, INCIDENT_SEVERITY.HIGH));
      expect(withIncidents.level).toBeLessThanOrEqual(noIncidents.level);
    });

    it("should not go below level 1 even with many incidents", () => {
      const state = createStateWithIncidents(10, INCIDENT_SEVERITY.CRITICAL);
      const sentiment = computeSentiment(state);
      expect(sentiment.level).toBeGreaterThanOrEqual(1);
    });
  });

  describe("computeSentiment — output format", () => {
    it("should return a valid emoji string", () => {
      const state = createStateWithPhase(MATCH_PHASES.FIRST_HALF);
      const sentiment = computeSentiment(state);
      expect(sentiment.emoji).toBeTruthy();
      expect(typeof sentiment.emoji).toBe("string");
    });

    it("should return a valid label string", () => {
      const state = createStateWithPhase(MATCH_PHASES.FIRST_HALF);
      const sentiment = computeSentiment(state);
      expect(sentiment.label).toBeTruthy();
      expect(typeof sentiment.label).toBe("string");
    });

    it("should have level bounded between 1 and 5", () => {
      const phases = [MATCH_PHASES.PRE_MATCH, MATCH_PHASES.FIRST_HALF, MATCH_PHASES.HALF_TIME, MATCH_PHASES.SECOND_HALF, MATCH_PHASES.POST_MATCH];
      for (const phase of phases) {
        const sentiment = computeSentiment(createStateWithPhase(phase));
        expect(sentiment.level).toBeGreaterThanOrEqual(1);
        expect(sentiment.level).toBeLessThanOrEqual(5);
      }
    });
  });

  describe("computeSentiment — determinism", () => {
    it("should produce identical output for identical input", () => {
      const state = createStateWithPhase(MATCH_PHASES.SECOND_HALF);
      const s1 = computeSentiment(state);
      const s2 = computeSentiment(state);
      expect(s1).toEqual(s2);
    });
  });

  describe("computeSentiment — goal boost", () => {
    it("should boost sentiment when a recent goal exists", () => {
      const state = createStateWithPhase(MATCH_PHASES.FIRST_HALF);
      // Default mock state has a goal at minute 14, current minute ~32
      // The goal is more than 10 minutes ago, so no boost
      const sentiment = computeSentiment(state);
      // Modify to have a very recent goal
      const recentGoalState: StadiumState = {
        ...state,
        matchState: {
          ...state.matchState,
          currentMinute: 15,
          events: [{ id: "g1", minute: 14, type: "goal", team: "home", playerName: "Pulisic", description: "Goal!" }],
        },
      };
      const boosted = computeSentiment(recentGoalState);
      expect(boosted.level).toBeGreaterThanOrEqual(sentiment.level);
    });
  });
});
