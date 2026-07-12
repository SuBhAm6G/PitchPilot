import { z } from "zod/v4";
import { generateStadiumState } from "../lib/data/mockStadiumData";
import { stadiumStateSchema } from "../lib/schemas";
import { generateIncidents } from "../lib/data/mockIncidents";

const insightsRequestSchema = z.object({
  stadiumState: stadiumStateSchema,
});

async function main() {
  const seed = Math.floor(Date.now() / 30_000);
  const baseState = generateStadiumState("first_half", seed);
  const incidents = generateIncidents(5, seed);
  const stadiumState = { ...baseState, incidents };

  // First validate as stringified-parsed JSON like an API would receive
  const jsonParsedState = JSON.parse(JSON.stringify(stadiumState));
  
  const parseResult = insightsRequestSchema.safeParse({ stadiumState: jsonParsedState });

  if (!parseResult.success) {
    console.error("Validation failed!", JSON.stringify(parseResult.error.format(), null, 2));
  } else {
    console.log("Validation succeeded!");
  }
}

main();
