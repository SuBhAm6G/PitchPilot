/**
 * Wait Time Engine — pure functions for queue estimation and shortest-queue finding.
 * Zero side effects. All calculations are deterministic.
 */

import type { Venue, WaitTimeEstimate } from "@/lib/types";
import type { WaitTimeLevel, VenueType } from "@/lib/utils/constants";
import { WAIT_TIME_THRESHOLDS } from "@/lib/utils/constants";

/** Service rate: people processed per minute by venue type */
const SERVICE_RATES: Record<VenueType, number> = {
  food_court: 2.5,
  restroom: 4.0,
  entry_gate: 8.0,
  merchandise: 3.0,
  first_aid: 1.5,
};

/** Classify wait time into human-readable level */
export function classifyWaitTime(minutes: number): WaitTimeLevel {
  if (minutes <= WAIT_TIME_THRESHOLDS.SHORT) return "short";
  if (minutes <= WAIT_TIME_THRESHOLDS.MODERATE) return "moderate";
  if (minutes <= WAIT_TIME_THRESHOLDS.LONG) return "long";
  return "excessive";
}

/** Estimate wait time for a venue based on its current queue */
export function estimateWaitTime(venue: Venue): WaitTimeEstimate {
  const serviceRate = SERVICE_RATES[venue.type];
  const estimatedMinutes = serviceRate > 0
    ? Math.round(venue.currentQueueLength / serviceRate)
    : venue.estimatedWaitMinutes;

  return {
    venueId: venue.id,
    venueName: venue.name,
    venueType: venue.type,
    estimatedMinutes,
    level: classifyWaitTime(estimatedMinutes),
    zoneId: venue.zoneId,
  };
}

/** Find the venue with the shortest queue of a given type, optionally prioritizing user's zone */
export function findShortestQueue(
  venues: readonly Venue[],
  venueType: VenueType,
  userZone?: string
): Venue | undefined {
  const openVenues = venues.filter(
    (v) => v.type === venueType && v.isOpen
  );

  if (openVenues.length === 0) return undefined;

  const sorted = [...openVenues].sort((a, b) => {
    // Prioritize user's zone
    if (userZone) {
      const aInZone = a.zoneId === userZone ? 0 : 1;
      const bInZone = b.zoneId === userZone ? 0 : 1;
      if (aInZone !== bInZone) return aInZone - bInZone;
    }
    return a.estimatedWaitMinutes - b.estimatedWaitMinutes;
  });

  return sorted[0];
}

/** Get wait time estimates for all venues of a given type */
export function getWaitTimesByType(
  venues: readonly Venue[],
  venueType: VenueType
): readonly WaitTimeEstimate[] {
  return venues
    .filter((v) => v.type === venueType && v.isOpen)
    .map(estimateWaitTime)
    .sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
}

/** Calculate average wait time across all open venues of a given type */
export function averageWaitTime(
  venues: readonly Venue[],
  venueType: VenueType
): number {
  const openVenues = venues.filter(
    (v) => v.type === venueType && v.isOpen
  );

  if (openVenues.length === 0) return 0;

  const totalWait = openVenues.reduce(
    (sum, v) => sum + v.estimatedWaitMinutes,
    0
  );

  return Math.round(totalWait / openVenues.length);
}
