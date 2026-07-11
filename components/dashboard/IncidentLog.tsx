/**
 * Incident log table — sortable, with severity badges and status indicators.
 */

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Incident } from "@/lib/types";
import { prioritizeIncidents, getSeverityLabel, getStatusLabel } from "@/lib/engine/incidentEngine";

interface IncidentLogProps {
  readonly incidents: readonly Incident[];
}

function severityVariant(severity: number): "low" | "medium" | "high" | "critical" {
  if (severity >= 4) return "critical";
  if (severity >= 3) return "high";
  if (severity >= 2) return "medium";
  return "low";
}

function statusVariant(status: string): "low" | "info" | "success" {
  if (status === "resolved") return "success";
  if (status === "in_progress") return "info";
  return "low";
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function IncidentLog({ incidents }: IncidentLogProps) {
  const sorted = prioritizeIncidents(incidents);

  return (
    <Card as="section">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Incident Log
        </h2>
        <Badge
          label={`${String(incidents.filter((i) => i.status !== "resolved").length)} active`}
          variant={incidents.some((i) => i.severity >= 4) ? "critical" : "info"}
        />
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-600">No incidents reported</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" aria-label="Incident log table">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-600">
                <th scope="col" className="pb-3 pr-4">ID</th>
                <th scope="col" className="pb-3 pr-4">Incident</th>
                <th scope="col" className="pb-3 pr-4">Severity</th>
                <th scope="col" className="pb-3 pr-4">Status</th>
                <th scope="col" className="pb-3 pr-4">Zone</th>
                <th scope="col" className="pb-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  <td className="py-3 pr-4 font-mono text-xs text-slate-500">{incident.id}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-slate-200">{incident.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{incident.description}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      label={getSeverityLabel(incident.severity)}
                      variant={severityVariant(incident.severity)}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      label={getStatusLabel(incident.status)}
                      variant={statusVariant(incident.status)}
                    />
                  </td>
                  <td className="py-3 pr-4 text-slate-400">{incident.zoneId}</td>
                  <td className="py-3 font-mono text-xs text-slate-500">{formatTime(incident.reportedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
