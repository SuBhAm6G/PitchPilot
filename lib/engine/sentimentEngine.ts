import type { SentimentScore, StadiumState } from "@/lib/types";
import { SENTIMENT_LEVELS } from "@/lib/utils/constants";

/**
 * Deterministic engine for computing crowd sentiment score.
 */
export function computeSentiment(stadiumState: StadiumState): SentimentScore {
  let score: number = SENTIMENT_LEVELS.ENGAGED; // Base score 3

  // 1. Match phase factors
  if (
    stadiumState.matchPhase === "first_half" ||
    stadiumState.matchPhase === "second_half"
  ) {
    score += 1;
  }

  // 2. Incident factors (drag down sentiment)
  const criticalIncidents = stadiumState.incidents.filter(
    (inc) => inc.severity >= 3 && inc.status !== "resolved",
  ).length;
  if (criticalIncidents > 0) {
    score -= criticalIncidents;
  }

  // 3. Match events (boost sentiment if recent goals)
  if (stadiumState.matchState && stadiumState.matchState.events) {
    const recentGoals = stadiumState.matchState.events.filter(
      (e) =>
        e.type === "goal" &&
        stadiumState.matchState.currentMinute - e.minute <= 10,
    ).length;
    if (recentGoals > 0) {
      score += 1;
    }
  }

  // Bound the score between 1 and 5
  score = Math.max(1, Math.min(5, score));

  switch (score) {
    case 5:
      return { level: 5, label: "Electric", emoji: "⚡" };
    case 4:
      return { level: 4, label: "Excited", emoji: "🔥" };
    case 3:
      return { level: 3, label: "Engaged", emoji: "👀" };
    case 2:
      return { level: 2, label: "Mild", emoji: "😐" };
    case 1:
    default:
      return { level: 1, label: "Flat / Tense", emoji: "📉" };
  }
}
