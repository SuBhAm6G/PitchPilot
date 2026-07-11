/**
 * Fan Experience Hub — main fan-facing view with recommendations.
 * Orchestrates sub-components. No business logic here.
 */

"use client";

import RecommendationCard from "@/components/fan/RecommendationCard";
import WaitTimeDisplay from "@/components/fan/WaitTimeDisplay";
import QuickActions from "@/components/fan/QuickActions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { ContextRecommendation, StadiumApiResponse } from "@/lib/types";

interface FanHubProps {
  readonly data: StadiumApiResponse | null;
  readonly recommendations: readonly ContextRecommendation[];
  readonly isLoading: boolean;
  readonly userZone: string;
  readonly onChatAction: (message: string) => void;
}

const ACTION_MESSAGES: Record<string, string> = {
  "find-food": "Where can I find food with the shortest wait time near me?",
  "find-restroom": "Where is the nearest restroom with a short line?",
  "get-directions": "Can you help me find directions to my seat?",
  "report-issue": "I need to report an issue at the stadium.",
};

export default function FanHub({
  data,
  recommendations,
  isLoading,
  userZone,
  onChatAction,
}: FanHubProps) {
  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading fan experience..." />
      </div>
    );
  }

  function handleAction(actionId: string) {
    const message = ACTION_MESSAGES[actionId];
    if (message) {
      onChatAction(message);
    }
  }

  return (
    <section aria-label="Fan Experience Hub" className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-white">Fan Experience Hub</h2>
        <p className="mt-1 text-sm text-slate-400">
          Your personalized FIFA World Cup 2026 experience
        </p>
      </div>

      {/* Quick actions */}
      <QuickActions onAction={handleAction} />

      {/* Wait times */}
      <WaitTimeDisplay venues={data.stadiumState.venues} userZone={userZone} />

      {/* Recommendations */}
      <section aria-label="Personalized recommendations">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
          Recommendations for You
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
          {recommendations.length === 0 && (
            <p className="col-span-2 py-8 text-center text-sm text-slate-600">
              No recommendations available. Try changing your zone or role.
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
