/**
 * Crowd density card — zone-by-zone density visualization with progress bars.
 */

import { useMemo, memo } from "react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import type { CrowdDensityReport } from "@/lib/types";

interface CrowdDensityCardProps {
  readonly crowdReport: readonly CrowdDensityReport[];
}

const DENSITY_BADGE_VARIANT: Record<string, BadgeVariant> = {
  low: "low",
  moderate: "info",
  high: "high",
  critical: "critical",
};

const CrowdDensityCard = memo(function CrowdDensityCard({ crowdReport }: CrowdDensityCardProps) {
  const sortedReport = useMemo(() => {
    return [...crowdReport].sort(
      (a, b) => b.occupancyPercent - a.occupancyPercent
    );
  }, [crowdReport]);

  return (
    <Card as="section">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Crowd Density
        </h2>
        <span className="text-xs text-slate-600">
          {sortedReport.length} zones
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {sortedReport.map((zone) => (
          <div key={zone.zoneId} className="group">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                {zone.zoneName}
              </span>
              <Badge
                label={zone.densityLevel}
                variant={DENSITY_BADGE_VARIANT[zone.densityLevel] ?? "low"}
              />
            </div>
            <ProgressBar
              value={zone.currentOccupancy}
              max={zone.maxCapacity}
              label={zone.zoneName}
              showPercentage={false}
            />
            <p className="mt-1 text-xs text-slate-600">
              {zone.currentOccupancy.toLocaleString()} / {zone.maxCapacity.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
});

export default CrowdDensityCard;
