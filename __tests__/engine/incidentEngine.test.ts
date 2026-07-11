/**
 * Unit tests for incidentEngine.
 */

import { describe, it, expect } from "vitest";
import {
  prioritizeIncidents,
  filterByStatus,
  getActiveIncidents,
  countBySeverity,
  assignIncidentToStaff,
  getSeverityLabel,
  getStatusLabel,
} from "@/lib/engine/incidentEngine";
import type { Incident, StaffLocation } from "@/lib/types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_INCIDENTS: readonly Incident[] = [
  { id: "INC-1", title: "Spill", description: "Floor spill", severity: 1, status: "open", zoneId: "north-lower", reportedAt: "2026-07-11T14:00:00Z", assignedTo: null },
  { id: "INC-2", title: "Lost Child", description: "Lost 7yo", severity: 4, status: "open", zoneId: "south-lower", reportedAt: "2026-07-11T14:10:00Z", assignedTo: null },
  { id: "INC-3", title: "Fight", description: "Altercation", severity: 3, status: "in_progress", zoneId: "east-lower", reportedAt: "2026-07-11T14:05:00Z", assignedTo: "STAFF-1" },
  { id: "INC-4", title: "Resolved Item", description: "Done", severity: 2, status: "resolved", zoneId: "west-lower", reportedAt: "2026-07-11T13:50:00Z", assignedTo: "STAFF-2" },
];

const MOCK_STAFF: readonly StaffLocation[] = [
  { staffId: "S1", name: "Officer A", role: "security", currentZone: "south-lower", isAvailable: true },
  { staffId: "S2", name: "Officer B", role: "security", currentZone: "north-lower", isAvailable: true },
  { staffId: "S3", name: "Officer C", role: "security", currentZone: "east-lower", isAvailable: false },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("prioritizeIncidents", () => {
  it("should sort by severity descending (highest first)", () => {
    const sorted = prioritizeIncidents(MOCK_INCIDENTS);
    expect(sorted[0]?.severity).toBe(4);
    expect(sorted[1]?.severity).toBe(3);
  });

  it("should sort by timestamp (newest first) within same severity", () => {
    const sameSeverity: readonly Incident[] = [
      { ...MOCK_INCIDENTS[0]!, id: "A", severity: 2, reportedAt: "2026-07-11T14:00:00Z" },
      { ...MOCK_INCIDENTS[0]!, id: "B", severity: 2, reportedAt: "2026-07-11T14:30:00Z" },
    ];
    const sorted = prioritizeIncidents(sameSeverity);
    expect(sorted[0]?.id).toBe("B");
  });

  it("should not mutate the original array", () => {
    const original = [...MOCK_INCIDENTS];
    prioritizeIncidents(MOCK_INCIDENTS);
    expect(MOCK_INCIDENTS).toEqual(original);
  });
});

describe("filterByStatus", () => {
  it("should filter by 'open' status", () => {
    const open = filterByStatus(MOCK_INCIDENTS, "open");
    expect(open.length).toBe(2);
    expect(open.every((i) => i.status === "open")).toBe(true);
  });

  it("should filter by 'resolved' status", () => {
    const resolved = filterByStatus(MOCK_INCIDENTS, "resolved");
    expect(resolved.length).toBe(1);
  });
});

describe("getActiveIncidents", () => {
  it("should exclude resolved incidents", () => {
    const active = getActiveIncidents(MOCK_INCIDENTS);
    expect(active.length).toBe(3);
    expect(active.some((i) => i.status === "resolved")).toBe(false);
  });
});

describe("countBySeverity", () => {
  it("should count incidents per severity level", () => {
    const counts = countBySeverity(MOCK_INCIDENTS);
    expect(counts[1]).toBe(1);
    expect(counts[2]).toBe(1);
    expect(counts[3]).toBe(1);
    expect(counts[4]).toBe(1);
  });
});

describe("assignIncidentToStaff", () => {
  it("should prefer staff in the same zone as the incident", () => {
    const incident = MOCK_INCIDENTS[1]!; // south-lower
    const assignment = assignIncidentToStaff(incident, MOCK_STAFF);
    expect(assignment?.staffId).toBe("S1"); // Officer A is in south-lower
    expect(assignment?.estimatedResponseMinutes).toBe(2);
  });

  it("should fall back to any available staff if none in zone", () => {
    const incident: Incident = {
      ...MOCK_INCIDENTS[0]!,
      zoneId: "vip-suites",
    };
    const assignment = assignIncidentToStaff(incident, MOCK_STAFF);
    expect(assignment).not.toBeNull();
    expect(assignment?.estimatedResponseMinutes).toBe(6);
  });

  it("should return null when no staff available", () => {
    const noAvailableStaff: readonly StaffLocation[] = [
      { staffId: "S1", name: "Busy", role: "security", currentZone: "north-lower", isAvailable: false },
    ];
    const assignment = assignIncidentToStaff(MOCK_INCIDENTS[0]!, noAvailableStaff);
    expect(assignment).toBeNull();
  });

  it("should skip unavailable staff", () => {
    const incident: Incident = { ...MOCK_INCIDENTS[0]!, zoneId: "east-lower" };
    const assignment = assignIncidentToStaff(incident, MOCK_STAFF);
    // S3 is in east-lower but unavailable, should pick S1 or S2
    expect(assignment?.staffId).not.toBe("S3");
  });
});

describe("getSeverityLabel", () => {
  it("should return correct labels", () => {
    expect(getSeverityLabel(1)).toBe("Low");
    expect(getSeverityLabel(2)).toBe("Medium");
    expect(getSeverityLabel(3)).toBe("High");
    expect(getSeverityLabel(4)).toBe("Critical");
  });

  it("should return 'Unknown' for invalid severity", () => {
    expect(getSeverityLabel(99)).toBe("Unknown");
  });
});

describe("getStatusLabel", () => {
  it("should return correct labels", () => {
    expect(getStatusLabel("open")).toBe("Open");
    expect(getStatusLabel("in_progress")).toBe("In Progress");
    expect(getStatusLabel("resolved")).toBe("Resolved");
  });

  it("should return 'Unknown' for invalid status", () => {
    expect(getStatusLabel("invalid")).toBe("Unknown");
  });
});
