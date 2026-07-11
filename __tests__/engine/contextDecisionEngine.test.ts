/**
 * Unit tests for contextDecisionEngine — the core brain of PitchPilot.
 * Tests role-based, time-based, location-based, and accessibility context switching.
 */

import { describe, it, expect } from "vitest";
import {
  getPersonalizedRecommendations,
  getZoneDensityLevel,
} from "@/lib/engine/contextDecisionEngine";
import type { UserProfile, StadiumState, StadiumZone } from "@/lib/types";
import { USER_ROLES, MATCH_PHASES } from "@/lib/utils/constants";
import { generateStadiumState } from "@/lib/data/mockStadiumData";
import { generateIncidents } from "@/lib/data/mockIncidents";

// ─── Test Fixtures ───────────────────────────────────────────────────────────

function createFanProfile(zone: string = "north-lower"): UserProfile {
  return {
    id: "test-fan-001",
    name: "Test Fan",
    role: USER_ROLES.FAN,
    currentZone: zone as UserProfile["currentZone"],
    preferredLanguage: "en",
    accessibilityNeeds: {
      wheelchairAccess: false,
      visualAssistance: false,
      hearingAssistance: false,
    },
  };
}

function createStaffProfile(zone: string = "north-lower"): UserProfile {
  return {
    id: "test-staff-001",
    name: "Test Staff",
    role: USER_ROLES.STAFF,
    currentZone: zone as UserProfile["currentZone"],
    preferredLanguage: "en",
    accessibilityNeeds: {
      wheelchairAccess: false,
      visualAssistance: false,
      hearingAssistance: false,
    },
  };
}

function createAccessibleFanProfile(): UserProfile {
  return {
    ...createFanProfile(),
    accessibilityNeeds: {
      wheelchairAccess: true,
      visualAssistance: false,
      hearingAssistance: true,
    },
  };
}

function createStadiumStateWithIncidents(): StadiumState {
  const state = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
  return { ...state, incidents: generateIncidents(5, 42) };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("getPersonalizedRecommendations", () => {
  it("should return recommendations sorted by priority (highest first)", () => {
    const profile = createFanProfile();
    const state = generateStadiumState(MATCH_PHASES.HALF_TIME, 42);
    const recs = getPersonalizedRecommendations(profile, state, new Date());

    for (let i = 0; i < recs.length - 1; i++) {
      const current = recs[i];
      const next = recs[i + 1];
      if (current && next) {
        expect(current.priority).toBeGreaterThanOrEqual(next.priority);
      }
    }
  });

  it("should generate different recommendations for Fan vs Staff", () => {
    const state = createStadiumStateWithIncidents();
    const fanRecs = getPersonalizedRecommendations(
      createFanProfile(),
      state,
      new Date()
    );
    const staffRecs = getPersonalizedRecommendations(
      createStaffProfile(),
      state,
      new Date()
    );

    // Fan should get food/restroom recs
    const fanTypes = fanRecs.map((r) => r.type);
    expect(fanTypes).toContain("food");
    expect(fanTypes).toContain("restroom");

    // Staff should get incident-related recs
    const staffTypes = staffRecs.map((r) => r.type);
    const hasOpsRec = staffTypes.some(
      (t) => t === "incident" || t === "crowd_alert"
    );
    expect(hasOpsRec).toBe(true);
  });

  it("should include phase-based recommendations", () => {
    const profile = createFanProfile();

    const preMatchState = generateStadiumState(MATCH_PHASES.PRE_MATCH, 42);
    const preMatchRecs = getPersonalizedRecommendations(
      profile,
      preMatchState,
      new Date()
    );
    const hasNavigationRec = preMatchRecs.some((r) => r.type === "navigation");
    expect(hasNavigationRec).toBe(true);

    const halfTimeState = generateStadiumState(MATCH_PHASES.HALF_TIME, 42);
    const halfTimeRecs = getPersonalizedRecommendations(
      profile,
      halfTimeState,
      new Date()
    );
    const hasFoodRec = halfTimeRecs.some(
      (r) => r.type === "food" && r.title.includes("Half-Time")
    );
    expect(hasFoodRec).toBe(true);
  });

  it("should include accessibility recommendations when user has needs", () => {
    const profile = createAccessibleFanProfile();
    const state = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
    const recs = getPersonalizedRecommendations(profile, state, new Date());

    const accessibilityRecs = recs.filter((r) => r.type === "accessibility");
    expect(accessibilityRecs.length).toBeGreaterThanOrEqual(2);

    const hasWheelchair = accessibilityRecs.some((r) =>
      r.message.toLowerCase().includes("wheelchair")
    );
    const hasHearing = accessibilityRecs.some((r) =>
      r.message.toLowerCase().includes("hearing")
    );
    expect(hasWheelchair).toBe(true);
    expect(hasHearing).toBe(true);
  });

  it("should NOT include accessibility recs when user has no needs", () => {
    const profile = createFanProfile();
    const state = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
    const recs = getPersonalizedRecommendations(profile, state, new Date());

    const accessibilityRecs = recs.filter((r) => r.type === "accessibility");
    expect(accessibilityRecs.length).toBe(0);
  });

  it("should return at least one recommendation for any valid input", () => {
    const profile = createFanProfile();
    const state = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
    const recs = getPersonalizedRecommendations(profile, state, new Date());

    expect(recs.length).toBeGreaterThan(0);
  });

  it("should handle empty stadium state gracefully", () => {
    const profile = createFanProfile();
    const emptyState: StadiumState = {
      zones: [],
      venues: [],
      incidents: [],
      matchPhase: MATCH_PHASES.FIRST_HALF,
      lastUpdated: new Date().toISOString(),
    };
    const recs = getPersonalizedRecommendations(profile, emptyState, new Date());

    // Should still have at least the phase recommendation
    expect(recs.length).toBeGreaterThan(0);
  });

  it("should assign unique IDs to all recommendations", () => {
    const profile = createFanProfile();
    const state = createStadiumStateWithIncidents();
    const recs = getPersonalizedRecommendations(profile, state, new Date());

    const ids = recs.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("getZoneDensityLevel", () => {
  it("should return 'low' when occupancy is below 40%", () => {
    const zone: StadiumZone = {
      id: "north-lower",
      name: "North Lower Bowl",
      currentOccupancy: 3000,
      maxCapacity: 12000,
      sector: "north",
    };
    expect(getZoneDensityLevel(zone)).toBe("low");
  });

  it("should return 'moderate' when occupancy is between 65-85%", () => {
    const zone: StadiumZone = {
      id: "north-lower",
      name: "North Lower Bowl",
      currentOccupancy: 8400,
      maxCapacity: 12000,
      sector: "north",
    };
    expect(getZoneDensityLevel(zone)).toBe("moderate");
  });

  it("should return 'high' when occupancy is between 85-95%", () => {
    const zone: StadiumZone = {
      id: "north-lower",
      name: "North Lower Bowl",
      currentOccupancy: 10800,
      maxCapacity: 12000,
      sector: "north",
    };
    expect(getZoneDensityLevel(zone)).toBe("high");
  });

  it("should return 'critical' when occupancy is above 95%", () => {
    const zone: StadiumZone = {
      id: "north-lower",
      name: "North Lower Bowl",
      currentOccupancy: 11500,
      maxCapacity: 12000,
      sector: "north",
    };
    expect(getZoneDensityLevel(zone)).toBe("critical");
  });

  it("should handle boundary value at exactly 95%", () => {
    const zone: StadiumZone = {
      id: "north-lower",
      name: "North Lower Bowl",
      currentOccupancy: 11400,
      maxCapacity: 12000,
      sector: "north",
    };
    expect(getZoneDensityLevel(zone)).toBe("critical");
  });
});
