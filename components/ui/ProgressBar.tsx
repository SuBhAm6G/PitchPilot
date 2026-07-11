/**
 * Accessible progress bar with label and percentage display.
 */
import { PROGRESS_THRESHOLDS } from "@/lib/utils/constants";

interface ProgressBarProps {
  readonly value: number;
  readonly max: number;
  readonly label: string;
  readonly colorClass?: string;
  readonly showPercentage?: boolean;
}

function getColorClass(percentage: number): string {
  if (percentage >= PROGRESS_THRESHOLDS.CRITICAL) return "bg-red-500";
  if (percentage >= PROGRESS_THRESHOLDS.HIGH) return "bg-orange-500";
  if (percentage >= PROGRESS_THRESHOLDS.MEDIUM) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function ProgressBar({
  value,
  max,
  label,
  colorClass,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const resolvedColor = colorClass ?? getColorClass(percentage);

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        {showPercentage && (
          <span className="font-mono text-slate-400">{percentage}%</span>
        )}
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700/50"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${percentage}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${resolvedColor}`}
          style={{ width: `${String(percentage)}%` }}
        />
      </div>
    </div>
  );
}
