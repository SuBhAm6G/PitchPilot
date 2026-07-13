import type { ItineraryItem, StadiumState } from "@/lib/types";
import { UI_WARNING_THRESHOLDS } from "@/lib/utils/constants";

/**
 * Deterministic engine to generate a personalized match-day itinerary.
 * Uses the current match phase and stadium queues to calculate the next best action.
 *
 * @param stadiumState - The current operational state of the stadium
 * @returns An array of prioritized itinerary items for the user
 */
export function generateItinerary(
  stadiumState: StadiumState,
): readonly ItineraryItem[] {
  const items: ItineraryItem[] = [];
  const phase = stadiumState.matchPhase;

  if (phase === "pre_match") {
    items.push({
      id: "itin-1",
      time: "Now",
      action: "Enter Stadium",
      reason: "Gates are open. Arrive early to avoid queues.",
      priority: "now",
      icon: "map",
    });

    // Check wait times for food
    const foodVenues = stadiumState.venues.filter(
      (v) => v.type === "food_court",
    );
    const longWait = foodVenues.some(
      (v) => v.estimatedWaitMinutes > UI_WARNING_THRESHOLDS.WAIT_TIME_MINUTES,
    );

    if (longWait) {
      items.push({
        id: "itin-2",
        time: "Soon",
        action: "Grab food early",
        reason: "Food courts are getting busy. Eat before the match starts.",
        priority: "soon",
        icon: "utensils",
      });
    }
  } else if (phase === "first_half" || phase === "second_half") {
    items.push({
      id: "itin-3",
      time: "Now",
      action: "Enjoy the match",
      reason: "Match is underway.",
      priority: "now",
      icon: "users",
    });
  } else if (phase === "half_time") {
    items.push({
      id: "itin-4",
      time: "Now",
      action: "Restroom break",
      reason: "Check wait times before heading to the concourse.",
      priority: "now",
      icon: "toilet",
    });
  } else if (phase === "post_match") {
    items.push({
      id: "itin-5",
      time: "Now",
      action: "Staggered exit",
      reason: "Wait for crowds to clear before leaving your zone.",
      priority: "soon",
      icon: "info",
    });
  }

  return items;
}
