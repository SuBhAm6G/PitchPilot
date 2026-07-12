import { ZONE_ADJACENCY, WALKING_SPEED_MPM, WHEELCHAIR_SPEED_MPM } from "@/lib/utils/constants";
import type { NavigationRoute, NavigationStep, AccessibilityNeeds } from "@/lib/types";

/**
 * Deterministic engine for A* shortest-path routing between stadium zones.
 */
export function calculateRoute(
  fromZoneId: string,
  toZoneId: string,
  accessibility: AccessibilityNeeds
): NavigationRoute | null {
  if (fromZoneId === toZoneId) {
    return {
      from: fromZoneId,
      to: toZoneId,
      steps: [{ instruction: "You are already here.", distanceMeters: 0, estimatedSeconds: 0, landmark: "" }],
      totalDistanceMeters: 0,
      totalEstimatedMinutes: 0,
      isAccessible: true,
    };
  }

  // Dijkstra's algorithm for shortest path
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const zone in ZONE_ADJACENCY) {
    distances[zone] = Infinity;
    previous[zone] = null;
    unvisited.add(zone);
  }
  distances[fromZoneId] = 0;

  while (unvisited.size > 0) {
    let current: string | null = null;
    for (const zone of unvisited) {
      if (current === null || distances[zone] < distances[current]) {
        current = zone;
      }
    }

    if (current === null || distances[current] === Infinity) break;
    if (current === toZoneId) break;

    unvisited.delete(current);

    const neighbors = ZONE_ADJACENCY[current];
    if (!neighbors) continue;

    for (const [neighbor, weight] of Object.entries(neighbors)) {
      if (!unvisited.has(neighbor)) continue;
      
      const alt = distances[current] + weight;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = current;
      }
    }
  }

  if (distances[toZoneId] === Infinity) return null;

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = toZoneId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  const speed = accessibility.wheelchairAccess ? WHEELCHAIR_SPEED_MPM : WALKING_SPEED_MPM;
  const steps: NavigationStep[] = [];
  let totalDistance = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const currentZone = path[i];
    const nextZone = path[i + 1];
    const distance = ZONE_ADJACENCY[currentZone][nextZone];
    
    totalDistance += distance;
    steps.push({
      instruction: `Proceed from ${formatZone(currentZone)} to ${formatZone(nextZone)}`,
      distanceMeters: distance,
      estimatedSeconds: Math.round((distance / speed) * 60),
      landmark: i === path.length - 2 ? "Final destination ahead" : "Follow overhead signs",
    });
  }

  return {
    from: fromZoneId,
    to: toZoneId,
    steps,
    totalDistanceMeters: totalDistance,
    totalEstimatedMinutes: Math.ceil(totalDistance / speed),
    isAccessible: true, // simplified: assuming all paths in adjacency map are accessible or handled by specific speed
  };
}

function formatZone(zoneId: string): string {
  return zoneId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
