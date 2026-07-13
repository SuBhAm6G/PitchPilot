/**
 * Unit tests for Zod validation schemas.
 * Proves schemas accept valid data and reject malformed data.
 */

import { describe, it, expect } from "vitest";
import {
  userProfileSchema,
  chatRequestSchema,
  llmResponseSchema,
  incidentSchema,
  stadiumZoneSchema,
} from "@/lib/schemas";

describe("userProfileSchema", () => {
  it("should accept a valid user profile", () => {
    const valid = {
      id: "user-001",
      name: "John",
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
    const result = userProfileSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should reject missing required fields", () => {
    const invalid = { id: "user-001" };
    const result = userProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should reject invalid role", () => {
    const invalid = {
      id: "user-001",
      name: "John",
      role: "admin",
      stadiumId: "metlife",
      currentZone: "north-lower",
      preferredLanguage: "en",
      accessibilityNeeds: {
        wheelchairAccess: false,
        visualAssistance: false,
        hearingAssistance: false,
      },
    };
    const result = userProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should reject invalid zone", () => {
    const invalid = {
      id: "user-001",
      name: "John",
      role: "fan",
      stadiumId: "metlife",
      currentZone: "invalid-zone",
      preferredLanguage: "en",
      accessibilityNeeds: {
        wheelchairAccess: false,
        visualAssistance: false,
        hearingAssistance: false,
      },
    };
    const result = userProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("stadiumZoneSchema", () => {
  it("should accept valid zone data", () => {
    const valid = {
      id: "north-lower",
      name: "North Lower Bowl",
      currentOccupancy: 5000,
      maxCapacity: 12000,
      sector: "north",
    };
    const result = stadiumZoneSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should reject negative occupancy", () => {
    const invalid = {
      id: "north-lower",
      name: "North Lower Bowl",
      currentOccupancy: -100,
      maxCapacity: 12000,
      sector: "north",
    };
    const result = stadiumZoneSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("incidentSchema", () => {
  it("should accept valid incident", () => {
    const valid = {
      id: "INC-001",
      title: "Test Incident",
      description: "A test",
      severity: 3,
      status: "open",
      zoneId: "north-lower",
      reportedAt: "2026-07-11T14:00:00Z",
      assignedTo: null,
    };
    const result = incidentSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should reject invalid severity value", () => {
    const invalid = {
      id: "INC-001",
      title: "Test",
      description: "A test",
      severity: 5,
      status: "open",
      zoneId: "north-lower",
      reportedAt: "2026-07-11T14:00:00Z",
      assignedTo: null,
    };
    const result = incidentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("chatRequestSchema", () => {
  it("should reject empty messages", () => {
    const invalid = {
      message: "",
      userProfile: {
        id: "u1",
        name: "Fan",
        role: "fan",
        currentZone: "north-lower",
        preferredLanguage: "en",
        accessibilityNeeds: {
          wheelchairAccess: false,
          visualAssistance: false,
          hearingAssistance: false,
        },
      },
      stadiumState: {
        zones: [],
        venues: [],
        incidents: [],
        matchPhase: "first_half",
        lastUpdated: "2026-07-11T14:00:00Z",
      },
    };
    const result = chatRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("llmResponseSchema", () => {
  it("should accept valid LLM response", () => {
    const valid = {
      reply: "Here is some food info.",
      recommendations: [
        {
          type: "food",
          title: "Food Option",
          message: "Try the grill!",
          priority: 2,
          icon: "utensils",
        },
      ],
    };
    const result = llmResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should reject malformed LLM response (missing reply)", () => {
    const invalid = {
      recommendations: [],
    };
    const result = llmResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should reject invalid recommendation type", () => {
    const invalid = {
      reply: "Hello",
      recommendations: [
        {
          type: "invalid_type",
          title: "Bad",
          message: "Bad rec",
          priority: 1,
          icon: "info",
        },
      ],
    };
    const result = llmResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
