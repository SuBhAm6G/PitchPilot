/**
 * Ops Dashboard — main operations view for staff users.
 * Orchestrates sub-components. Does NOT contain business logic.
 */

"use client";

import { useMemo } from "react";
import StadiumOverview from "@/components/dashboard/StadiumOverview";
import CrowdDensityCard from "@/components/dashboard/CrowdDensityCard";
import WaitTimeCard from "@/components/dashboard/WaitTimeCard";
import IncidentLog from "@/components/dashboard/IncidentLog";
import ZoneStatusGrid from "@/components/dashboard/ZoneStatusGrid";
import GraphicalStadiumMap from "@/components/dashboard/GraphicalStadiumMap";
import ProactiveInsightBrief from "@/components/dashboard/ProactiveInsightBrief";
import StaffCopilot from "@/components/dashboard/StaffCopilot";
import PredictiveCongestion from "@/components/dashboard/PredictiveCongestion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { StadiumApiResponse, UserProfile, CrowdPrediction } from "@/lib/types";

interface OpsDashboardProps {
  readonly data: StadiumApiResponse | null;
  readonly isLoading: boolean;
  readonly userProfile: UserProfile;
  readonly selectedZone?: string;
}

export default function OpsDashboard({ data, isLoading, userProfile, selectedZone }: OpsDashboardProps) {
  const predictions: CrowdPrediction[] = useMemo(() => {
    if (!data) return [];
    return data.crowdReport.slice(0, 4).map((report, index) => ({
      zoneId: report.zoneId,
      predictedOccupancyPercent: Math.min(100, report.occupancyPercent + (index * 2 + 1)),
      predictedDensityLevel: report.densityLevel,
      timeWindowMinutes: 15,
    }));
  }, [data]);

  const staffLocation = useMemo(() => {
    return {
      staffId: userProfile.id,
      name: userProfile.name,
      role: userProfile.role,
      currentZone: userProfile.currentZone,
      isAvailable: true,
    };
  }, [userProfile]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading stadium data..." />
      </div>
    );
  }

  return (
    <section aria-label="Operations Dashboard" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Operations Dashboard</h2>
          <p className="mt-1 text-sm text-slate-400">
            Real-time stadium monitoring · MetLife Stadium
          </p>
        </div>
        <div className="sm:w-80">
          <StaffCopilot incidents={data.stadiumState.incidents} staffProfile={staffLocation} />
        </div>
      </div>

      <ProactiveInsightBrief stadiumState={data.stadiumState} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GraphicalStadiumMap crowdReport={data.crowdReport} selectedZone={selectedZone} />
        </div>
        <div className="col-span-1 flex flex-col gap-6">
          <StadiumOverview data={data} />
          <PredictiveCongestion predictions={predictions} />
        </div>
      </div>

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
