/**
 * Fan Experience Hub — main fan-facing view with recommendations.
 * Orchestrates sub-components. No business logic here.
 */

"use client";

import { useCallback, useMemo, memo } from "react";
import RecommendationCard from "@/components/fan/RecommendationCard";
import WaitTimeDisplay from "@/components/fan/WaitTimeDisplay";
import QuickActions from "@/components/fan/QuickActions";
import MatchTimeline from "@/components/fan/MatchTimeline";
import PersonalItinerary from "@/components/fan/PersonalItinerary";
import WeatherBanner from "@/components/fan/WeatherBanner";
import FanSentiment from "@/components/fan/FanSentiment";
import EmergencyBanner from "@/components/fan/EmergencyBanner";
import GreenTravelBadge from "@/components/fan/GreenTravelBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type {
  ContextRecommendation,
  StadiumApiResponse,
  UserProfile,
} from "@/lib/types";
import { UI_LIMITS } from "@/lib/utils/constants";
import { generateItinerary } from "@/lib/engine/itineraryEngine";
import { getEvacuationRoute } from "@/lib/engine/emergencyEngine";
import { computeSentiment } from "@/lib/engine/sentimentEngine";

interface FanHubProps {
  readonly data: StadiumApiResponse | null;
  readonly recommendations: readonly ContextRecommendation[];
  readonly isLoading: boolean;
  readonly userProfile: UserProfile;
  readonly onChatAction: (message: string) => void;
}

const ACTION_MESSAGES: Record<string, string> = {
  "find-food": "Where can I find food with the shortest wait time near me?",
  "find-restroom": "Where is the nearest restroom with a short line?",
  "get-directions": "Can you help me find directions to my seat?",
  "report-issue": "I need to report an issue at the stadium.",
  "match-stats": "What are the latest match stats and events?",
  "weather-info": "What's the weather forecast for the match?",
  merchandise: "Where can I buy team merchandise with no lines?",
  "accessible-route": "I need an accessible, step-free route to my gate.",
  sos: "EMERGENCY: I need immediate assistance or security at my location.",
};

const FanHub = memo(function FanHub({
  data,
  recommendations,
  isLoading,
  userProfile,
  onChatAction,
}: FanHubProps) {
  const handleAction = useCallback(
    (actionId: string) => {
      const message = ACTION_MESSAGES[actionId];
      if (message) {
        onChatAction(message);
      }
    },
    [onChatAction],
  );

  const itinerary = useMemo(() => {
    if (!data?.stadiumState) return [];
    return generateItinerary(data.stadiumState);
  }, [data?.stadiumState]);

  const emergencyRoute = useMemo(() => {
    if (!data?.stadiumState) return null;
    const isEmergency = data.stadiumState.incidents.some(
      (i) => i.severity >= 3 && i.status !== "resolved",
    );
    return isEmergency
      ? getEvacuationRoute(userProfile.currentZone, data.stadiumState)
      : null;
  }, [data?.stadiumState, userProfile.currentZone]);

  const sentiment = useMemo(() => {
    if (!data?.stadiumState) return null;
    return computeSentiment(data.stadiumState);
  }, [data?.stadiumState]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading fan experience..." />
      </div>
    );
  }

  return (
    <section aria-label="Fan Experience Hub" className="flex flex-col gap-6">
      {/* Emergency Overrides Everything if active */}
      {emergencyRoute && <EmergencyBanner route={emergencyRoute} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Fan Experience Hub</h2>
          <p className="mt-1 text-sm text-slate-400">
            Your personalized FIFA World Cup 2026 experience
          </p>
        </div>
        {sentiment && (
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:w-auto">
            <button
              onClick={() => handleAction("sos")}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:scale-105 active:scale-95 animate-pulse"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              SOS EMERGENCY
            </button>
            <FanSentiment sentiment={sentiment} />
          </div>
        )}
      </div>

      {data.stadiumState.weather && (
        <WeatherBanner weather={data.stadiumState.weather} />
      )}

      {/* Main Fan Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <QuickActions onAction={handleAction} />
          <WaitTimeDisplay
            venues={data.stadiumState.venues}
            userZone={userProfile.currentZone}
          />
          <GreenTravelBadge profile={userProfile} />

          <section aria-label="Personalized recommendations">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
              Recommendations for You
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
              {recommendations.length === UI_LIMITS.EMPTY_COUNT && (
                <p className="col-span-2 py-8 text-center text-sm text-slate-600">
                  No recommendations available. Try changing your zone or role.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <PersonalItinerary items={itinerary} />
          <MatchTimeline matchState={data.stadiumState.matchState} />
        </div>
      </div>
    </section>
  );
});

export default FanHub;
