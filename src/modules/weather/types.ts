export type WeatherAction =
  | "getAtVenue"
  | "getAtLocation"
  | "getForEvent"
  | "listSystems";

export type WeatherSummary =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow";

export type WeatherSystemType = "cloudy" | "rain" | "storm" | "snow";

export type TemperatureUnit = "fahrenheit" | "celsius";
export type WindUnit = "mph" | "kph";

export interface WeatherGetAtVenueInput {
  action: "getAtVenue";
  venueId: string;
  isoUtc?: string;
}

export interface WeatherGetAtLocationInput {
  action: "getAtLocation";
  locationId: string;
  isoUtc?: string;
}

export interface WeatherGetForEventInput {
  action: "getForEvent";
  eventId: string;
  phase?: "start" | "end";
}

export interface WeatherListSystemsInput {
  action: "listSystems";
  isoUtc?: string;
}

export type WeatherInput =
  | WeatherGetAtVenueInput
  | WeatherGetAtLocationInput
  | WeatherGetForEventInput
  | WeatherListSystemsInput;

export interface WeatherSystem {
  id: string;
  type: WeatherSystemType;
  spawnLat: number;
  spawnLon: number;
  radiusKm: number;
  velocityKmPerHour: number;
  bearingDeg: number;
  intensity: number;
  spawnEpochMs: number;
}

export interface WeatherSystemAtTime {
  id: string;
  type: WeatherSystemType;
  centerLat: number;
  centerLon: number;
  radiusKm: number;
  intensity: number;
}

export interface SeasonalBaseline {
  temperature: number;
  temperatureUnit: TemperatureUnit;
  precipitationChance: number;
  humidity: number;
  typicalSummary: WeatherSummary;
}

export interface WeatherInfluence {
  systemId: string;
  systemType: WeatherSystemType;
  distanceKm: number;
  influence: number;
}

export interface WeatherConditions {
  summary: WeatherSummary;
  temperature: number;
  temperatureUnit: TemperatureUnit;
  precipitationChance: number;
  windSpeed: number;
  windUnit: WindUnit;
  humidity: number;
}

export interface WeatherOutput {
  isoUtc: string;
  latitude: number;
  longitude: number;
  venueId?: string;
  venueName?: string;
  isIndoor?: boolean;
  /** False for indoor venues — outdoor conditions do not affect the event */
  weatherApplies: boolean;
  locationId: string;
  locationName: string;
  country: string;
  dayOfYear: number;
  conditions: WeatherConditions;
  seasonalBaseline: SeasonalBaseline;
  activeInfluences: WeatherInfluence[];
}

export interface WeatherSystemsOutput {
  isoUtc: string;
  systems: WeatherSystemAtTime[];
}

export type WeatherResult = WeatherOutput | WeatherSystemsOutput;
