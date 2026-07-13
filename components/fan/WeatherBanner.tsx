import { memo } from "react";
import type { WeatherAdvisory } from "@/lib/types";

interface WeatherBannerProps {
  readonly weather: WeatherAdvisory;
}

const WeatherBanner = memo(function WeatherBanner({
  weather,
}: WeatherBannerProps) {
  if (!weather) return null;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-sky-500/30 bg-sky-900/20 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-2xl">
        {weather.icon || "⛅"}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sky-100">
            {weather.temperatureCelsius}°C
          </h3>
          <span className="text-sm font-medium text-sky-300 capitalize">
            {weather.condition}
          </span>
        </div>
        <p className="mt-1 text-xs text-sky-200">{weather.advisory}</p>
        {weather.recommendedGate && (
          <p className="mt-1 text-xs font-semibold text-sky-400">
            Recommended Gate: {weather.recommendedGate}
          </p>
        )}
      </div>
    </div>
  );
});

export default WeatherBanner;
