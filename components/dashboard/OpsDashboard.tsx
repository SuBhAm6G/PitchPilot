/**
 * Ops Dashboard — main operations view for staff users.
 * Orchestrates sub-components. Does NOT contain business logic.
 */

"use client";

import StadiumOverview from "@/components/dashboard/StadiumOverview";
import CrowdDensityCard from "@/components/dashboard/CrowdDensityCard";
import WaitTimeCard from "@/components/dashboard/WaitTimeCard";
import IncidentLog from "@/components/dashboard/IncidentLog";
import ZoneStatusGrid from "@/components/dashboard/ZoneStatusGrid";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { StadiumApiResponse } from "@/lib/types";

interface OpsDashboardProps {
  readonly data: StadiumApiResponse | null;
  readonly isLoading: boolean;
}

export default function OpsDashboard({ data, isLoading }: OpsDashboardProps) {
  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading stadium data..." />
      </div>
    );
  }

  return (
    <section aria-label="Operations Dashboard" className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-white">Operations Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">
          Real-time stadium monitoring · MetLife Stadium
        </p>
      </div>

      {/* Summary stats */}
      <StadiumOverview data={data} />

      {/* Zone grid */}
      <ZoneStatusGrid crowdReport={data.crowdReport} />

      {/* Two-column layout: density + wait times */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CrowdDensityCard crowdReport={data.crowdReport} />
        <WaitTimeCard venues={data.stadiumState.venues} />
      </div>

      {/* Incident log */}
      <IncidentLog incidents={data.stadiumState.incidents} />
    </section>
  );
}
