/**
 * Zone status grid — displays all zones as cards with density indicators.
 */

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { CrowdDensityReport } from "@/lib/types";

interface ZoneStatusGridProps {
  readonly crowdReport: readonly CrowdDensityReport[];
}

const DENSITY_COLORS: Record<string, string> = {
  low: "from-emerald-500/20 to-emerald-600/5",
  moderate: "from-sky-500/20 to-sky-600/5",
  high: "from-orange-500/20 to-orange-600/5",
  critical: "from-red-500/20 to-red-600/5",
};

const DENSITY_BADGE: Record<string, "low" | "medium" | "high" | "critical"> = {
  low: "low",
  moderate: "medium",
  high: "high",
  critical: "critical",
};

export default function ZoneStatusGrid({ crowdReport }: ZoneStatusGridProps) {
  return (
    <Card as="section">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Zone Status
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {crowdReport.map((zone) => (
          <article
            key={zone.zoneId}
            className={`rounded-xl border border-white/10 bg-gradient-to-br p-4 transition-all duration-300 hover:scale-[1.02] ${
              DENSITY_COLORS[zone.densityLevel] ?? DENSITY_COLORS.low
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {zone.zoneName}
                </h3>
                <p className="mt-1 text-2xl font-bold text-white">
                  {zone.occupancyPercent}%
                </p>
              </div>
              <Badge
                label={zone.densityLevel}
                variant={DENSITY_BADGE[zone.densityLevel] ?? "low"}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {zone.currentOccupancy.toLocaleString()} /{" "}
              {zone.maxCapacity.toLocaleString()} capacity
            </p>
          </article>
        ))}
      </div>
    </Card>
  );
}
