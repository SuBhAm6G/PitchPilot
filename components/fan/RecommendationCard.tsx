/**
 * Recommendation card — displays a single context-aware recommendation.
 */

import Card from "@/components/ui/Card";
import type { ContextRecommendation } from "@/lib/types";

interface RecommendationCardProps {
  readonly recommendation: ContextRecommendation;
}

const ICON_MAP: Record<string, string> = {
  utensils: "🍔",
  toilet: "🚻",
  map: "🗺️",
  shield: "🛡️",
  wheelchair: "♿",
  users: "👥",
  alert: "🚨",
  info: "ℹ️",
};

const PRIORITY_STYLES: Record<number, string> = {
  1: "border-slate-500/20",
  2: "border-sky-500/20",
  3: "border-amber-500/20",
  4: "border-red-500/30 bg-red-500/5",
};

export default function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const icon = ICON_MAP[recommendation.icon] ?? "ℹ️";
  const borderStyle = PRIORITY_STYLES[recommendation.priority] ?? "";

  return (
    <Card as="article" className={`${borderStyle} hover:scale-[1.01]`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white">
            {recommendation.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            {recommendation.message}
          </p>
          <span className="mt-2 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
            {recommendation.type}
          </span>
        </div>
      </div>
    </Card>
  );
}
