/**
 * Fan-friendly wait time display with venue-type icons and visual indicators.
 */

import Card from "@/components/ui/Card";
import type { Venue } from "@/lib/types";
import { VENUE_TYPES, WAIT_TIME_THRESHOLDS } from "@/lib/utils/constants";
import type { VenueType } from "@/lib/utils/constants";

interface WaitTimeDisplayProps {
  readonly venues: readonly Venue[];
  readonly userZone: string;
}

const TYPE_META: Record<string, { label: string; emoji: string }> = {
  food_court: { label: "Food", emoji: "🍔" },
  restroom: { label: "Restroom", emoji: "🚻" },
  entry_gate: { label: "Gates", emoji: "🚪" },
  merchandise: { label: "Shop", emoji: "🛍️" },
  first_aid: { label: "First Aid", emoji: "🏥" },
};

function getWaitColor(minutes: number): string {
  if (minutes <= WAIT_TIME_THRESHOLDS.SHORT) return "text-emerald-400";
  if (minutes <= WAIT_TIME_THRESHOLDS.MODERATE) return "text-amber-400";
  if (minutes <= WAIT_TIME_THRESHOLDS.LONG) return "text-orange-400";
  return "text-red-400";
}

export default function WaitTimeDisplay({
  venues,
  userZone,
}: WaitTimeDisplayProps) {
  const primaryTypes: VenueType[] = [
    VENUE_TYPES.FOOD_COURT,
    VENUE_TYPES.RESTROOM,
    VENUE_TYPES.MERCHANDISE,
  ];

  return (
    <Card as="section">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Nearest Wait Times
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {primaryTypes.map((type) => {
          const nearestOpen = venues
            .filter((v) => v.type === type && v.isOpen)
            .sort((a, b) => {
              const aLocal = a.zoneId === userZone ? 0 : 1;
              const bLocal = b.zoneId === userZone ? 0 : 1;
              if (aLocal !== bLocal) return aLocal - bLocal;
              return a.estimatedWaitMinutes - b.estimatedWaitMinutes;
            });

          const best = nearestOpen[0];
          const meta = TYPE_META[type] ?? { label: type, emoji: "📍" };

          return (
            <div
              key={type}
              className="flex flex-col items-center rounded-xl bg-slate-800/30 p-4 text-center"
            >
              <span className="text-2xl" aria-hidden="true">
                {meta.emoji}
              </span>
              <p className="mt-2 text-xs font-medium text-slate-400">
                {meta.label}
              </p>
              <p
                className={`mt-1 text-xl font-bold ${best ? getWaitColor(best.estimatedWaitMinutes) : "text-slate-600"}`}
              >
                {best ? `${String(best.estimatedWaitMinutes)}m` : "N/A"}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
