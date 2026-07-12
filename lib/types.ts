/**
 * Strict type definitions for the Smart Stadium system.
 * Every interface is explicitly typed — zero `any`.
 */

import type {
  UserRole,
  ZoneId,
  DensityLevel,
  WaitTimeLevel,
  VenueType,
  IncidentSeverityValue,
  IncidentStatusValue,
  MatchPhase,
  RecommendationPriority,
} from "@/lib/utils/constants";

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly role: UserRole;
  readonly currentZone: ZoneId;
  readonly preferredLanguage: string;
  readonly accessibilityNeeds: AccessibilityNeeds;
}

export interface AccessibilityNeeds {
  readonly wheelchairAccess: boolean;
  readonly visualAssistance: boolean;
  readonly hearingAssistance: boolean;
}

// ─── Stadium State ───────────────────────────────────────────────────────────

export interface StadiumZone {
  readonly id: ZoneId;
  readonly name: string;
  readonly currentOccupancy: number;
  readonly maxCapacity: number;
  readonly sector: string;
}

export interface StadiumState {
  readonly zones: readonly StadiumZone[];
  readonly venues: readonly Venue[];
  readonly incidents: readonly Incident[];
  readonly matchPhase: MatchPhase;
  readonly matchState: MatchState;
  readonly weather: WeatherAdvisory;
  readonly lastUpdated: string;
}

// ─── Crowd Analytics ─────────────────────────────────────────────────────────

export interface CrowdDensityReport {
  readonly zoneId: ZoneId;
  readonly zoneName: string;
  readonly occupancyPercent: number;
  readonly densityLevel: DensityLevel;
  readonly currentOccupancy: number;
  readonly maxCapacity: number;
}

export interface CrowdPrediction {
  readonly zoneId: ZoneId;
  readonly predictedOccupancyPercent: number;
  readonly predictedDensityLevel: DensityLevel;
  readonly timeWindowMinutes: number;
}

// ─── Wait Times ──────────────────────────────────────────────────────────────

export interface Venue {
  readonly id: string;
  readonly name: string;
  readonly type: VenueType;
  readonly zoneId: ZoneId;
  readonly currentQueueLength: number;
  readonly estimatedWaitMinutes: number;
  readonly isOpen: boolean;
}

export interface WaitTimeEstimate {
  readonly venueId: string;
  readonly venueName: string;
  readonly venueType: VenueType;
  readonly estimatedMinutes: number;
  readonly level: WaitTimeLevel;
  readonly zoneId: ZoneId;
}

// ─── Incidents ───────────────────────────────────────────────────────────────

export interface Incident {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: IncidentSeverityValue;
  readonly status: IncidentStatusValue;
  readonly zoneId: ZoneId;
  readonly reportedAt: string;
  readonly assignedTo: string | null;
}

export interface StaffLocation {
  readonly staffId: string;
  readonly name: string;
  readonly role: UserRole;
  readonly currentZone: ZoneId;
  readonly isAvailable: boolean;
}

export interface IncidentAssignment {
  readonly incidentId: string;
  readonly staffId: string;
  readonly staffName: string;
  readonly assignedZone: ZoneId;
  readonly estimatedResponseMinutes: number;
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export interface ContextRecommendation {
  readonly id: string;
  readonly type: RecommendationType;
  readonly title: string;
  readonly message: string;
  readonly priority: RecommendationPriority;
  readonly icon: RecommendationIcon;
}

export type RecommendationType =
  | "food"
  | "restroom"
  | "navigation"
  | "safety"
  | "accessibility"
  | "crowd_alert"
  | "incident"
  | "general";

export type RecommendationIcon =
  | "utensils"
  | "toilet"
  | "map"
  | "shield"
  | "wheelchair"
  | "users"
  | "alert"
  | "info";

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: string;
}

export interface ChatRequest {
  readonly message: string;
  readonly userProfile: UserProfile;
  readonly stadiumState: StadiumState;
}

export interface ChatResponse {
  readonly reply: string;
  readonly recommendations: readonly ContextRecommendation[];
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface StadiumApiResponse {
  readonly stadiumState: StadiumState;
  readonly crowdReport: readonly CrowdDensityReport[];
  readonly totalOccupancy: number;
  readonly totalCapacity: number;
  readonly occupancyPercent: number;
}

// ─── Match Events ────────────────────────────────────────────────────────────

export interface MatchEvent {
  readonly id: string;
  readonly minute: number;
  readonly type: MatchEventType;
  readonly team: "home" | "away";
  readonly playerName: string;
  readonly description: string;
}

export type MatchEventType =
  | "goal"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "var_review"
  | "penalty"
  | "half_time"
  | "full_time";

export interface MatchState {
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly currentMinute: number;
  readonly events: readonly MatchEvent[];
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavigationStep {
  readonly instruction: string;
  readonly distanceMeters: number;
  readonly estimatedSeconds: number;
  readonly landmark: string;
}

export interface NavigationRoute {
  readonly from: string;
  readonly to: string;
  readonly steps: readonly NavigationStep[];
  readonly totalDistanceMeters: number;
  readonly totalEstimatedMinutes: number;
  readonly isAccessible: boolean;
}

// ─── Emergency ───────────────────────────────────────────────────────────────

export interface EmergencyRoute {
  readonly userZone: string;
  readonly nearestExit: string;
  readonly avoidZones: readonly string[];
  readonly instructions: readonly string[];
  readonly estimatedEvacMinutes: number;
}

// ─── Itinerary ───────────────────────────────────────────────────────────────

export interface ItineraryItem {
  readonly id: string;
  readonly time: string;
  readonly action: string;
  readonly reason: string;
  readonly priority: "now" | "soon" | "later";
  readonly icon: string;
}

// ─── Weather ─────────────────────────────────────────────────────────────────

export interface WeatherAdvisory {
  readonly condition: "clear" | "cloudy" | "rain" | "hot" | "cold";
  readonly temperatureCelsius: number;
  readonly advisory: string;
  readonly recommendedGate: string;
  readonly icon: string;
}

// ─── Sentiment ───────────────────────────────────────────────────────────────

export interface SentimentScore {
  readonly level: number; // 1-5
  readonly label: string;
  readonly emoji: string;
}
