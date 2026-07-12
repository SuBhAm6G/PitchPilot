/**
 * Unit tests for weatherEngine — weather-based recommendations.
 * Tests hot/cold/rain advisories, edge cases, and deterministic output.
 */

import { describe, it, expect } from "vitest";
import { getWeatherRecommendations } from "@/lib/engine/weatherEngine";
import type { WeatherAdvisory } from "@/lib/types";
import { WEATHER_THRESHOLDS } from "@/lib/utils/constants";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function createWeather(overrides: Partial<WeatherAdvisory> = {}): WeatherAdvisory {
  return {
    condition: "clear",
    temperatureCelsius: 22,
    advisory: "Perfect conditions for a match.",
    recommendedGate: "Gate A",
    icon: "☀️",
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("weatherEngine", () => {
  describe("getWeatherRecommendations — clear weather", () => {
    it("should return no recommendations for mild, clear weather", () => {
      const weather = createWeather();
      const recs = getWeatherRecommendations(weather);
      expect(recs).toHaveLength(0);
    });
  });

  describe("getWeatherRecommendations — hot weather", () => {
    it("should return a heat warning when temperature exceeds HOT_CELSIUS", () => {
      const weather = createWeather({ temperatureCelsius: WEATHER_THRESHOLDS.HOT_CELSIUS + 1 });
      const recs = getWeatherRecommendations(weather);
      expect(recs.length).toBeGreaterThanOrEqual(1);
      expect(recs.some(r => r.title.includes("Heat"))).toBe(true);
    });

    it("should include hydration advice in the heat warning message", () => {
      const weather = createWeather({ temperatureCelsius: 38 });
      const recs = getWeatherRecommendations(weather);
      expect(recs.some(r => r.message.toLowerCase().includes("hydrat"))).toBe(true);
    });
  });

  describe("getWeatherRecommendations — cold weather", () => {
    it("should return a cold weather recommendation below COLD_CELSIUS", () => {
      const weather = createWeather({ temperatureCelsius: WEATHER_THRESHOLDS.COLD_CELSIUS - 1 });
      const recs = getWeatherRecommendations(weather);
      expect(recs.length).toBeGreaterThanOrEqual(1);
      expect(recs.some(r => r.title.includes("Cold"))).toBe(true);
    });
  });

  describe("getWeatherRecommendations — rain", () => {
    it("should return a rain advisory when condition is rain", () => {
      const weather = createWeather({ condition: "rain" });
      const recs = getWeatherRecommendations(weather);
      expect(recs.length).toBeGreaterThanOrEqual(1);
      expect(recs.some(r => r.title.includes("Rain"))).toBe(true);
    });

    it("should mention ponchos or umbrellas in rain message", () => {
      const weather = createWeather({ condition: "rain" });
      const recs = getWeatherRecommendations(weather);
      const rainRec = recs.find(r => r.title.includes("Rain"));
      expect(rainRec!.message.toLowerCase()).toMatch(/poncho|umbrella/);
    });
  });

  describe("getWeatherRecommendations — combined conditions", () => {
    it("should return multiple recs for hot + rain weather", () => {
      const weather = createWeather({ condition: "rain", temperatureCelsius: 35 });
      const recs = getWeatherRecommendations(weather);
      expect(recs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("getWeatherRecommendations — determinism", () => {
    it("should produce identical output for identical input", () => {
      const weather = createWeather({ condition: "rain", temperatureCelsius: 8 });
      const recs1 = getWeatherRecommendations(weather);
      const recs2 = getWeatherRecommendations(weather);
      expect(recs1).toEqual(recs2);
    });
  });
});
