/**
 * Incident Engine — pure functions for incident prioritization and staff assignment.
 * Zero side effects. All calculations are deterministic.
 */

import type { Incident, StaffLocation, IncidentAssignment } from "@/lib/types";
import { INCIDENT_STATUS } from "@/lib/utils/constants";

/** Sort incidents by severity (highest first), then by timestamp (newest first) */
export function prioritizeIncidents(
  incidents: readonly Incident[],
): readonly Incident[] {
  return [...incidents].sort((a, b) => {
    // Higher severity first
    if (b.severity !== a.severity) return b.severity - a.severity;
    // Newer incidents first
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });
}

/** Filter incidents by status */
export function filterByStatus(
  incidents: readonly Incident[],
  status: string,
): readonly Incident[] {
  return incidents.filter((inc) => inc.status === status);
}

/** Get all active (non-resolved) incidents */
export function getActiveIncidents(
  incidents: readonly Incident[],
): readonly Incident[] {
  return incidents.filter((inc) => inc.status !== INCIDENT_STATUS.RESOLVED);
}

/** Count incidents by severity */
export function countBySeverity(
  incidents: readonly Incident[],
): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const inc of incidents) {
    counts[inc.severity] = (counts[inc.severity] ?? 0) + 1;
  }
  return counts;
}

/**
 * Assign the nearest available staff member to an incident.
 * Prioritizes staff in the same zone, then any available staff.
 */
export function assignIncidentToStaff(
  incident: Incident,
  staffLocations: readonly StaffLocation[],
): IncidentAssignment | null {
  const availableStaff = staffLocations.filter((s) => s.isAvailable);

  if (availableStaff.length === 0) return null;

  // Prefer staff in the same zone
  const sameZoneStaff = availableStaff.find(
    (s) => s.currentZone === incident.zoneId,
  );

  const assignedStaff = sameZoneStaff ?? availableStaff[0];

  if (!assignedStaff) return null;

  // Estimate response time (same zone = 2 min, different zone = 5-8 min)
  const estimatedResponseMinutes =
    assignedStaff.currentZone === incident.zoneId ? 2 : 6;

  return {
    incidentId: incident.id,
    staffId: assignedStaff.staffId,
    staffName: assignedStaff.name,
    assignedZone: incident.zoneId,
    estimatedResponseMinutes,
  };
}

/** Get severity label for display */
export function getSeverityLabel(severity: number): string {
  const labels: Record<number, string> = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Critical",
  };
  return labels[severity] ?? "Unknown";
}

/** Get status label for display */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
  };
  return labels[status] ?? "Unknown";
}
