/**
 * GET /api/stadium — Server-side stadium data endpoint.
 * Returns Zod-validated stadium state with crowd analytics.
 */

import { NextResponse } from "next/server";
import { generateStadiumState } from "@/lib/data/mockStadiumData";
import { generateIncidents } from "@/lib/data/mockIncidents";
import { generateCrowdReport, calculateTotalOccupancy } from "@/lib/engine/crowdAnalyticsEngine";
import { stadiumApiResponseSchema } from "@/lib/schemas";
import type { StadiumApiResponse } from "@/lib/types";
import type { MatchPhase } from "@/lib/utils/constants";
import { MATCH_PHASES } from "@/lib/utils/constants";

export async function GET(
  request: Request
): Promise<NextResponse<StadiumApiResponse | { error: string }>> {
  try {
    const url = new URL(request.url);
    const phaseParam = url.searchParams.get("phase");

    const matchPhase: MatchPhase = isValidPhase(phaseParam)
      ? phaseParam
      : MATCH_PHASES.FIRST_HALF;

    // Generate a time-based seed for slight variation on each request
    const seed = Math.floor(Date.now() / 30_000);

    // Generate stadium state with incidents
    const baseState = generateStadiumState(matchPhase, seed);
    const incidents = generateIncidents(5, seed);
    const stadiumState = { ...baseState, incidents };

    // Compute analytics
    const crowdReport = generateCrowdReport(stadiumState.zones);
    const { totalOccupancy, totalCapacity, occupancyPercent } =
      calculateTotalOccupancy(stadiumState.zones);

    const responseData: StadiumApiResponse = {
      stadiumState,
      crowdReport,
      totalOccupancy,
      totalCapacity,
      occupancyPercent,
    };

    // Validate outgoing response with Zod
    const validated = stadiumApiResponseSchema.safeParse(responseData);

    if (!validated.success) {
      console.error("Stadium API response validation failed:", validated.error);
      return NextResponse.json(
        { error: "Internal data validation error" },
        { status: 500 }
      );
    }

    return NextResponse.json(validated.data as StadiumApiResponse, {
      headers: {
        "Cache-Control": "public, max-age=10, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    console.error("Stadium API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stadium data" },
      { status: 500 }
    );
  }
}

function isValidPhase(value: string | null): value is MatchPhase {
  if (!value) return false;
  const validPhases: readonly string[] = Object.values(MATCH_PHASES);
  return validPhases.includes(value);
}
