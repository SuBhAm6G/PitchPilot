/**
 * Role-specific recommendations — fan and staff recommendation generators.
 * Pure functions. Zero side effects.
 */

import type {
  UserProfile,
  StadiumState,
  ContextRecommendation,
  Venue,
} from "@/lib/types";
import {
  CROWD_DENSITY_LEVELS,
  USER_ROLES,
  RECOMMENDATION_PRIORITY,
  VENUE_TYPES,
} from "@/lib/utils/constants";
import { makeRecommendation } from "@/lib/engine/contextDecisionEngine";

/** Get role-specific recommendations for the given user */
export function getRoleRecommendations(
  profile: UserProfile,
  state: StadiumState
): readonly ContextRecommendation[] {
  if (profile.role === USER_ROLES.FAN) {
    return getFanRecommendations(profile, state);
  }
  if (profile.role === USER_ROLES.STAFF) {
    return getStaffRecommendations(profile, state);
  }
  return [];
}

/** Fan-specific recommendations based on zone density and nearby venues */
function getFanRecommendations(
  profile: UserProfile,
  state: StadiumState
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

/** Staff-specific recommendations based on zone density and incidents */
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

/** Find the best venue of a given type, preferring the user's zone */
export function findBestVenue(
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
