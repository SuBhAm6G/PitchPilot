/**
 * Deterministic engine for calculating sustainability and green travel metrics.
 */

import type { UserProfile } from "@/lib/types";

export interface SustainabilityMetrics {
  readonly co2SavedKg: number;
  readonly badgeEarned: boolean;
  readonly message: string;
}

// Average CO2 emissions per passenger kilometer (simulated estimates)
const CAR_EMISSIONS_PER_KM = 0.17;
const TRANSIT_EMISSIONS_PER_KM = 0.04;
const WALK_EMISSIONS_PER_KM = 0.0;
// Assuming average travel distance to MetLife Stadium is 25 km
const AVERAGE_TRIP_KM = 25;

export function calculateSustainability(
  profile: UserProfile,
): SustainabilityMetrics {
  const method = profile.travelMethod || "car";
  const groupSize = profile.groupSize || 1;

  // Baseline: single passenger in a car
  const baselineEmissions = CAR_EMISSIONS_PER_KM * AVERAGE_TRIP_KM;

  let actualEmissions = 0;
  if (method === "transit") {
    actualEmissions = TRANSIT_EMISSIONS_PER_KM * AVERAGE_TRIP_KM;
  } else if (method === "walk") {
    actualEmissions = WALK_EMISSIONS_PER_KM * AVERAGE_TRIP_KM;
  } else {
    // Carpool savings
    actualEmissions = (CAR_EMISSIONS_PER_KM * AVERAGE_TRIP_KM) / groupSize;
  }

  // Calculate savings (can't be negative in this simple model)
  const saved = Math.max(0, baselineEmissions - actualEmissions);

  // Format to 1 decimal place
  const co2SavedKg = Math.round(saved * 10) / 10;
  const badgeEarned = co2SavedKg >= 1.0;

  let message =
    "Consider taking public transit next time to earn your Green Fan badge!";
  if (method === "transit") {
    message =
      "Thank you for taking public transit! You've significantly reduced your carbon footprint.";
  } else if (method === "walk") {
    message = "Zero emissions! You are a true Green Fan.";
  } else if (groupSize > 1) {
    message = `Carpooling with ${groupSize} people saved CO2!`;
  }

  return {
    co2SavedKg,
    badgeEarned,
    message,
  };
}
