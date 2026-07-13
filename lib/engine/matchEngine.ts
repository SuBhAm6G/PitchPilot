import type {
  MatchState,
  ContextRecommendation,
} from "@/lib/types";

/**
 * Deterministic engine for match-related recommendations.
 * Analyzes recent match events (goals, half-time) to generate safety or excitement alerts.
 *
 * @param matchState - The current state of the match including score and recent events
 * @returns An array of context-aware match recommendations
 */
export function getMatchRecommendations(
  matchState: MatchState,
): readonly ContextRecommendation[] {
  const recs: ContextRecommendation[] = [];

  if (!matchState || matchState.events.length === 0) return recs;

  // Get the most recent event
  const latestEvent = matchState.events[matchState.events.length - 1];
  if (!latestEvent) return recs;

  // Only show recommendations for events that happened in the last 3 minutes
  const isRecent = matchState.currentMinute - latestEvent.minute <= 3;

  if (!isRecent) return recs;

  if (latestEvent.type === "goal") {
    recs.push({
      id: `match-goal-${latestEvent.id}`,
      type: "general",
      title: `${latestEvent.team === "home" ? matchState.homeTeam : matchState.awayTeam} GOAL!`,
      message: `${latestEvent.playerName} scores! Stay in your zone to enjoy the celebrations safely.`,
      priority: 2,
      icon: "users",
    });
  }

  if (latestEvent.type === "half_time") {
    recs.push({
      id: `match-ht-${latestEvent.id}`,
      type: "crowd_alert",
      title: "Half-time Whistle",
      message:
        "Concourses will be exceptionally busy now. Check wait times before leaving your seat.",
      priority: 3,
      icon: "alert",
    });
  }

  return recs;
}
