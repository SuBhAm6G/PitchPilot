/**
 * Mock incident data generator.
 * Produces realistic security, medical, and maintenance incidents.
 */

import type { Incident } from "@/lib/types";
import { INCIDENT_SEVERITY, INCIDENT_STATUS } from "@/lib/utils/constants";
import type { ZoneId } from "@/lib/utils/constants";

interface IncidentTemplate {
  readonly title: string;
  readonly description: string;
  readonly severity: (typeof INCIDENT_SEVERITY)[keyof typeof INCIDENT_SEVERITY];
  readonly zone: ZoneId;
}

const INCIDENT_TEMPLATES: readonly IncidentTemplate[] = [
  {
    title: "Medical: Fan Dehydration",
    description:
      "Fan in Section 112 reporting dizziness and dehydration symptoms. First aid requested.",
    severity: INCIDENT_SEVERITY.HIGH,
    zone: "south-lower",
  },
  {
    title: "Crowd Surge Warning",
    description:
      "Density sensors detecting above-threshold crowding near Gate B. Staff rebalancing needed.",
    severity: INCIDENT_SEVERITY.CRITICAL,
    zone: "east-lower",
  },
  {
    title: "Spill Cleanup Required",
    description:
      "Large beverage spill on concourse walkway near food court. Slip hazard flagged.",
    severity: INCIDENT_SEVERITY.LOW,
    zone: "north-lower",
  },
  {
    title: "Unauthorized Area Access",
    description:
      "Individual detected in restricted VIP corridor without credentials. Security dispatched.",
    severity: INCIDENT_SEVERITY.MEDIUM,
    zone: "vip-suites",
  },
  {
    title: "Restroom Out of Service",
    description:
      "Restroom B plumbing failure in West Upper Bowl. Maintenance team notified.",
    severity: INCIDENT_SEVERITY.LOW,
    zone: "west-upper",
  },
  {
    title: "Lost Child Report",
    description:
      "Parent reporting a lost 7-year-old near Section 224. Child wearing a blue Argentina jersey.",
    severity: INCIDENT_SEVERITY.CRITICAL,
    zone: "north-upper",
  },
  {
    title: "Altercation Between Fans",
    description:
      "Verbal altercation escalating in South Upper Bowl, Row 15. Security intervention needed.",
    severity: INCIDENT_SEVERITY.HIGH,
    zone: "south-upper",
  },
  {
    title: "Power Outage: Merchandise Stand",
    description:
      "Electrical fault affecting POS terminals at East Lower merchandise kiosk.",
    severity: INCIDENT_SEVERITY.MEDIUM,
    zone: "east-lower",
  },
];

/** Generate a set of mock incidents with timestamps */
export function generateIncidents(
  count: number = 5,
  seed: number = 42,
): readonly Incident[] {
  const now = Date.now();
  const incidents: Incident[] = [];

  for (let i = 0; i < Math.min(count, INCIDENT_TEMPLATES.length); i++) {
    const template = INCIDENT_TEMPLATES[i];
    if (!template) continue;

    const minutesAgo = Math.round((seed + i * 17) % 60);
    const timestamp = new Date(now - minutesAgo * 60_000).toISOString();

    const statusOptions = [
      INCIDENT_STATUS.OPEN,
      INCIDENT_STATUS.IN_PROGRESS,
      INCIDENT_STATUS.RESOLVED,
    ] as const;
    const statusIndex = (seed + i) % 3;
    const status = statusOptions[statusIndex] ?? INCIDENT_STATUS.OPEN;

    incidents.push({
      id: `INC-${String(1000 + i)}`,
      title: template.title,
      description: template.description,
      severity: template.severity,
      status,
      zoneId: template.zone,
      reportedAt: timestamp,
      assignedTo:
        status !== INCIDENT_STATUS.OPEN ? `STAFF-${String(100 + i)}` : null,
    });
  }

  return incidents;
}
