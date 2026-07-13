import { describe, it, expect } from "vitest";
import { calculateSustainability } from "@/lib/engine/sustainabilityEngine";
import type { UserProfile } from "@/lib/types";

const baseProfile: UserProfile = {
  id: "fan-1",
  name: "Test Fan",
  role: "fan",
  stadiumId: "metlife",
  currentZone: "north-lower",
  preferredLanguage: "en",
  accessibilityNeeds: {
    wheelchairAccess: false,
    visualAssistance: false,
    hearingAssistance: false,
  },
};

describe("sustainabilityEngine", () => {
  it("should calculate zero savings for single driver", () => {
    const profile = {
      ...baseProfile,
      travelMethod: "car" as const,
      groupSize: 1,
    };
    const metrics = calculateSustainability(profile);
    expect(metrics.co2SavedKg).toBe(0);
    expect(metrics.badgeEarned).toBe(false);
  });

  it("should calculate savings for transit", () => {
    const profile = { ...baseProfile, travelMethod: "transit" as const };
    const metrics = calculateSustainability(profile);
    expect(metrics.co2SavedKg).toBeGreaterThan(0);
    expect(metrics.badgeEarned).toBe(true);
    expect(metrics.message).toMatch(/transit/);
  });

  it("should calculate max savings for walking", () => {
    const profile = { ...baseProfile, travelMethod: "walk" as const };
    const metrics = calculateSustainability(profile);
    expect(metrics.co2SavedKg).toBeGreaterThan(3);
    expect(metrics.badgeEarned).toBe(true);
    expect(metrics.message).toMatch(/Zero emissions/);
  });

  it("should calculate savings for carpooling", () => {
    const profile = {
      ...baseProfile,
      travelMethod: "car" as const,
      groupSize: 4,
    };
    const metrics = calculateSustainability(profile);
    expect(metrics.co2SavedKg).toBeGreaterThan(0);
    expect(metrics.badgeEarned).toBe(true);
    expect(metrics.message).toMatch(/Carpooling/);
  });

  it("should default to car/1 if not provided", () => {
    const metrics = calculateSustainability(baseProfile);
    expect(metrics.co2SavedKg).toBe(0);
  });
});
