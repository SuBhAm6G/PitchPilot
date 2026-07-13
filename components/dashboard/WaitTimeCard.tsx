/**
 * Wait time card — displays food, restroom, and gate wait times.
 */

import { useMemo, memo } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Venue } from "@/lib/types";
import { VENUE_TYPES, WAIT_TIME_THRESHOLDS } from "@/lib/utils/constants";
import type { VenueType } from "@/lib/utils/constants";

interface WaitTimeCardProps {
  readonly venues: readonly Venue[];
}

const VENUE_LABELS: Record<VenueType, { label: string; emoji: string }> = {
  food_court: { label: "Food Courts", emoji: "🍔" },
  restroom: { label: "Restrooms", emoji: "🚻" },
  entry_gate: { label: "Entry Gates", emoji: "🚪" },
  merchandise: { label: "Merchandise", emoji: "🛍️" },
  first_aid: { label: "First Aid", emoji: "🏥" },
};

function getWaitVariant(
  minutes: number,
): "low" | "medium" | "high" | "critical" {
  if (minutes <= WAIT_TIME_THRESHOLDS.SHORT) return "low";
  if (minutes <= WAIT_TIME_THRESHOLDS.MODERATE) return "medium";
  if (minutes <= WAIT_TIME_THRESHOLDS.LONG) return "high";
  return "critical";
}

const WaitTimeCard = memo(function WaitTimeCard({ venues }: WaitTimeCardProps) {
  const venueTypes = useMemo(() => Object.values(VENUE_TYPES), []);

  return (
    <Card as="section">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Wait Times
      </h2>

      <div className="flex flex-col gap-4">
        {venueTypes.map((type) => {
          const typeVenues = venues.filter((v) => v.type === type && v.isOpen);
          const avgWait =
            typeVenues.length > 0
              ? Math.round(
                  typeVenues.reduce(
                    (sum, v) => sum + v.estimatedWaitMinutes,
                    0,
                  ) / typeVenues.length,
                )
              : 0;
          const meta = VENUE_LABELS[type];

          return (
            <div
              key={type}
              className="flex items-center justify-between rounded-xl bg-slate-800/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">
                  {meta.emoji}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {meta.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {typeVenues.length} open
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{avgWait}m</span>
                <Badge
                  label={getWaitVariant(avgWait)}
                  variant={getWaitVariant(avgWait)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
});

export default WaitTimeCard;
