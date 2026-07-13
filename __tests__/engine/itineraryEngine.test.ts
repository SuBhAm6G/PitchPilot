/**
 * Unit tests for itineraryEngine — personalized match-day itinerary generation.
 * Tests phase-specific items, priority ordering, and edge cases.
 */

import { describe, it, expect } from "vitest";
import { generateItinerary } from "@/lib/engine/itineraryEngine";
import { MATCH_PHASES } from "@/lib/utils/constants";
import { generateStadiumState } from "@/lib/data/mockStadiumData";

// ─── Fixtures ────────────────────────────────────────────────────────────────

// ─── Fixtures ────────────────────────────────────────────────────────────────

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("itineraryEngine", () => {
  describe("generateItinerary", () => {
    it("should return items for pre_match phase", () => {
      const state = generateStadiumState(MATCH_PHASES.PRE_MATCH, 42);
      const items = generateItinerary(state);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0]!.action).toContain("Enter");
    });

    it("should return different items for half_time phase", () => {
      const state = generateStadiumState(MATCH_PHASES.HALF_TIME, 42);
      const items = generateItinerary(state);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0]!.action.toLowerCase()).toContain("restroom");
    });

    it("should return items for first_half phase", () => {
      const state = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
      const items = generateItinerary(state);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0]!.action.toLowerCase()).toContain("match");
    });

    it("should return items for post_match phase with exit strategy", () => {
      const state = generateStadiumState(MATCH_PHASES.POST_MATCH, 42);
      const items = generateItinerary(state);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0]!.action.toLowerCase()).toContain("exit");
    });

    it("should not produce an empty itinerary for any valid phase", () => {
      const phases = [
        MATCH_PHASES.PRE_MATCH,
        MATCH_PHASES.FIRST_HALF,
        MATCH_PHASES.HALF_TIME,
        MATCH_PHASES.SECOND_HALF,
        MATCH_PHASES.POST_MATCH,
      ];
      for (const phase of phases) {
        const state = generateStadiumState(phase, 42);
        const items = generateItinerary(state);
        expect(items.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("should have unique IDs for all items", () => {
      const state = generateStadiumState(MATCH_PHASES.PRE_MATCH, 42);
      const items = generateItinerary(state);
      const ids = items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have valid priority values for all items", () => {
      const state = generateStadiumState(MATCH_PHASES.PRE_MATCH, 42);
      const items = generateItinerary(state);
      const validPriorities = ["now", "soon", "later"];
      for (const item of items) {
        expect(validPriorities).toContain(item.priority);
      }
    });

    it("should produce deterministic output for same input", () => {
      const state = generateStadiumState(MATCH_PHASES.HALF_TIME, 42);
      const items1 = generateItinerary(state);
      const items2 = generateItinerary(state);
      expect(items1).toEqual(items2);
    });
  });
});
