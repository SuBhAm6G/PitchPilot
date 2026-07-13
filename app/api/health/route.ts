import { NextResponse } from "next/server";
import { generateStadiumState } from "@/lib/data/mockStadiumData";

export async function GET() {
  const state = generateStadiumState("first_half", Date.now());
  const activeIncidents = state.incidents.filter(
    (i) => i.status !== "resolved",
  ).length;

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      llmGateway: {
        status: process.env.GOOGLE_GENERATIVE_AI_API_KEY
          ? "connected"
          : "fallback_mode",
      },
      iotSensors: {
        status: "simulated",
        activeConnections: 9, // One per zone
      },
      engine: {
        version: "1.0.0",
        activeIncidents,
        memoryUsage: process.memoryUsage().heapUsed,
      },
    },
  });
}
