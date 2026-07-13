/**
 * Context Decision Engine — the brain of PitchPilot.
 *
 * Orchestrates phase, role, and accessibility recommendation sub-modules.
 * Pure, deterministic function that takes user profile + stadium state
 * and outputs personalized, prioritized recommendations.
 * Zero side effects. Fully unit-testable.
 */

import type {
  UserProfile,
  StadiumState,
  StadiumZone,
  ContextRecommendation,
} from "@/lib/types";
import type { RecommendationType, RecommendationIcon } from "@/lib/types";
import type { RecommendationPriority } from "@/lib/utils/constants";
import { CROWD_DENSITY_LEVELS } from "@/lib/utils/constants";
import { getPhaseRecommendations } from "@/lib/engine/phaseRecommendations";
import { getRoleRecommendations } from "@/lib/engine/roleRecommendations";
import {
  hasAccessibilityNeeds,
  getAccessibilityRecommendations,
} from "@/lib/engine/accessibilityRecommendations";

// ─── Recommendation Factory ─────────────────────────────────────────────────

let recommendationCounter = 0;

function makeId(): string {
  recommendationCounter += 1;
  return `rec-${String(recommendationCounter)}`;
}

/** Create a typed ContextRecommendation. Exported for sub-modules. */
export function makeRecommendation(
  type: RecommendationType,
  title: string,
  message: string,
  priority: RecommendationPriority,
  icon: RecommendationIcon,
): ContextRecommendation {
  return { id: makeId(), type, title, message, priority, icon };
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Generate personalized recommendations based on user context and stadium state.
 * This is the primary export consumed by the UI and chat system.
 */
export function getPersonalizedRecommendations(
  profile: UserProfile,
  stadiumState: StadiumState,
): readonly ContextRecommendation[] {
  recommendationCounter = 0;

  const recommendations: ContextRecommendation[] = [
    ...getPhaseRecommendations(stadiumState.matchPhase),
    ...getRoleRecommendations(profile, stadiumState),
  ];

  if (hasAccessibilityNeeds(profile)) {
    recommendations.push(...getAccessibilityRecommendations(profile));
  }

  // Sort by priority (highest first)
  return [...recommendations].sort((a, b) => b.priority - a.priority);
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Exported for testing — determine density-based zone status */
export function getZoneDensityLevel(
  zone: StadiumZone,
): "low" | "moderate" | "high" | "critical" {
  const ratio = zone.currentOccupancy / zone.maxCapacity;
  if (ratio >= CROWD_DENSITY_LEVELS.CRITICAL) return "critical";
  if (ratio >= CROWD_DENSITY_LEVELS.HIGH) return "high";
  if (ratio >= CROWD_DENSITY_LEVELS.MODERATE) return "moderate";
  return "low";
}
