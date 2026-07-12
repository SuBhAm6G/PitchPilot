/**
 * Deterministic engine for generating role-specific shift briefings.
 */

import type { UserProfile, StadiumState } from "@/lib/types";

function formatZone(zoneId: string): string {
  return zoneId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export interface ShiftBriefing {
  readonly roleName: string;
  readonly location: string;
  readonly primaryDuty: string;
  readonly keyPhrases: readonly string[];
  readonly escalationProtocol: string;
}

export function generateShiftBriefing(profile: UserProfile, state: StadiumState): ShiftBriefing | null {
  if (profile.role !== "staff" && profile.role !== "security") {
    return null;
  }

  const zoneName = formatZone(profile.currentZone);
  let primaryDuty = "Assist fans and monitor crowd flow.";
  let keyPhrases: string[] = ["How can I help you?", "The nearest restroom is that way."];
  let escalationProtocol = "Contact your Zone Supervisor via radio channel 4.";

  // Phase-specific adjustments
  if (state.matchPhase === "pre_match") {
    primaryDuty = "Direct fans to their seats and manage turnstile queues.";
  } else if (state.matchPhase === "half_time") {
    primaryDuty = "Monitor concourse congestion and direct fans to shorter food lines.";
  } else if (state.matchPhase === "post_match") {
    primaryDuty = "Facilitate safe and orderly egress. Direct fans to nearest exits.";
  }

  // Role-specific adjustments
  if (profile.role === "security") {
    primaryDuty = `Maintain perimeter security in ${zoneName}. Check credentials.`;
    escalationProtocol = "Contact Command Center immediately on channel 1.";
  }

  // Language support
  if (profile.preferredLanguage === "es") {
    keyPhrases = ["¿Cómo puedo ayudarle?", "Los baños están por allá."];
  } else if (profile.preferredLanguage === "fr") {
    keyPhrases = ["Comment puis-je vous aider?", "Les toilettes sont par là."];
  }

  return {
    roleName: profile.role === "security" ? "Security Officer" : "Guest Services Volunteer",
    location: zoneName,
    primaryDuty,
    keyPhrases,
    escalationProtocol,
  };
}
