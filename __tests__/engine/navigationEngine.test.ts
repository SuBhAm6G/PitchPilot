/**
 * Unit tests for navigationEngine — Dijkstra routing between stadium zones.
 * Tests shortest path, accessible routing, same-zone navigation, and edge cases.
 */

import { describe, it, expect } from "vitest";
import { calculateRoute } from "@/lib/engine/navigationEngine";
import type { AccessibilityNeeds } from "@/lib/types";
import { ZONE_ADJACENCY, WALKING_SPEED_MPM } from "@/lib/utils/constants";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const defaultAccessibility: AccessibilityNeeds = {
  wheelchairAccess: false,
  visualAssistance: false,
  hearingAssistance: false,
};

const wheelchairAccessibility: AccessibilityNeeds = {
  wheelchairAccess: true,
  visualAssistance: false,
  hearingAssistance: false,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("navigationEngine", () => {
  describe("calculateRoute — same zone", () => {
    it("should return a zero-distance route for same-zone navigation", () => {
      const route = calculateRoute("north-lower", "north-lower", defaultAccessibility);
      expect(route).not.toBeNull();
      expect(route!.totalDistanceMeters).toBe(0);
      expect(route!.totalEstimatedMinutes).toBe(0);
      expect(route!.steps).toHaveLength(1);
      expect(route!.steps[0]!.instruction).toContain("already here");
    });
  });

  describe("calculateRoute — adjacent zones", () => {
    it("should return a direct one-step route for adjacent zones", () => {
      const route = calculateRoute("north-lower", "north-upper", defaultAccessibility);
      expect(route).not.toBeNull();
      expect(route!.steps).toHaveLength(1);
      expect(route!.totalDistanceMeters).toBe(ZONE_ADJACENCY["north-lower"]["north-upper"]);
    });

    it("should include human-readable instructions in each step", () => {
      const route = calculateRoute("north-lower", "north-upper", defaultAccessibility);
      expect(route).not.toBeNull();
      for (const step of route!.steps) {
        expect(step.instruction).toBeTruthy();
        expect(step.instruction.length).toBeGreaterThan(5);
      }
    });
  });

  describe("calculateRoute — multi-hop", () => {
    it("should find a route from north-lower to south-lower via intermediate zones", () => {
      const route = calculateRoute("north-lower", "south-lower", defaultAccessibility);
      expect(route).not.toBeNull();
      expect(route!.steps.length).toBeGreaterThanOrEqual(2);
      expect(route!.totalDistanceMeters).toBeGreaterThan(0);
    });

    it("should produce totalDistanceMeters as sum of step distances", () => {
      const route = calculateRoute("north-lower", "south-lower", defaultAccessibility);
      expect(route).not.toBeNull();
      const stepSum = route!.steps.reduce((sum, s) => sum + s.distanceMeters, 0);
      expect(route!.totalDistanceMeters).toBe(stepSum);
    });

    it("should calculate totalEstimatedMinutes based on walking speed", () => {
      const route = calculateRoute("north-lower", "south-lower", defaultAccessibility);
      expect(route).not.toBeNull();
      const expectedMinutes = Math.ceil(route!.totalDistanceMeters / WALKING_SPEED_MPM);
      expect(route!.totalEstimatedMinutes).toBe(expectedMinutes);
    });
  });

  describe("calculateRoute — accessibility", () => {
    it("should calculate slower time for wheelchair users", () => {
      const standardRoute = calculateRoute("north-lower", "south-lower", defaultAccessibility);
      const accessibleRoute = calculateRoute("north-lower", "south-lower", wheelchairAccessibility);
      expect(standardRoute).not.toBeNull();
      expect(accessibleRoute).not.toBeNull();
      // Wheelchair should take longer or same time (slower speed)
      expect(accessibleRoute!.totalEstimatedMinutes).toBeGreaterThanOrEqual(standardRoute!.totalEstimatedMinutes);
    });

    it("should mark routes as accessible", () => {
      const route = calculateRoute("north-lower", "north-upper", defaultAccessibility);
      expect(route).not.toBeNull();
      expect(route!.isAccessible).toBe(true);
    });
  });

  describe("calculateRoute — VIP suites", () => {
    it("should route to VIP suites via west-lower", () => {
      const route = calculateRoute("north-lower", "vip-suites", defaultAccessibility);
      expect(route).not.toBeNull();
      expect(route!.steps.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("calculateRoute — determinism", () => {
    it("should produce identical output for identical input", () => {
      const route1 = calculateRoute("east-lower", "west-upper", defaultAccessibility);
      const route2 = calculateRoute("east-lower", "west-upper", defaultAccessibility);
      expect(route1).toEqual(route2);
    });
  });
});
