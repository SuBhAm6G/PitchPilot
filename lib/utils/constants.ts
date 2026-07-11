/**
 * Stadium constants — all hardcoded values live here.
 * Modeled after MetLife Stadium (East Rutherford, NJ), a FIFA World Cup 2026 venue.
 */

/** User roles within the stadium system */
export const USER_ROLES = {
  FAN: "fan",
  STAFF: "staff",
  SECURITY: "security",
  MEDICAL: "medical",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Stadium zone definitions */
export const STADIUM_ZONES = [
  { id: "north-lower", name: "North Lower Bowl", maxCapacity: 12_000, sector: "north" },
  { id: "north-upper", name: "North Upper Bowl", maxCapacity: 10_000, sector: "north" },
  { id: "south-lower", name: "South Lower Bowl", maxCapacity: 12_000, sector: "south" },
  { id: "south-upper", name: "South Upper Bowl", maxCapacity: 10_000, sector: "south" },
  { id: "east-lower", name: "East Lower Bowl", maxCapacity: 11_000, sector: "east" },
  { id: "east-upper", name: "East Upper Bowl", maxCapacity: 9_500, sector: "east" },
  { id: "west-lower", name: "West Lower Bowl", maxCapacity: 11_000, sector: "west" },
  { id: "west-upper", name: "West Upper Bowl", maxCapacity: 9_500, sector: "west" },
  { id: "vip-suites", name: "VIP Suites", maxCapacity: 3_966, sector: "west" },
] as const;

export type ZoneId = (typeof STADIUM_ZONES)[number]["id"];

/** Total stadium capacity — MetLife Stadium */
export const MAX_STADIUM_CAPACITY = 88_966;

/** Crowd density thresholds (percentage of zone capacity) */
export const CROWD_DENSITY_LEVELS = {
  LOW: 0.4,
  MODERATE: 0.65,
  HIGH: 0.85,
  CRITICAL: 0.95,
} as const;

export type DensityLevel = "low" | "moderate" | "high" | "critical";

/** Wait time thresholds in minutes */
export const WAIT_TIME_THRESHOLDS = {
  SHORT: 5,
  MODERATE: 10,
  LONG: 20,
  EXCESSIVE: 30,
} as const;

export type WaitTimeLevel = "short" | "moderate" | "long" | "excessive";

/** Venue types within the stadium */
export const VENUE_TYPES = {
  FOOD_COURT: "food_court",
  RESTROOM: "restroom",
  ENTRY_GATE: "entry_gate",
  MERCHANDISE: "merchandise",
  FIRST_AID: "first_aid",
} as const;

export type VenueType = (typeof VENUE_TYPES)[keyof typeof VENUE_TYPES];

/** Incident severity levels (ascending severity) */
export const INCIDENT_SEVERITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

export type IncidentSeverityValue =
  (typeof INCIDENT_SEVERITY)[keyof typeof INCIDENT_SEVERITY];

/** Incident status values */
export const INCIDENT_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
} as const;

export type IncidentStatusValue =
  (typeof INCIDENT_STATUS)[keyof typeof INCIDENT_STATUS];

/** Match phases for context-aware recommendations */
export const MATCH_PHASES = {
  PRE_MATCH: "pre_match",
  FIRST_HALF: "first_half",
  HALF_TIME: "half_time",
  SECOND_HALF: "second_half",
  POST_MATCH: "post_match",
} as const;

export type MatchPhase = (typeof MATCH_PHASES)[keyof typeof MATCH_PHASES];

/** Match schedule reference times (minutes from gate opening) */
export const MATCH_TIMING = {
  GATES_OPEN_BEFORE_KICKOFF_MINS: 120,
  FIRST_HALF_DURATION_MINS: 45,
  HALF_TIME_DURATION_MINS: 15,
  SECOND_HALF_DURATION_MINS: 45,
} as const;

/** Venue counts per zone (used in mock data generation) */
export const VENUES_PER_ZONE = {
  food_court: 3,
  restroom: 4,
  entry_gate: 2,
  merchandise: 1,
  first_aid: 1,
} as const;

/** Recommendation priority levels */
export const RECOMMENDATION_PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
} as const;

export type RecommendationPriority =
  (typeof RECOMMENDATION_PRIORITY)[keyof typeof RECOMMENDATION_PRIORITY];

/** Chat configuration */
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_HISTORY_LENGTH: 50,
  SYSTEM_PROMPT_ROLE: "Stadium AI Assistant for FIFA World Cup 2026 at MetLife Stadium",
} as const;
