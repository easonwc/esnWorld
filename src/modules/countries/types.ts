export type CountryAction = "create" | "get" | "delete";

export interface CountryCreateInput {
  action: "create";
  name: string;
  /** ISO 3166-1 alpha-2 code used to download and link a local flag image */
  isoCode: string;
  languages: string[];
}

export interface CountryGetInput {
  action: "get";
  id: string;
}

export interface CountryDeleteInput {
  action: "delete";
  id: string;
}

export type CountryInput =
  | CountryCreateInput
  | CountryGetInput
  | CountryDeleteInput;

/** Persisted country fields plus population aggregated from city locations. */
export interface Country {
  id: string;
  name: string;
  isoCode: string;
  /** Public URL path to a locally stored flag image, e.g. /flags/us.svg */
  flag: string;
  languages: string[];
  population: number;
}

export type CountryOutput =
  | Country
  | Country[]
  | { deleted: true; id: string };
