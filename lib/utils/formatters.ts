/**
 * Utility functions for formatting strings and data for the UI.
 */

import type { MatchPhase } from "@/lib/utils/constants";

/**
 * Formats a match phase enum value into a readable string.
 * e.g. "first_half" -> "First Half"
 */
export function formatMatchPhase(phase: MatchPhase | string): string {
  return phase
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Formats an ISO date string into a localized time string (HH:MM).
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
