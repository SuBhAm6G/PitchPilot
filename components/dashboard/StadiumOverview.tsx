/**
 * Stadium overview summary — total occupancy, active alerts, average wait.
 * Memoized for efficient rendering.
 */

import { useMemo, memo } from "react";
import Card from "@/components/ui/Card";
import type { StadiumApiResponse } from "@/lib/types";
import { UI_WARNING_THRESHOLDS } from "@/lib/utils/constants";
import { formatMatchPhase } from "@/lib/utils/formatters";

interface StadiumOverviewProps {
  readonly data: StadiumApiResponse;
}

interface StatItem {
  readonly label: string;
  readonly value: string;
  readonly subtext: string;
  readonly colorClass: string;
}

const StadiumOverview = memo(function StadiumOverview({
  data,
}: StadiumOverviewProps) {
  const stats = useMemo<readonly StatItem[]>(() => {
    const criticalZones = data.crowdReport.filter(
      (z) => z.densityLevel === "critical",
    ).length;

    const highZones = data.crowdReport.filter(
      (z) => z.densityLevel === "high",
    ).length;

    const activeIncidents = data.stadiumState.incidents.filter(
      (inc) => inc.status !== "resolved",
    ).length;

    return [
      {
        label: "Total Occupancy",
        value: data.totalOccupancy.toLocaleString(),
        subtext: `of ${data.totalCapacity.toLocaleString()} · ${String(data.occupancyPercent)}%`,
        colorClass:
          data.occupancyPercent >= UI_WARNING_THRESHOLDS.OCCUPANCY_PERCENT
            ? "text-orange-400"
            : "text-emerald-400",
      },
      {
        label: "Critical Zones",
        value: String(criticalZones),
        subtext: `${String(highZones)} high density`,
        colorClass: criticalZones > 0 ? "text-red-400" : "text-emerald-400",
      },
      {
        label: "Active Incidents",
        value: String(activeIncidents),
        subtext: `of ${String(data.stadiumState.incidents.length)} total`,
        colorClass:
          activeIncidents > UI_WARNING_THRESHOLDS.ACTIVE_INCIDENTS
            ? "text-orange-400"
            : "text-sky-400",
      },
      {
        label: "Match Phase",
        value: formatMatchPhase(data.stadiumState.matchPhase),
        subtext: "Current status",
        colorClass: "text-indigo-400",
      },
    ];
  }, [data]);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} as="article">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {stat.label}
          </p>
          <p className={`mt-1 text-2xl font-bold ${stat.colorClass}`}>
            {stat.value}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{stat.subtext}</p>
        </Card>
      ))}
    </div>
  );
});

export default StadiumOverview;
