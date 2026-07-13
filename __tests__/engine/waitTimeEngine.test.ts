/**
 * Unit tests for waitTimeEngine.
 */

import { describe, it, expect } from "vitest";
import {
  classifyWaitTime,
  estimateWaitTime,
  findShortestQueue,
  getWaitTimesByType,
  averageWaitTime,
} from "@/lib/engine/waitTimeEngine";
import type { Venue } from "@/lib/types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_VENUES: readonly Venue[] = [
  {
    id: "v1",
    name: "Food A",
    type: "food_court",
    zoneId: "north-lower",
    currentQueueLength: 10,
    estimatedWaitMinutes: 4,
    isOpen: true,
  },
  {
    id: "v2",
    name: "Food B",
    type: "food_court",
    zoneId: "south-lower",
    currentQueueLength: 25,
    estimatedWaitMinutes: 12,
    isOpen: true,
  },
  {
    id: "v3",
    name: "Food C",
    type: "food_court",
    zoneId: "north-lower",
    currentQueueLength: 30,
    estimatedWaitMinutes: 15,
    isOpen: false,
  },
  {
    id: "v4",
    name: "Restroom A",
    type: "restroom",
    zoneId: "north-lower",
    currentQueueLength: 8,
    estimatedWaitMinutes: 2,
    isOpen: true,
  },
  {
    id: "v5",
    name: "Restroom B",
    type: "restroom",
    zoneId: "south-lower",
    currentQueueLength: 20,
    estimatedWaitMinutes: 7,
    isOpen: true,
  },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("classifyWaitTime", () => {
  it("should return 'short' for 0-5 minutes", () => {
    expect(classifyWaitTime(0)).toBe("short");
    expect(classifyWaitTime(3)).toBe("short");
    expect(classifyWaitTime(5)).toBe("short");
  });

  it("should return 'moderate' for 6-10 minutes", () => {
    expect(classifyWaitTime(6)).toBe("moderate");
    expect(classifyWaitTime(10)).toBe("moderate");
  });

  it("should return 'long' for 11-20 minutes", () => {
    expect(classifyWaitTime(15)).toBe("long");
    expect(classifyWaitTime(20)).toBe("long");
  });

  it("should return 'excessive' for >20 minutes", () => {
    expect(classifyWaitTime(25)).toBe("excessive");
    expect(classifyWaitTime(60)).toBe("excessive");
  });
});

describe("estimateWaitTime", () => {
  it("should calculate wait time from queue length and service rate", () => {
    const venue = MOCK_VENUES[0]!;
    const estimate = estimateWaitTime(venue);
    // Food court service rate = 2.5 per min; 10 / 2.5 = 4
    expect(estimate.estimatedMinutes).toBe(4);
    expect(estimate.level).toBe("short");
  });

  it("should classify the estimated wait time", () => {
    const venue = MOCK_VENUES[1]!;
    const estimate = estimateWaitTime(venue);
    // 25 / 2.5 = 10
    expect(estimate.estimatedMinutes).toBe(10);
    expect(estimate.level).toBe("moderate");
  });

  it("should include venue metadata in the estimate", () => {
    const venue = MOCK_VENUES[0]!;
    const estimate = estimateWaitTime(venue);
    expect(estimate.venueId).toBe("v1");
    expect(estimate.venueName).toBe("Food A");
    expect(estimate.venueType).toBe("food_court");
    expect(estimate.zoneId).toBe("north-lower");
  });
});

describe("findShortestQueue", () => {
  it("should find the venue with the shortest wait time", () => {
    const result = findShortestQueue(MOCK_VENUES, "food_court");
    expect(result?.id).toBe("v1");
  });

  it("should exclude closed venues", () => {
    const result = findShortestQueue(MOCK_VENUES, "food_court");
    expect(result?.id).not.toBe("v3");
  });

  it("should prioritize venues in the user's zone", () => {
    const result = findShortestQueue(MOCK_VENUES, "food_court", "north-lower");
    expect(result?.id).toBe("v1");
    expect(result?.zoneId).toBe("north-lower");
  });

  it("should return undefined when no venues match", () => {
    const result = findShortestQueue(MOCK_VENUES, "first_aid");
    expect(result).toBeUndefined();
  });
});

describe("getWaitTimesByType", () => {
  it("should return wait times sorted by estimated minutes", () => {
    const waits = getWaitTimesByType(MOCK_VENUES, "food_court");
    expect(waits.length).toBe(2); // only open venues
    if (waits[0] && waits[1]) {
      expect(waits[0].estimatedMinutes).toBeLessThanOrEqual(
        waits[1].estimatedMinutes,
      );
    }
  });
});

describe("averageWaitTime", () => {
  it("should calculate average wait across open venues", () => {
    const avg = averageWaitTime(MOCK_VENUES, "food_court");
    // Two open food courts: (4 + 12) / 2 = 8
    expect(avg).toBe(8);
  });

  it("should return 0 when no venues match", () => {
    const avg = averageWaitTime(MOCK_VENUES, "first_aid");
    expect(avg).toBe(0);
  });
});
