import { ZONE_EXITS } from "@/lib/utils/constants";
import type { EmergencyRoute, StadiumState, Incident } from "@/lib/types";
import type { ZoneId } from "@/lib/utils/constants";

/**
 * Deterministic engine for emergency evacuation routing.
 */
export function getEvacuationRoute(
  userZoneId: ZoneId,
  stadiumState: StadiumState,
): EmergencyRoute {
  // Find incidents that are active and critical
  const criticalIncidentZones = stadiumState.incidents
    .filter((inc: Incident) => inc.status !== "resolved" && inc.severity > 2)
    .map((inc: Incident) => inc.zoneId);

  const nearestExits = ZONE_EXITS[userZoneId] || ["Main Gate"];
  const bestExit = nearestExits[0] || "Main Gate"; // Simplification for demo: pick first exit

  const isZoneCompromised = criticalIncidentZones.includes(userZoneId);

  const instructions = [
    `Proceed calmly to ${bestExit}.`,
    "Follow staff instructions.",
    "Do not use elevators.",
  ];

  if (isZoneCompromised) {
    instructions.unshift(
      "URGENT: Your zone has a reported incident. Evacuate immediately.",
    );
  }

  return {
    userZone: userZoneId,
    nearestExit: bestExit,
    avoidZones: criticalIncidentZones,
    instructions,
    estimatedEvacMinutes: isZoneCompromised ? 3 : 8,
  };
}
