import { describe, expect, it, beforeEach } from "vitest";
import { buildTournamentEventTree } from "@/modules/golf/materialize";
import {
  orderRotationVenueLinks,
  pickAvailableVenueLink,
  preferredRotationIndex,
} from "@/modules/golf/venue-pick";
import type { GolfTournament, GolfTournamentVenue } from "@/modules/golf/types";
import { getLocationStore, resetLocationStore } from "@/modules/locations";
import { buildLocation } from "@/modules/locations/transform";
import { getVenueStore, resetVenueStore } from "@/modules/venues";
import {
  MemoryCountryRepository,
  MemoryLocationRepository,
  MemoryVenueRepository,
  MemoryVenueResourceRepository,
} from "@/persistence/repositories";
import { mergeCountrySeed } from "@/persistence/seed/countries";

const rotationTournament: GolfTournament = {
  id: "tournament-1",
  tourId: "tour-1",
  slug: "test-rotation",
  name: "Test Rotation",
  isMajor: true,
  purseUsd: 10_000_000,
  entryCriteria: { kind: "open", description: "Open field" },
  venueMode: "rotation",
  typicalDurationDays: 4,
  teeGroupCount: 3,
  fieldSize: 156,
  seasonStartMonth: 5,
  seasonStartDay: 15,
  rotationEpochYear: 2020,
  sortOrder: 1,
  materializeOnSchedule: true,
  scheduleReference: null,
};

describe("pickAvailableVenueLink", () => {
  let locationRepository: MemoryLocationRepository;
  let venueResourceRepository: MemoryVenueResourceRepository;
  let venueLinks: GolfTournamentVenue[];
  let preferredVenueId: string;
  let fallbackVenueId: string;

  beforeEach(async () => {
    const countryRepository = new MemoryCountryRepository();
    locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    venueResourceRepository = new MemoryVenueResourceRepository();

    await mergeCountrySeed(countryRepository);
    const countries = await countryRepository.list();
    const unitedStates = countries.find((entry) => entry.name === "United States");
    expect(unitedStates).toBeDefined();

    const location = buildLocation(
      {
        name: "Test City",
        countryId: unitedStates!.id,
        region: "Test",
        latitude: 40,
        longitude: -75,
        timezone: "America/New_York",
        population: 1_000,
      },
      crypto.randomUUID(),
      unitedStates!.name,
    );
    await locationRepository.create(location);

    resetLocationStore(locationRepository);
    const venueStore = resetVenueStore(venueRepository, venueResourceRepository);

    const venueIds: string[] = [];
    for (const name of ["Host A", "Host B", "Host C", "Host D"]) {
      const venue = await venueStore.create({
        locationId: location.id,
        name,
        latitude: 40,
        longitude: -75,
        isIndoor: false,
        schedulingMode: "multi_resource",
      });
      venueIds.push(venue.id);
      for (let index = 0; index < rotationTournament.teeGroupCount; index += 1) {
        await venueStore.createResource({
          venueId: venue.id,
          name: `Tee Group ${index + 1}`,
          resourceType: "tee_group",
        });
      }
    }

    venueLinks = venueIds.map((venueId, rotationOrder) => ({
      id: `link-${rotationOrder}`,
      tournamentId: rotationTournament.id,
      venueId,
      rotationOrder,
      isDefault: rotationOrder === 0,
    }));

    const preferredIndex = preferredRotationIndex(
      rotationTournament,
      venueLinks.length,
      2026,
    );
    const sorted = [...venueLinks].sort(
      (left, right) => left.rotationOrder - right.rotationOrder,
    );
    preferredVenueId = sorted[preferredIndex]!.venueId;
    fallbackVenueId = sorted[(preferredIndex + 1) % sorted.length]!.venueId;
  });

  it("walks the rotation pool when the preferred host is already booked", async () => {
    const preferredVenue = await getVenueStore().get(preferredVenueId);
    const location = await getLocationStore().get(preferredVenue.locationId);
    const teeGroups = await venueResourceRepository.listByVenue(preferredVenueId);
    const blocker = buildTournamentEventTree({
      tournament: rotationTournament,
      seasonYear: 2026,
      venueId: preferredVenueId,
      timezone: location.timezone,
      teeGroups,
    });

    const pick = await pickAvailableVenueLink({
      tournament: rotationTournament,
      venueLinks,
      seasonYear: 2026,
      locationRepository,
      venueResourceRepository,
      existingEvents: blocker,
      priorPlannedEvents: [],
    });

    expect(pick.venue.id).toBe(fallbackVenueId);
    expect(pick.venue.id).not.toBe(preferredVenueId);
  });
});

describe("orderRotationVenueLinks", () => {
  function venueLink(rotationOrder: number): GolfTournamentVenue {
    return {
      id: `link-${rotationOrder}`,
      tournamentId: rotationTournament.id,
      venueId: `venue-${rotationOrder}`,
      rotationOrder,
      isDefault: rotationOrder === 0,
    };
  }

  it("starts at the epoch-preferred index and walks the pool", () => {
    const links = [0, 1, 2, 3].map((order) => venueLink(order));

    expect(preferredRotationIndex(rotationTournament, links.length, 2026)).toBe(2);

    const ordered = orderRotationVenueLinks(rotationTournament, links, 2026);
    expect(ordered.map((link) => link.rotationOrder)).toEqual([2, 3, 0, 1]);
  });
});
