import type { WeatherAdvisory, ContextRecommendation } from "@/lib/types";
import { WEATHER_THRESHOLDS } from "@/lib/utils/constants";

/**
 * Deterministic engine for weather-based recommendations.
 */
export function getWeatherRecommendations(
  weather: WeatherAdvisory
): readonly ContextRecommendation[] {
  const recs: ContextRecommendation[] = [];

  if (!weather) return recs;

  if (weather.temperatureCelsius >= WEATHER_THRESHOLDS.HOT_CELSIUS) {
    recs.push({
      id: "weather-hot",
      type: "safety",
      title: "Extreme Heat Warning",
      message: "It is very hot today. Stay hydrated and seek shade if you feel unwell. Water stations are located near all major exits.",
      priority: 3,
      icon: "alert",
    });
  } else if (weather.temperatureCelsius <= WEATHER_THRESHOLDS.COLD_CELSIUS) {
    recs.push({
      id: "weather-cold",
      type: "safety",
      title: "Cold Weather",
      message: "Temperatures are low. Warm beverages are available at food courts.",
      priority: 2,
      icon: "info",
    });
  }

  if (weather.condition === "rain") {
    recs.push({
      id: "weather-rain",
      type: "general",
      title: "Rain Expected",
      message: "Rain is expected. Umbrellas are not allowed in seating areas; ponchos are sold at merchandise stands.",
      priority: 2,
      icon: "info",
    });
  }

  return recs;
}
