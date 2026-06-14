import type { Country } from "@/modules/countries/types";
import type { Location } from "@/modules/locations/types";
import type { Venue } from "@/modules/venues/types";

export interface CountryRecord {
  id: string;
  name: string;
  isoCode: string | null;
  flag: string;
  languages: string[];
}

export interface CountryRepository {
  list(): Promise<CountryRecord[]>;
  get(id: string): Promise<CountryRecord | null>;
  getByName(name: string): Promise<CountryRecord | null>;
  create(country: CountryRecord): Promise<CountryRecord>;
  updateFlag(id: string, flag: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface LocationRepository {
  list(): Promise<Location[]>;
  get(id: string): Promise<Location | null>;
  create(location: Location): Promise<Location>;
  delete(id: string): Promise<boolean>;
  countByCountry(countryId: string): Promise<number>;
  sumPopulationByCountry(countryId: string): Promise<number>;
  clear(): Promise<void>;
}

export interface VenueRepository {
  list(): Promise<Venue[]>;
  listByLocation(locationId: string): Promise<Venue[]>;
  countByLocation(locationId: string): Promise<number>;
  get(id: string): Promise<Venue | null>;
  create(venue: Venue): Promise<Venue>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}
