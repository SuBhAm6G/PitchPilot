import { memo } from "react";
import type { EmergencyRoute } from "@/lib/types";

interface EmergencyBannerProps {
  readonly route: EmergencyRoute;
}

const EmergencyBanner = memo(function EmergencyBanner({ route }: EmergencyBannerProps) {
  if (!route) return null;

  return (
    <div className="flex animate-pulse items-start gap-4 rounded-xl border border-red-500 bg-red-950/50 p-4 shadow-lg shadow-red-900/20">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-red-100 uppercase tracking-wide">Emergency Evacuation</h3>
        <p className="mt-1 text-sm font-semibold text-red-200">
          Nearest Exit: {route.nearestExit}
        </p>
        <ul className="mt-2 list-inside list-disc text-xs text-red-300">
          {route.instructions.map((inst, i) => (
            <li key={i}>{inst}</li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default EmergencyBanner;
