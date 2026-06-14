import { loadWorldClockConfig } from "@/modules/world-clock/config";
import { WeatherError, WeatherErrorCodes } from "./errors";
import type { TemperatureUnit, WindUnit } from "./types";

export const DEFAULT_WEATHER_SEED = 42;
export const DEFAULT_TEMPERATURE_UNIT: TemperatureUnit = "fahrenheit";
export const DEFAULT_WIND_UNIT: WindUnit = "mph";

export interface WeatherConfig {
  seed: number;
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
  worldStartEpochMs: number;
}

const TEMPERATURE_UNITS = new Set<TemperatureUnit>(["fahrenheit", "celsius"]);
const WIND_UNITS = new Set<WindUnit>(["mph", "kph"]);

export function loadWeatherConfig(
  env: NodeJS.ProcessEnv = process.env,
): WeatherConfig {
  const clockConfig = loadWorldClockConfig(env);
  const rawSeed = env.WEATHER_SEED ?? String(DEFAULT_WEATHER_SEED);
  const seed = Number(rawSeed);

  if (!Number.isInteger(seed) || seed < 0) {
    throw new WeatherError(
      WeatherErrorCodes.INVALID_SEED,
      `WEATHER_SEED must be a non-negative integer, received: ${rawSeed}`,
    );
  }

  const temperatureUnit = (env.WEATHER_UNITS ??
    DEFAULT_TEMPERATURE_UNIT) as TemperatureUnit;

  if (!TEMPERATURE_UNITS.has(temperatureUnit)) {
    throw new WeatherError(
      WeatherErrorCodes.INVALID_UNITS,
      `WEATHER_UNITS must be fahrenheit or celsius, received: ${env.WEATHER_UNITS}`,
    );
  }

  const windUnit = (env.WEATHER_WIND_UNITS ?? DEFAULT_WIND_UNIT) as WindUnit;

  if (!WIND_UNITS.has(windUnit)) {
    throw new WeatherError(
      WeatherErrorCodes.INVALID_UNITS,
      `WEATHER_WIND_UNITS must be mph or kph, received: ${env.WEATHER_WIND_UNITS}`,
    );
  }

  return {
    seed,
    temperatureUnit,
    windUnit,
    worldStartEpochMs: Date.parse(clockConfig.initialIsoUtc),
  };
}

export function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

export function mphToKph(mph: number): number {
  return Math.round(mph * 1.60934);
}

export function convertTemperature(
  valueF: number,
  unit: TemperatureUnit,
): number {
  return unit === "celsius" ? fahrenheitToCelsius(valueF) : Math.round(valueF);
}

export function convertWindSpeed(valueMph: number, unit: WindUnit): number {
  return unit === "kph" ? mphToKph(valueMph) : Math.round(valueMph);
}
