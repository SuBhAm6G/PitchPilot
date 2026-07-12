/**
 * Zod validation schemas — validates all incoming/outgoing data.
 * Every LLM response, API payload, and user input passes through these.
 */

import { z } from "zod/v4";

// ─── Primitive validators ────────────────────────────────────────────────────

const zoneIdSchema = z.enum([
  "north-lower",
  "north-upper",
  "south-lower",
  "south-upper",
  "east-lower",
  "east-upper",
  "west-lower",
  "west-upper",
  "vip-suites",
]);

const userRoleSchema = z.enum(["fan", "staff", "security", "medical"]);

const venueTypeSchema = z.enum([
  "food_court",
  "restroom",
  "entry_gate",
  "merchandise",
  "first_aid",
]);

const incidentSeveritySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const incidentStatusSchema = z.enum(["open", "in_progress", "resolved"]);

const matchPhaseSchema = z.enum([
  "pre_match",
  "first_half",
  "half_time",
  "second_half",
  "post_match",
]);

const recommendationTypeSchema = z.enum([
  "food",
  "restroom",
  "navigation",
  "safety",
  "accessibility",
  "crowd_alert",
  "incident",
  "general",
]);

const recommendationIconSchema = z.enum([
  "utensils",
  "toilet",
  "map",
  "shield",
  "wheelchair",
  "users",
  "alert",
  "info",
]);

const recommendationPrioritySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

// ─── New Feature Schemas ─────────────────────────────────────────────────────

export const matchEventTypeSchema = z.enum([
  "goal",
  "yellow_card",
  "red_card",
  "substitution",
  "var_review",
  "penalty",
  "half_time",
  "full_time",
]);

export const matchEventSchema = z.object({
  id: z.string(),
  minute: z.number().int().nonnegative(),
  type: matchEventTypeSchema,
  team: z.enum(["home", "away"]),
  playerName: z.string(),
  description: z.string(),
});

export const matchStateSchema = z.object({
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeScore: z.number().int().nonnegative(),
  awayScore: z.number().int().nonnegative(),
  currentMinute: z.number().int().nonnegative(),
  events: z.array(matchEventSchema),
});

export const navigationStepSchema = z.object({
  instruction: z.string(),
  distanceMeters: z.number().nonnegative(),
  estimatedSeconds: z.number().nonnegative(),
  landmark: z.string(),
});

export const navigationRouteSchema = z.object({
  from: z.string(),
  to: z.string(),
  steps: z.array(navigationStepSchema),
  totalDistanceMeters: z.number().nonnegative(),
  totalEstimatedMinutes: z.number().nonnegative(),
  isAccessible: z.boolean(),
});

export const emergencyRouteSchema = z.object({
  userZone: z.string(),
  nearestExit: z.string(),
  avoidZones: z.array(z.string()),
  instructions: z.array(z.string()),
  estimatedEvacMinutes: z.number().nonnegative(),
});

export const itineraryItemSchema = z.object({
  id: z.string(),
  time: z.string(),
  action: z.string(),
  reason: z.string(),
  priority: z.enum(["now", "soon", "later"]),
  icon: z.string(),
});

export const weatherAdvisorySchema = z.object({
  condition: z.enum(["clear", "cloudy", "rain", "hot", "cold"]),
  temperatureCelsius: z.number(),
  advisory: z.string(),
  recommendedGate: z.string(),
  icon: z.string(),
});

export const sentimentScoreSchema = z.object({
  level: z.number().int().min(1).max(5),
  label: z.string(),
  emoji: z.string(),
});

// ─── Composite schemas ──────────────────────────────────────────────────────

export const accessibilityNeedsSchema = z.object({
  wheelchairAccess: z.boolean(),
  visualAssistance: z.boolean(),
  hearingAssistance: z.boolean(),
});

export const userProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: userRoleSchema,
  currentZone: zoneIdSchema,
  seatNumber: z.string().optional(),
  preferredLanguage: z.string().min(2),
  accessibilityNeeds: accessibilityNeedsSchema,
});

export const venueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: venueTypeSchema,
  zoneId: zoneIdSchema,
  currentQueueLength: z.number().int().nonnegative(),
  estimatedWaitMinutes: z.number().nonnegative(),
  isOpen: z.boolean(),
});

export const incidentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  severity: incidentSeveritySchema,
  status: incidentStatusSchema,
  zoneId: zoneIdSchema,
  reportedAt: z.string().datetime(),
  assignedTo: z.string().nullable(),
});

export const stadiumZoneSchema = z.object({
  id: zoneIdSchema,
  name: z.string().min(1),
  currentOccupancy: z.number().int().nonnegative(),
  maxCapacity: z.number().int().positive(),
  sector: z.string().min(1),
});

export const stadiumStateSchema = z.object({
  zones: z.array(stadiumZoneSchema),
  venues: z.array(venueSchema),
  incidents: z.array(incidentSchema),
  matchPhase: matchPhaseSchema,
  matchState: matchStateSchema,
  weather: weatherAdvisorySchema,
  lastUpdated: z.string().datetime(),
});

export const contextRecommendationSchema = z.object({
  id: z.string().min(1),
  type: recommendationTypeSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  priority: recommendationPrioritySchema,
  icon: recommendationIconSchema,
});

// ─── Chat schemas ────────────────────────────────────────────────────────────

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(500),
  userProfile: userProfileSchema,
  stadiumState: stadiumStateSchema,
});

export const chatResponseSchema = z.object({
  reply: z.string().min(1),
  recommendations: z.array(contextRecommendationSchema),
});

// ─── LLM output schema (validated before rendering) ─────────────────────────

export const llmResponseSchema = z.object({
  reply: z.string().min(1),
  recommendations: z.array(
    z.object({
      type: recommendationTypeSchema,
      title: z.string().min(1),
      message: z.string().min(1),
      priority: recommendationPrioritySchema,
      icon: recommendationIconSchema,
    })
  ),
});

// ─── API response schemas ────────────────────────────────────────────────────

export const stadiumApiResponseSchema = z.object({
  stadiumState: stadiumStateSchema,
  crowdReport: z.array(
    z.object({
      zoneId: zoneIdSchema,
      zoneName: z.string().min(1),
      occupancyPercent: z.number().min(0).max(100),
      densityLevel: z.enum(["low", "moderate", "high", "critical"]),
      currentOccupancy: z.number().int().nonnegative(),
      maxCapacity: z.number().int().positive(),
    })
  ),
  totalOccupancy: z.number().int().nonnegative(),
  totalCapacity: z.number().int().positive(),
  occupancyPercent: z.number().min(0).max(100),
});
