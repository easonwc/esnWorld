import { getDayOfYear, isLeapYear } from "@/modules/calendar";
import type { TemperatureUnit, WeatherSummary } from "./types";

export interface SeasonalBaselineInternal {
  temperatureF: number;
  precipitationChance: number;
  humidity: number;
  typicalSummary: WeatherSummary;
}

export function computeSeasonalBaseline(
  latitude: number,
  year: number,
  month: number,
  day: number,
): SeasonalBaselineInternal {
  const dayOfYear = getDayOfYear(year, month, day);
  const daysInYear = isLeapYear(year) ? 366 : 365;
  const hemisphere = latitude >= 0 ? 1 : -1;
  const summerPeakDay = hemisphere > 0 ? 172 : 355;
  const angle = (2 * Math.PI * (dayOfYear - summerPeakDay)) / daysInYear;
  const amplitude = Math.min(32, 12 + Math.abs(latitude) * 0.35);
  const meanTempF = 64 - Math.abs(latitude - 38) * 0.7;
  const temperatureF = meanTempF + amplitude * Math.cos(angle);

  const precipitationChance = clamp(
    0.18 + 0.12 * Math.sin(angle + 0.8) + (Math.abs(latitude) > 45 ? 0.05 : 0),
    0.05,
    0.55,
  );

  const humidity = clamp(0.45 + 0.2 * Math.cos(angle - 0.5), 0.25, 0.85);

  const typicalSummary: WeatherSummary =
    temperatureF < 34
      ? "snow"
      : precipitationChance > 0.35
        ? "rain"
        : precipitationChance > 0.22
          ? "cloudy"
          : "clear";

  return {
    temperatureF,
    precipitationChance,
    humidity,
    typicalSummary,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function toDisplaySeasonalBaseline(
  baseline: SeasonalBaselineInternal,
  temperatureUnit: TemperatureUnit,
  convertTemperature: (valueF: number, unit: TemperatureUnit) => number,
) {
  return {
    temperature: convertTemperature(baseline.temperatureF, temperatureUnit),
    temperatureUnit,
    precipitationChance: round2(baseline.precipitationChance),
    humidity: round2(baseline.humidity),
    typicalSummary: baseline.typicalSummary,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
