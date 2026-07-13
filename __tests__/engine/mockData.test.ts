/**
 * Integration tests for mock data generators.
 * Verifies that mock data passes Zod schema validation and maintains internal consistency.
 */

import { describe, it, expect } from "vitest";
import {
  generateStadiumState,
  generateZoneOccupancy,
  generateVenues,
} from "@/lib/data/mockStadiumData";
import { generateIncidents } from "@/lib/data/mockIncidents";
import { stadiumStateSchema, incidentSchema } from "@/lib/schemas";
import { MATCH_PHASES, STADIUM_ZONES } from "@/lib/utils/constants";

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("mockStadiumData integration", () => {
  it("should produce a stadium state that passes stadiumStateSchema validation", () => {
    const state = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
    const result = stadiumStateSchema.safeParse(state);
    expect(result.success).toBe(true);
  });

  it("should produce valid zones for all match phases", () => {
    const phases = [
      MATCH_PHASES.PRE_MATCH,
      MATCH_PHASES.FIRST_HALF,
      MATCH_PHASES.HALF_TIME,
      MATCH_PHASES.SECOND_HALF,
      MATCH_PHASES.POST_MATCH,
    ];
    for (const phase of phases) {
      const zones = generateZoneOccupancy(phase, 42);
      expect(zones.length).toBe(STADIUM_ZONES.length);
      for (const zone of zones) {
        expect(zone.currentOccupancy).toBeGreaterThanOrEqual(0);
        expect(zone.currentOccupancy).toBeLessThanOrEqual(zone.maxCapacity);
      }
    }
  });

  it("should produce valid venues for all match phases", () => {
    const phases = [
      MATCH_PHASES.PRE_MATCH,
      MATCH_PHASES.FIRST_HALF,
      MATCH_PHASES.HALF_TIME,
      MATCH_PHASES.SECOND_HALF,
      MATCH_PHASES.POST_MATCH,
    ];
    for (const phase of phases) {
      const venues = generateVenues(phase, 42);
      expect(venues.length).toBeGreaterThan(0);
      for (const venue of venues) {
        expect(venue.estimatedWaitMinutes).toBeGreaterThanOrEqual(0);
        expect(venue.currentQueueLength).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("should have consistent zone IDs across zones and venues", () => {
    const state = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
    const zoneIds = new Set(state.zones.map((z) => z.id));
    for (const venue of state.venues) {
      expect(zoneIds.has(venue.zoneId)).toBe(true);
    }
  });

  it("should produce deterministic output for the same seed", () => {
    const state1 = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
    const state2 = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
    expect(state1.zones).toEqual(state2.zones);
    expect(state1.venues).toEqual(state2.venues);
  });

  it("should produce different output for different seeds", () => {
    const state1 = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
    const state2 = generateStadiumState(MATCH_PHASES.FIRST_HALF, 99);
    // At least some zones should have different occupancy
    const diff = state1.zones.some(
      (z, i) => z.currentOccupancy !== state2.zones[i]?.currentOccupancy,
    );
    expect(diff).toBe(true);
  });
});

describe("mockIncidents integration", () => {
  it("should produce incidents that pass incidentSchema validation", () => {
    const incidents = generateIncidents(3, 42);
    for (const incident of incidents) {
      const result = incidentSchema.safeParse(incident);
      expect(result.success).toBe(true);
    }
  });

  it("should produce the requested number of incidents", () => {
    expect(generateIncidents(0, 42)).toHaveLength(0);
    expect(generateIncidents(3, 42)).toHaveLength(3);
    expect(generateIncidents(5, 42)).toHaveLength(5);
  });

  it("should produce incidents with valid timestamps", () => {
    const incidents = generateIncidents(3, 42);
    for (const incident of incidents) {
      expect(new Date(incident.reportedAt).getTime()).not.toBeNaN();
    }
  });
});
