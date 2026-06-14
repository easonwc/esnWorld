import { transformCalendar } from "@/modules/calendar";
import { parseIsoUtc } from "@/modules/locations";
import {
  convertTemperature,
  convertWindSpeed,
  type WeatherConfig,
} from "./config";
import { seededUnitFloat } from "./random";
import {
  computeSeasonalBaseline,
  toDisplaySeasonalBaseline,
} from "./seasonal";
import { systemInfluence, systemPositionAt, haversineKm } from "./systems";
import type {
  TemperatureUnit,
  WeatherConditions,
  WeatherInfluence,
  WeatherOutput,
  WeatherSummary,
  WeatherSystem,
  WeatherSystemAtTime,
  WeatherSystemType,
  WindUnit,
} from "./types";

export interface WeatherPointInput {
  latitude: number;
  longitude: number;
  isoUtc: string;
  locationId: string;
  locationName: string;
  country: string;
  timezone: string;
  venueId?: string;
  venueName?: string;
  isIndoor?: boolean;
  weatherApplies: boolean;
}

export function transformWeatherAtPoint(
  input: WeatherPointInput,
  systems: WeatherSystem[],
  config: WeatherConfig,
): WeatherOutput {
  const epochMs = Date.parse(parseIsoUtc(input.isoUtc));
  const calendar = transformCalendar({
    action: "fromIso",
    isoUtc: input.isoUtc,
  });

  const seasonal = computeSeasonalBaseline(
    input.latitude,
    calendar.year,
    calendar.month,
    calendar.day,
  );

  const influences: WeatherInfluence[] = systems
    .map((system) => {
      const position = systemPositionAt(system, epochMs);
      const distanceKm = haversineKm(
        input.latitude,
        input.longitude,
        position.lat,
        position.lon,
      );
      const influence = systemInfluence(
        system,
        epochMs,
        input.latitude,
        input.longitude,
      );

      return {
        systemId: system.id,
        systemType: system.type,
        distanceKm: Math.round(distanceKm),
        influence: round2(influence),
      };
    })
    .filter((item) => item.influence > 0)
    .sort((a, b) => b.influence - a.influence);

  const cloudInfluence = sumInfluence(influences, ["cloudy"]);
  const rainInfluence = sumInfluence(influences, ["rain", "storm"]);
  const stormInfluence = sumInfluence(influences, ["storm"]);
  const snowInfluence = sumInfluence(influences, ["snow"]);

  const jitter = seededUnitFloat(
    config.seed,
    input.latitude,
    input.longitude,
    Math.floor(epochMs / 3_600_000),
  );

  const temperatureF =
    seasonal.temperatureF -
    cloudInfluence * 3 -
    rainInfluence * 5 -
    snowInfluence * 8;

  const precipitationChance = clamp(
    seasonal.precipitationChance +
      rainInfluence * 0.45 +
      snowInfluence * 0.35 +
      (jitter - 0.5) * 0.08,
    0,
    0.98,
  );

  const humidity = clamp(
    seasonal.humidity + rainInfluence * 0.2 + cloudInfluence * 0.08,
    0.1,
    0.99,
  );

  const windMph = clamp(
    6 + stormInfluence * 28 + rainInfluence * 10 + jitter * 8,
    0,
    60,
  );

  const summary = deriveSummary({
    temperatureF,
    precipitationChance,
    cloudInfluence,
    rainInfluence,
    stormInfluence,
    snowInfluence,
  });

  const conditions = toDisplayConditions(
    {
      summary,
      temperatureF,
      precipitationChance,
      humidity,
      windMph,
    },
    config.temperatureUnit,
    config.windUnit,
  );

  return {
    isoUtc: input.isoUtc,
    latitude: input.latitude,
    longitude: input.longitude,
    venueId: input.venueId,
    venueName: input.venueName,
    isIndoor: input.isIndoor,
    weatherApplies: input.weatherApplies,
    locationId: input.locationId,
    locationName: input.locationName,
    country: input.country,
    dayOfYear: calendar.dayOfYear,
    conditions,
    seasonalBaseline: toDisplaySeasonalBaseline(
      seasonal,
      config.temperatureUnit,
      convertTemperature,
    ),
    activeInfluences: influences,
  };
}

export function listSystemsAtTime(
  systems: WeatherSystem[],
  isoUtc: string,
): WeatherSystemAtTime[] {
  const epochMs = Date.parse(parseIsoUtc(isoUtc));

  return systems.map((system) => {
    const position = systemPositionAt(system, epochMs);
    return {
      id: system.id,
      type: system.type,
      centerLat: round2(position.lat),
      centerLon: round2(position.lon),
      radiusKm: system.radiusKm,
      intensity: system.intensity,
    };
  });
}

function deriveSummary(args: {
  temperatureF: number;
  precipitationChance: number;
  cloudInfluence: number;
  rainInfluence: number;
  stormInfluence: number;
  snowInfluence: number;
}): WeatherSummary {
  if (
    args.temperatureF < 34 &&
    (args.snowInfluence > 0.2 || args.precipitationChance > 0.45)
  ) {
    return "snow";
  }

  if (args.stormInfluence > 0.45 || args.precipitationChance > 0.72) {
    return "storm";
  }

  if (args.precipitationChance > 0.45 || args.rainInfluence > 0.35) {
    return "rain";
  }

  if (args.cloudInfluence > 0.45 || args.precipitationChance > 0.28) {
    return "cloudy";
  }

  if (args.cloudInfluence > 0.18) {
    return "partly_cloudy";
  }

  return "clear";
}

function toDisplayConditions(
  internal: {
    summary: WeatherSummary;
    temperatureF: number;
    precipitationChance: number;
    humidity: number;
    windMph: number;
  },
  temperatureUnit: TemperatureUnit,
  windUnit: WindUnit,
): WeatherConditions {
  return {
    summary: internal.summary,
    temperature: convertTemperature(internal.temperatureF, temperatureUnit),
    temperatureUnit,
    precipitationChance: round2(internal.precipitationChance),
    windSpeed: convertWindSpeed(internal.windMph, windUnit),
    windUnit,
    humidity: round2(internal.humidity),
  };
}

function sumInfluence(
  influences: WeatherInfluence[],
  types: WeatherSystemType[],
): number {
  return influences
    .filter((item) => types.includes(item.systemType))
    .reduce((sum, item) => sum + item.influence, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
