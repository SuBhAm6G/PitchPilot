/**
 * Unit tests for crowdAnalyticsEngine.
 */

import { describe, it, expect } from "vitest";
import {
  calculateDensityLevel,
  generateCrowdReport,
  identifyBottlenecks,
  calculateTotalOccupancy,
  predictCrowdFlow,
} from "@/lib/engine/crowdAnalyticsEngine";
import type { StadiumZone } from "@/lib/types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_ZONES: readonly StadiumZone[] = [
  {
    id: "north-lower",
    name: "North Lower",
    currentOccupancy: 3000,
    maxCapacity: 12000,
    sector: "north",
  },
  {
    id: "south-lower",
    name: "South Lower",
    currentOccupancy: 10800,
    maxCapacity: 12000,
    sector: "south",
  },
  {
    id: "east-lower",
    name: "East Lower",
    currentOccupancy: 11000,
    maxCapacity: 11000,
    sector: "east",
  },
  {
    id: "west-lower",
    name: "West Lower",
    currentOccupancy: 7700,
    maxCapacity: 11000,
    sector: "west",
  },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("calculateDensityLevel", () => {
  it("should return 'low' for 25% occupancy", () => {
    expect(calculateDensityLevel(MOCK_ZONES[0]!)).toBe("low");
  });

  it("should return 'high' for 90% occupancy", () => {
    expect(calculateDensityLevel(MOCK_ZONES[1]!)).toBe("high");
  });

  it("should return 'critical' for 100% occupancy", () => {
    expect(calculateDensityLevel(MOCK_ZONES[2]!)).toBe("critical");
  });

  it("should return 'moderate' for 70% occupancy", () => {
    expect(calculateDensityLevel(MOCK_ZONES[3]!)).toBe("moderate");
  });
});

describe("generateCrowdReport", () => {
  it("should generate a report for every zone", () => {
    const report = generateCrowdReport(MOCK_ZONES);
    expect(report.length).toBe(MOCK_ZONES.length);
  });

  it("should calculate correct occupancy percentages", () => {
    const report = generateCrowdReport(MOCK_ZONES);
    const northReport = report.find((r) => r.zoneId === "north-lower");
    expect(northReport?.occupancyPercent).toBe(25);
  });

  it("should clamp percentages between 0 and 100", () => {
    const report = generateCrowdReport(MOCK_ZONES);
    for (const zone of report) {
      expect(zone.occupancyPercent).toBeGreaterThanOrEqual(0);
      expect(zone.occupancyPercent).toBeLessThanOrEqual(100);
    }
  });
});

describe("identifyBottlenecks", () => {
  it("should identify zones with >= 85% density", () => {
    const bottlenecks = identifyBottlenecks(MOCK_ZONES);
    expect(bottlenecks.length).toBe(2); // south-lower (90%) and east-lower (100%)
  });

  it("should return empty array when no bottlenecks", () => {
    const lowZones: readonly StadiumZone[] = [
      {
        id: "north-lower",
        name: "North",
        currentOccupancy: 1000,
        maxCapacity: 12000,
        sector: "north",
      },
    ];
    expect(identifyBottlenecks(lowZones).length).toBe(0);
  });
});

describe("calculateTotalOccupancy", () => {
  it("should sum all zone occupancies", () => {
    const result = calculateTotalOccupancy(MOCK_ZONES);
    expect(result.totalOccupancy).toBe(3000 + 10800 + 11000 + 7700);
  });

  it("should sum all zone capacities", () => {
    const result = calculateTotalOccupancy(MOCK_ZONES);
    expect(result.totalCapacity).toBe(12000 + 12000 + 11000 + 11000);
  });

  it("should calculate correct percentage", () => {
    const result = calculateTotalOccupancy(MOCK_ZONES);
    const expected = Math.round(
      ((3000 + 10800 + 11000 + 7700) / (12000 + 12000 + 11000 + 11000)) * 100,
    );
    expect(result.occupancyPercent).toBe(expected);
  });

  it("should handle empty zones array", () => {
    const result = calculateTotalOccupancy([]);
    expect(result.totalOccupancy).toBe(0);
    expect(result.totalCapacity).toBe(0);
    expect(result.occupancyPercent).toBe(0);
  });
});

describe("predictCrowdFlow", () => {
  it("should return predictions for every zone", () => {
    const predictions = predictCrowdFlow(MOCK_ZONES, 15);
    expect(predictions.length).toBe(MOCK_ZONES.length);
  });

  it("should have predicted percentages within valid range (0-100)", () => {
    const predictions = predictCrowdFlow(MOCK_ZONES, 15);
    for (const pred of predictions) {
      expect(pred.predictedOccupancyPercent).toBeGreaterThanOrEqual(0);
      expect(pred.predictedOccupancyPercent).toBeLessThanOrEqual(100);
    }
  });

  it("should include the time window in predictions", () => {
    const predictions = predictCrowdFlow(MOCK_ZONES, 30);
    for (const pred of predictions) {
      expect(pred.timeWindowMinutes).toBe(30);
    }
  });
});
