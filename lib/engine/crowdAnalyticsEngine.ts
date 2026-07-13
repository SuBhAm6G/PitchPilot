/**
 * Crowd Analytics Engine — pure functions for density analysis and flow prediction.
 * Zero side effects. All calculations are deterministic.
 */

import type {
  StadiumZone,
  CrowdDensityReport,
  CrowdPrediction,
} from "@/lib/types";
import type { DensityLevel } from "@/lib/utils/constants";
import { CROWD_DENSITY_LEVELS } from "@/lib/utils/constants";

/** Calculate the density level for a single zone */
export function calculateDensityLevel(zone: StadiumZone): DensityLevel {
  const ratio = zone.currentOccupancy / zone.maxCapacity;
  if (ratio >= CROWD_DENSITY_LEVELS.CRITICAL) return "critical";
  if (ratio >= CROWD_DENSITY_LEVELS.HIGH) return "high";
  if (ratio >= CROWD_DENSITY_LEVELS.MODERATE) return "moderate";
  return "low";
}

/** Generate a full crowd density report across all zones */
export function generateCrowdReport(
  zones: readonly StadiumZone[],
): readonly CrowdDensityReport[] {
  return zones.map((zone) => ({
    zoneId: zone.id,
    zoneName: zone.name,
    occupancyPercent: Math.round(
      (zone.currentOccupancy / zone.maxCapacity) * 100,
    ),
    densityLevel: calculateDensityLevel(zone),
    currentOccupancy: zone.currentOccupancy,
    maxCapacity: zone.maxCapacity,
  }));
}

/** Identify bottleneck zones (high or critical density) */
export function identifyBottlenecks(
  zones: readonly StadiumZone[],
): readonly StadiumZone[] {
  return zones.filter(
    (zone) =>
      zone.currentOccupancy / zone.maxCapacity >= CROWD_DENSITY_LEVELS.HIGH,
  );
}

/** Calculate total stadium occupancy metrics */
export function calculateTotalOccupancy(zones: readonly StadiumZone[]): {
  totalOccupancy: number;
  totalCapacity: number;
  occupancyPercent: number;
} {
  const totalOccupancy = zones.reduce(
    (sum, zone) => sum + zone.currentOccupancy,
    0,
  );
  const totalCapacity = zones.reduce((sum, zone) => sum + zone.maxCapacity, 0);
  const occupancyPercent =
    totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return { totalOccupancy, totalCapacity, occupancyPercent };
}

/**
 * Predict crowd flow for a future time window.
 * Uses a simple linear decay/growth model based on current density trends.
 */
export function predictCrowdFlow(
  zones: readonly StadiumZone[],
  timeWindowMinutes: number,
): readonly CrowdPrediction[] {
  const decayFactor = 1 - timeWindowMinutes * 0.005;
  const clampedDecay = Math.max(0.3, Math.min(1.2, decayFactor));

  return zones.map((zone) => {
    const currentRatio = zone.currentOccupancy / zone.maxCapacity;
    const predictedRatio = Math.min(currentRatio * clampedDecay, 0.99);
    const predictedPercent = Math.round(predictedRatio * 100);

    let predictedDensityLevel: DensityLevel = "low";
    if (predictedRatio >= CROWD_DENSITY_LEVELS.CRITICAL) {
      predictedDensityLevel = "critical";
    } else if (predictedRatio >= CROWD_DENSITY_LEVELS.HIGH) {
      predictedDensityLevel = "high";
    } else if (predictedRatio >= CROWD_DENSITY_LEVELS.MODERATE) {
      predictedDensityLevel = "moderate";
    }

    return {
      zoneId: zone.id,
      predictedOccupancyPercent: predictedPercent,
      predictedDensityLevel,
      timeWindowMinutes,
    };
  });
}
