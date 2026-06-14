import { createSeededRng } from "./random";
import type { WeatherSystem, WeatherSystemAtTime, WeatherSystemType } from "./types";

const SYSTEM_TYPES: WeatherSystemType[] = ["cloudy", "rain", "storm", "snow"];

export function createWeatherSystems(
  seed: number,
  spawnEpochMs: number,
  count = 3,
): WeatherSystem[] {
  const rng = createSeededRng(seed);

  return Array.from({ length: count }, (_, index) => {
    const type = SYSTEM_TYPES[Math.floor(rng() * SYSTEM_TYPES.length)];

    return {
      id: `system-${index + 1}`,
      type,
      spawnLat: 25 + rng() * 25,
      spawnLon: -125 + rng() * 55,
      radiusKm: 120 + rng() * 180,
      velocityKmPerHour: 15 + rng() * 35,
      bearingDeg: rng() * 360,
      intensity: 0.35 + rng() * 0.5,
      spawnEpochMs,
    };
  });
}

export function systemPositionAt(
  system: WeatherSystem,
  epochMs: number,
): { lat: number; lon: number } {
  const elapsedHours = Math.max(0, epochMs - system.spawnEpochMs) / 3_600_000;
  return advancePosition(
    system.spawnLat,
    system.spawnLon,
    system.velocityKmPerHour,
    system.bearingDeg,
    elapsedHours,
  );
}

export function systemAtTime(
  system: WeatherSystem,
  epochMs: number,
): WeatherSystemAtTime {
  const position = systemPositionAt(system, epochMs);

  return {
    id: system.id,
    type: system.type,
    centerLat: position.lat,
    centerLon: position.lon,
    radiusKm: system.radiusKm,
    intensity: system.intensity,
  };
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function systemInfluence(
  system: WeatherSystem,
  epochMs: number,
  latitude: number,
  longitude: number,
): number {
  const position = systemPositionAt(system, epochMs);
  const distanceKm = haversineKm(
    latitude,
    longitude,
    position.lat,
    position.lon,
  );

  if (distanceKm >= system.radiusKm) {
    return 0;
  }

  const falloff = 1 - distanceKm / system.radiusKm;
  return system.intensity * falloff;
}

function advancePosition(
  lat: number,
  lon: number,
  speedKmH: number,
  bearingDeg: number,
  hours: number,
): { lat: number; lon: number } {
  const distanceKm = speedKmH * hours;
  const angularDistance = distanceKm / 6371;
  const bearing = (bearingDeg * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing),
  );

  const lon2 =
    lonRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(lat2),
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lon: (((lon2 * 180) / Math.PI + 540) % 360) - 180,
  };
}
