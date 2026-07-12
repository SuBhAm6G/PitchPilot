/**
 * Phase-based recommendations — universal recommendations based on match phase.
 * Pure functions. Zero side effects.
 */

import type { ContextRecommendation } from "@/lib/types";
import { MATCH_PHASES, RECOMMENDATION_PRIORITY } from "@/lib/utils/constants";
import type { MatchPhase } from "@/lib/utils/constants";
import { makeRecommendation } from "@/lib/engine/contextDecisionEngine";

/** Get recommendations based on the current match phase */
export function getPhaseRecommendations(
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
