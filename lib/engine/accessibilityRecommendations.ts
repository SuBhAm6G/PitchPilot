/**
 * Accessibility-based recommendations for users with special needs.
 * Pure functions. Zero side effects.
 */

import type { UserProfile, ContextRecommendation } from "@/lib/types";
import { RECOMMENDATION_PRIORITY } from "@/lib/utils/constants";
import { makeRecommendation } from "@/lib/engine/contextDecisionEngine";

/** Check if the user has any accessibility needs */
export function hasAccessibilityNeeds(profile: UserProfile): boolean {
  return (
    profile.accessibilityNeeds.wheelchairAccess ||
    profile.accessibilityNeeds.visualAssistance ||
    profile.accessibilityNeeds.hearingAssistance
  );
}

/** Get accessibility-specific recommendations */
export function getAccessibilityRecommendations(
  profile: UserProfile,
): readonly ContextRecommendation[] {
  const results: ContextRecommendation[] = [];

  if (profile.accessibilityNeeds.wheelchairAccess) {
    results.push(
      makeRecommendation(
        "accessibility",
        "Accessible Routes Available",
        "Wheelchair-accessible paths and elevators are available in all zones. Use gates marked with the accessibility symbol for priority entry.",
        RECOMMENDATION_PRIORITY.HIGH,
        "wheelchair",
      ),
    );
  }

  if (profile.accessibilityNeeds.visualAssistance) {
    results.push(
      makeRecommendation(
        "accessibility",
        "Audio Assistance Available",
        "Audio description services and tactile guides are available at the information desk near your zone.",
        RECOMMENDATION_PRIORITY.HIGH,
        "wheelchair",
      ),
    );
  }

  if (profile.accessibilityNeeds.hearingAssistance) {
    results.push(
      makeRecommendation(
        "accessibility",
        "Hearing Loop Active",
        "This stadium has hearing loop systems in all lower bowl sections. Switch your hearing aid to the T-coil setting.",
        RECOMMENDATION_PRIORITY.HIGH,
        "wheelchair",
      ),
    );
  }

  return results;
}
