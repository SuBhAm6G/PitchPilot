/**
 * Deterministic mock stadium data generators.
 * Simulates IoT sensor feeds for crowd density, wait times, and venue status.
 */

import { STADIUM_ZONES, VENUE_TYPES, MATCH_PHASES } from "@/lib/utils/constants";
import type { StadiumZone, Venue, StadiumState } from "@/lib/types";
import type { MatchPhase, VenueType, ZoneId } from "@/lib/utils/constants";

/** Seeded pseudo-random number generator for deterministic output */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Generate realistic zone occupancy based on match phase */
export function generateZoneOccupancy(
  matchPhase: MatchPhase,
  seed: number = 42
): readonly StadiumZone[] {
  const phaseMultipliers: Record<MatchPhase, number> = {
    [MATCH_PHASES.PRE_MATCH]: 0.45,
    [MATCH_PHASES.FIRST_HALF]: 0.88,
    [MATCH_PHASES.HALF_TIME]: 0.72,
    [MATCH_PHASES.SECOND_HALF]: 0.85,
    [MATCH_PHASES.POST_MATCH]: 0.35,
  };

  const baseMultiplier = phaseMultipliers[matchPhase];

  return STADIUM_ZONES.map((zone, index) => {
    const variance = seededRandom(seed + index) * 0.25 - 0.125;
    const occupancyRate = Math.min(Math.max(baseMultiplier + variance, 0.1), 0.98);
    const currentOccupancy = Math.round(zone.maxCapacity * occupancyRate);

    return {
      id: zone.id,
      name: zone.name,
      currentOccupancy,
      maxCapacity: zone.maxCapacity,
      sector: zone.sector,
    };
  });
}

/** Venue name templates by type */
const VENUE_NAMES: Record<VenueType, readonly string[]> = {
  food_court: ["Stadium Grill", "World Bites", "Goal Line Café"],
  restroom: ["Restroom A", "Restroom B", "Restroom C", "Restroom D"],
  entry_gate: ["Gate A", "Gate B"],
  merchandise: ["Fan Store"],
  first_aid: ["Medical Station"],
};

/** Generate venue data with wait times based on match phase */
export function generateVenues(
  matchPhase: MatchPhase,
  seed: number = 42
): readonly Venue[] {
  const venues: Venue[] = [];

  const waitMultipliers: Record<MatchPhase, Record<VenueType, number>> = {
    [MATCH_PHASES.PRE_MATCH]: {
      food_court: 0.6,
      restroom: 0.3,
      entry_gate: 1.0,
      merchandise: 0.8,
      first_aid: 0.1,
    },
    [MATCH_PHASES.FIRST_HALF]: {
      food_court: 0.3,
      restroom: 0.2,
      entry_gate: 0.1,
      merchandise: 0.2,
      first_aid: 0.3,
    },
    [MATCH_PHASES.HALF_TIME]: {
      food_court: 1.0,
      restroom: 1.0,
      entry_gate: 0.1,
      merchandise: 0.7,
      first_aid: 0.2,
    },
    [MATCH_PHASES.SECOND_HALF]: {
      food_court: 0.2,
      restroom: 0.2,
      entry_gate: 0.1,
      merchandise: 0.15,
      first_aid: 0.3,
    },
    [MATCH_PHASES.POST_MATCH]: {
      food_court: 0.1,
      restroom: 0.5,
      entry_gate: 0.8,
      merchandise: 0.6,
      first_aid: 0.2,
    },
  };

  let venueIndex = 0;

  for (const zone of STADIUM_ZONES) {
    const venueTypes = Object.values(VENUE_TYPES);

    for (const venueType of venueTypes) {
      const names = VENUE_NAMES[venueType];
      const nameIndex = venueIndex % names.length;
      const venueName = names[nameIndex] ?? venueType;
      const multiplier = waitMultipliers[matchPhase][venueType];
      const baseWait = venueType === "entry_gate" ? 25 : venueType === "food_court" ? 15 : 8;
      const variance = seededRandom(seed + venueIndex) * 0.5;
      const estimatedWaitMinutes = Math.round(baseWait * multiplier * (1 + variance));
      const currentQueueLength = Math.round(estimatedWaitMinutes * (2.5 + variance));

      venues.push({
        id: `${zone.id}-${venueType}-${nameIndex}`,
        name: `${venueName} (${zone.name})`,
        type: venueType,
        zoneId: zone.id as ZoneId,
        currentQueueLength,
        estimatedWaitMinutes,
        isOpen: matchPhase !== MATCH_PHASES.POST_MATCH || venueType === "entry_gate",
      });

      venueIndex++;
    }
  }

  return venues;
}

/** Generate a complete stadium state snapshot */
export function generateStadiumState(
  matchPhase: MatchPhase = MATCH_PHASES.FIRST_HALF,
  seed: number = 42
): StadiumState {
  return {
    zones: generateZoneOccupancy(matchPhase, seed),
    venues: generateVenues(matchPhase, seed),
    incidents: [],
    matchPhase,
    lastUpdated: new Date().toISOString(),
  };
}
