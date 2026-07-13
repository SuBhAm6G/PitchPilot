import { memo, useState } from "react";
import Card from "@/components/ui/Card";
import type { Incident, StaffLocation } from "@/lib/types";

interface StaffCopilotProps {
  readonly incidents: readonly Incident[];
  readonly staffProfile: StaffLocation;
}

const StaffCopilot = memo(function StaffCopilot({
  incidents,
  staffProfile,
}: StaffCopilotProps) {
  const [claimedIncidentId, setClaimedIncidentId] = useState<string | null>(
    null,
  );

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const myIncidents = activeIncidents.filter(
    (i) => i.assignedTo === staffProfile.staffId || i.id === claimedIncidentId,
  );
  const urgentIncidents = activeIncidents.filter(
    (i) => i.severity >= 3 && i.status === "open" && i.id !== claimedIncidentId,
  );

  return (
    <Card as="section" className="border-indigo-500/30 bg-indigo-900/10">
      <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
            />
          </svg>
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
          Staff AI Copilot
        </h2>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {myIncidents.length > 0 && myIncidents[0] ? (
          <div className="rounded-lg border border-indigo-500/20 bg-slate-900/50 p-3">
            <h3 className="text-xs font-semibold text-slate-400">
              Your Current Task
            </h3>
            <p className="mt-1 font-medium text-indigo-200">
              {myIncidents[0].title}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              Location: {myIncidents[0].zoneId}
            </p>
          </div>
        ) : urgentIncidents.length > 0 && urgentIncidents[0] ? (
          <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3">
            <h3 className="text-xs font-semibold text-amber-500">
              Unassigned Priority Task
            </h3>
            <p className="mt-1 font-medium text-amber-200">
              {urgentIncidents[0].title}
            </p>
            <button
              onClick={() =>
                setClaimedIncidentId(urgentIncidents[0]?.id ?? null)
              }
              className="mt-2 rounded bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
            >
              Claim Task
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No active assignments. Standby in your current zone.
          </p>
        )}
      </div>
    </Card>
  );
});

export default StaffCopilot;
