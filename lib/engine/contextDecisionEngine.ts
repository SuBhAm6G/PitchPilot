/**
 * Context Decision Engine — the brain of PitchPilot.
 *
 * Pure, deterministic function that takes user profile + stadium state
 * and outputs personalized, prioritized recommendations.
 * Zero side effects. Fully unit-testable.
 */

import type {
  UserProfile,
  StadiumState,
  ContextRecommendation,
  StadiumZone,
  Venue,
} from "@/lib/types";
import type { RecommendationType, RecommendationIcon } from "@/lib/types";
import {
  CROWD_DENSITY_LEVELS,
  USER_ROLES,
  MATCH_PHASES,
  RECOMMENDATION_PRIORITY,
  VENUE_TYPES,
} from "@/lib/utils/constants";
import type { MatchPhase, RecommendationPriority } from "@/lib/utils/constants";

let recommendationCounter = 0;

function makeId(): string {
  recommendationCounter += 1;
  return `rec-${String(recommendationCounter)}`;
}

function makeRecommendation(
  type: RecommendationType,
  title: string,
  message: string,
  priority: RecommendationPriority,
  icon: RecommendationIcon
): ContextRecommendation {
  return { id: makeId(), type, title, message, priority, icon };
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function getPersonalizedRecommendations(
  profile: UserProfile,
  stadiumState: StadiumState,
  currentTime: Date
): readonly ContextRecommendation[] {
  recommendationCounter = 0;
  const recommendations: ContextRecommendation[] = [];

  // Phase-based recommendations (universal)
  recommendations.push(...getPhaseRecommendations(stadiumState.matchPhase));

  // Role-specific recommendations
  if (profile.role === USER_ROLES.FAN) {
    recommendations.push(
      ...getFanRecommendations(profile, stadiumState, currentTime)
    );
  } else {
    recommendations.push(
      ...getStaffRecommendations(profile, stadiumState)
    );
  }

  // Accessibility recommendations
  if (hasAccessibilityNeeds(profile)) {
    recommendations.push(...getAccessibilityRecommendations(profile));
  }

  // Sort by priority (highest first)
  return [...recommendations].sort((a, b) => b.priority - a.priority);
}

// ─── Phase-Based ─────────────────────────────────────────────────────────────

function getPhaseRecommendations(
  phase: MatchPhase
): readonly ContextRecommendation[] {
  const phaseMessages: Record<MatchPhase, ContextRecommendation> = {
    [MATCH_PHASES.PRE_MATCH]: makeRecommendation(
      "navigation",
      "Welcome to MetLife Stadium",
      "Gates are open. Find your seat early to avoid the rush! Use the stadium map for the quickest route.",
      RECOMMENDATION_PRIORITY.MEDIUM,
      "map"
    ),
    [MATCH_PHASES.FIRST_HALF]: makeRecommendation(
      "general",
      "Match in Progress",
      "The first half is underway. Food courts have short wait times right now — great time to grab a snack!",
      RECOMMENDATION_PRIORITY.LOW,
      "info"
    ),
    [MATCH_PHASES.HALF_TIME]: makeRecommendation(
      "food",
      "Half-Time Rush Alert",
      "Food courts and restrooms are busy. Consider venues in less crowded zones for shorter waits.",
      RECOMMENDATION_PRIORITY.HIGH,
      "utensils"
    ),
    [MATCH_PHASES.SECOND_HALF]: makeRecommendation(
      "general",
      "Second Half Underway",
      "The match is heating up! Stay in your seat for the best experience.",
      RECOMMENDATION_PRIORITY.LOW,
      "info"
    ),
    [MATCH_PHASES.POST_MATCH]: makeRecommendation(
      "navigation",
      "Exit Strategy",
      "The match has ended. Use exit gates in less crowded zones to avoid congestion. Check the map for recommended routes.",
      RECOMMENDATION_PRIORITY.HIGH,
      "map"
    ),
  };

  return [phaseMessages[phase]];
}

// ─── Fan Recommendations ─────────────────────────────────────────────────────

function getFanRecommendations(
  profile: UserProfile,
  state: StadiumState,
  _currentTime: Date
): readonly ContextRecommendation[] {
  const results: ContextRecommendation[] = [];
  const userZone = state.zones.find((z) => z.id === profile.currentZone);

  // Crowd alert for current zone
  if (userZone) {
    const density = userZone.currentOccupancy / userZone.maxCapacity;
    if (density >= CROWD_DENSITY_LEVELS.HIGH) {
      results.push(
        makeRecommendation(
          "crowd_alert",
          "Your Zone is Crowded",
          `${userZone.name} is at ${Math.round(density * 100)}% capacity. Consider moving to a less busy area.`,
          RECOMMENDATION_PRIORITY.HIGH,
          "users"
        )
      );
    }
  }

  // Best food option (shortest wait in or near user's zone)
  const nearestFood = findBestVenue(state.venues, profile.currentZone, VENUE_TYPES.FOOD_COURT);
  if (nearestFood) {
    results.push(
      makeRecommendation(
        "food",
        "Nearest Food Option",
        `${nearestFood.name} has a ~${String(nearestFood.estimatedWaitMinutes)} min wait (queue: ${String(nearestFood.currentQueueLength)} people).`,
        RECOMMENDATION_PRIORITY.MEDIUM,
        "utensils"
      )
    );
  }

  // Best restroom option
  const nearestRestroom = findBestVenue(state.venues, profile.currentZone, VENUE_TYPES.RESTROOM);
  if (nearestRestroom) {
    results.push(
      makeRecommendation(
        "restroom",
        "Nearest Restroom",
        `${nearestRestroom.name} — ~${String(nearestRestroom.estimatedWaitMinutes)} min wait.`,
        RECOMMENDATION_PRIORITY.MEDIUM,
        "toilet"
      )
    );
  }

  return results;
}

// ─── Staff Recommendations ───────────────────────────────────────────────────

function getStaffRecommendations(
  profile: UserProfile,
  state: StadiumState
): readonly ContextRecommendation[] {
  const results: ContextRecommendation[] = [];

  // Critical zone alerts
  const criticalZones = state.zones.filter(
    (z) => z.currentOccupancy / z.maxCapacity >= CROWD_DENSITY_LEVELS.CRITICAL
  );

  for (const zone of criticalZones) {
    const density = Math.round((zone.currentOccupancy / zone.maxCapacity) * 100);
    results.push(
      makeRecommendation(
        "crowd_alert",
        `CRITICAL: ${zone.name}`,
        `Zone at ${String(density)}% capacity. Immediate crowd management required.`,
        RECOMMENDATION_PRIORITY.URGENT,
        "alert"
      )
    );
  }

  // Open incidents in user's zone
  const zoneIncidents = state.incidents.filter(
    (inc) => inc.zoneId === profile.currentZone && inc.status !== "resolved"
  );

  for (const incident of zoneIncidents) {
    results.push(
      makeRecommendation(
        "incident",
        incident.title,
        incident.description,
        incident.severity >= 3
          ? RECOMMENDATION_PRIORITY.URGENT
          : RECOMMENDATION_PRIORITY.MEDIUM,
        "alert"
      )
    );
  }

  // Bottleneck warnings
  const highDensityZones = state.zones.filter(
    (z) =>
      z.currentOccupancy / z.maxCapacity >= CROWD_DENSITY_LEVELS.HIGH &&
      z.currentOccupancy / z.maxCapacity < CROWD_DENSITY_LEVELS.CRITICAL
  );

  if (highDensityZones.length > 0) {
    const zoneNames = highDensityZones.map((z) => z.name).join(", ");
    results.push(
      makeRecommendation(
        "crowd_alert",
        "Bottleneck Warning",
        `High density detected in: ${zoneNames}. Consider proactive crowd flow measures.`,
        RECOMMENDATION_PRIORITY.HIGH,
        "users"
      )
    );
  }

  return results;
}

// ─── Accessibility ───────────────────────────────────────────────────────────

function hasAccessibilityNeeds(profile: UserProfile): boolean {
  return (
    profile.accessibilityNeeds.wheelchairAccess ||
    profile.accessibilityNeeds.visualAssistance ||
    profile.accessibilityNeeds.hearingAssistance
  );
}

function getAccessibilityRecommendations(
  profile: UserProfile
): readonly ContextRecommendation[] {
  const results: ContextRecommendation[] = [];

  if (profile.accessibilityNeeds.wheelchairAccess) {
    results.push(
      makeRecommendation(
        "accessibility",
        "Accessible Routes Available",
        "Wheelchair-accessible paths and elevators are available in all zones. Use gates marked with the accessibility symbol for priority entry.",
        RECOMMENDATION_PRIORITY.HIGH,
        "wheelchair"
      )
    );
  }

  if (profile.accessibilityNeeds.visualAssistance) {
    results.push(
      makeRecommendation(
        "accessibility",
        "Audio Assistance Available",
        "Audio description services and tactile guides are available at the information desk near your zone.",
        RECOMMENDATION_PRIORITY.HIGH,
        "wheelchair"
      )
    );
  }

  if (profile.accessibilityNeeds.hearingAssistance) {
    results.push(
      makeRecommendation(
        "accessibility",
        "Hearing Loop Active",
        "This stadium has hearing loop systems in all lower bowl sections. Switch your hearing aid to the T-coil setting.",
        RECOMMENDATION_PRIORITY.HIGH,
        "wheelchair"
      )
    );
  }

  return results;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function findBestVenue(
  venues: readonly Venue[],
  userZone: string,
  venueType: string
): Venue | undefined {
  const matchingVenues = venues.filter(
    (v) => v.type === venueType && v.isOpen
  );

  if (matchingVenues.length === 0) return undefined;

  // Prefer venues in user's zone, then sort by wait time
  const sorted = [...matchingVenues].sort((a, b) => {
    const aInZone = a.zoneId === userZone ? 0 : 1;
    const bInZone = b.zoneId === userZone ? 0 : 1;
    if (aInZone !== bInZone) return aInZone - bInZone;
    return a.estimatedWaitMinutes - b.estimatedWaitMinutes;
  });

  return sorted[0];
}

/** Exported for testing — determine density-based zone status */
export function getZoneDensityLevel(
  zone: StadiumZone
): "low" | "moderate" | "high" | "critical" {
  const ratio = zone.currentOccupancy / zone.maxCapacity;
  if (ratio >= CROWD_DENSITY_LEVELS.CRITICAL) return "critical";
  if (ratio >= CROWD_DENSITY_LEVELS.HIGH) return "high";
  if (ratio >= CROWD_DENSITY_LEVELS.MODERATE) return "moderate";
  return "low";
}
