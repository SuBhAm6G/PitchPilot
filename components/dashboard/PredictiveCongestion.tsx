import { memo } from "react";
import Card from "@/components/ui/Card";
import type { CrowdPrediction } from "@/lib/types";

interface PredictiveCongestionProps {
  readonly predictions: readonly CrowdPrediction[];
}

const PredictiveCongestion = memo(function PredictiveCongestion({
  predictions,
}: PredictiveCongestionProps) {
  if (!predictions || predictions.length === 0) return null;

  return (
    <Card as="section">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
        15-Min Congestion Forecast
      </h2>
      <div className="flex flex-col gap-3">
        {predictions.map((pred) => {
          let colorClass = "bg-emerald-500";
          if (pred.predictedDensityLevel === "critical")
            colorClass = "bg-red-500 animate-pulse";
          else if (pred.predictedDensityLevel === "high")
            colorClass = "bg-amber-500";
          else if (pred.predictedDensityLevel === "moderate")
            colorClass = "bg-sky-500";

          return (
            <div
              key={pred.zoneId}
              className="flex items-center justify-between rounded-lg bg-slate-800/30 p-2"
            >
              <span className="text-sm font-medium capitalize text-slate-300">
                {pred.zoneId.replace("-", " ")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">
                  {pred.predictedOccupancyPercent}%
                </span>
                <div
                  className={`h-2 w-2 rounded-full ${colorClass}`}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
});

export default PredictiveCongestion;
