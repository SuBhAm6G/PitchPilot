/**
 * Unit tests for emergencyEngine — evacuation routing and incident response.
 * Tests zone compromise detection, exit selection, instructions, and edge cases.
 */

import { describe, it, expect } from "vitest";
import { getEvacuationRoute } from "@/lib/engine/emergencyEngine";
import type { StadiumState, Incident } from "@/lib/types";
import { generateStadiumState } from "@/lib/data/mockStadiumData";
import {
  MATCH_PHASES,
  ZONE_EXITS,
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
} from "@/lib/utils/constants";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function createIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: "inc-test-001",
    title: "Test Incident",
    description: "A test incident",
    severity: INCIDENT_SEVERITY.HIGH,
    status: INCIDENT_STATUS.OPEN,
    zoneId: "north-lower",
    reportedAt: new Date().toISOString(),
    assignedTo: null,
    ...overrides,
  };
}

function createStateWithIncidents(incidents: Incident[]): StadiumState {
  const base = generateStadiumState(MATCH_PHASES.FIRST_HALF, 42);
  return { ...base, incidents };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("emergencyEngine", () => {
  describe("getEvacuationRoute — basic", () => {
    it("should return a valid EmergencyRoute object", () => {
      const state = createStateWithIncidents([]);
      const route = getEvacuationRoute("north-lower", state);
      expect(route).toBeDefined();
      expect(route.userZone).toBe("north-lower");
      expect(route.nearestExit).toBeTruthy();
      expect(Array.isArray(route.instructions)).toBe(true);
      expect(route.instructions.length).toBeGreaterThanOrEqual(1);
      expect(route.estimatedEvacMinutes).toBeGreaterThan(0);
    });

    it("should select the first exit from ZONE_EXITS for the given zone", () => {
      const state = createStateWithIncidents([]);
      const route = getEvacuationRoute("south-lower", state);
      const expectedExits = ZONE_EXITS["south-lower"];
      expect(expectedExits).toContain(route.nearestExit);
    });

    it("should return default evacuation time when no incidents in zone", () => {
      const state = createStateWithIncidents([]);
      const route = getEvacuationRoute("east-lower", state);
      expect(route.estimatedEvacMinutes).toBe(8); // non-compromised default
    });
  });

  describe("getEvacuationRoute — zone compromise", () => {
    it("should detect a compromised zone and add URGENT instruction", () => {
      const incident = createIncident({
        zoneId: "north-lower",
        severity: INCIDENT_SEVERITY.HIGH,
      });
      const state = createStateWithIncidents([incident]);
      const route = getEvacuationRoute("north-lower", state);
      expect(route.instructions[0]).toContain("URGENT");
      expect(route.estimatedEvacMinutes).toBe(3); // urgent evac time
    });

    it("should include the incident zone in avoidZones", () => {
      const incident = createIncident({
        zoneId: "north-lower",
        severity: INCIDENT_SEVERITY.CRITICAL,
      });
      const state = createStateWithIncidents([incident]);
      const route = getEvacuationRoute("north-lower", state);
      expect(route.avoidZones).toContain("north-lower");
    });

    it("should not flag zone as compromised if incident is resolved", () => {
      const resolved = createIncident({
        zoneId: "north-lower",
        status: INCIDENT_STATUS.RESOLVED,
      });
      const state = createStateWithIncidents([resolved]);
      const route = getEvacuationRoute("north-lower", state);
      expect(route.estimatedEvacMinutes).toBe(8);
      expect(route.instructions[0]).not.toContain("URGENT");
    });

    it("should not flag zone as compromised for low severity incidents", () => {
      const lowSev = createIncident({
        zoneId: "north-lower",
        severity: INCIDENT_SEVERITY.LOW,
      });
      const state = createStateWithIncidents([lowSev]);
      const route = getEvacuationRoute("north-lower", state);
      expect(route.estimatedEvacMinutes).toBe(8);
    });
  });

  describe("getEvacuationRoute — instructions", () => {
    it("should always include 'Follow staff instructions'", () => {
      const state = createStateWithIncidents([]);
      const route = getEvacuationRoute("west-lower", state);
      expect(route.instructions.some((i) => i.includes("staff"))).toBe(true);
    });

    it("should always include 'Do not use elevators'", () => {
      const state = createStateWithIncidents([]);
      const route = getEvacuationRoute("vip-suites", state);
      expect(route.instructions.some((i) => i.includes("elevators"))).toBe(
        true,
      );
    });
  });

  describe("getEvacuationRoute — determinism", () => {
    it("should produce identical output for identical input", () => {
      const state = createStateWithIncidents([]);
      const route1 = getEvacuationRoute("east-upper", state);
      const route2 = getEvacuationRoute("east-upper", state);
      expect(route1).toEqual(route2);
    });
  });

  describe("getEvacuationRoute — all zones coverage", () => {
    it("should return a valid route for every defined zone", () => {
      const state = createStateWithIncidents([]);
      const zones = [
        "north-lower",
        "north-upper",
        "south-lower",
        "south-upper",
        "east-lower",
        "east-upper",
        "west-lower",
        "west-upper",
        "vip-suites",
      ] as const;
      for (const zone of zones) {
        const route = getEvacuationRoute(zone, state);
        expect(route.userZone).toBe(zone);
        expect(route.nearestExit).toBeTruthy();
      }
    });
  });
});
