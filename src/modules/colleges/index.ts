import { getLocationStore, LocationError } from "@/modules/locations";
import {
  getDefaultCollegeRepository,
  type CollegeRepository,
} from "@/persistence/repositories";
import { CollegeError, CollegeErrorCodes } from "./errors";
import {
  buildCollege,
  validateId,
  validateLocationId,
} from "./transform";
import type { College, CollegeInput, CollegeOutput } from "./types";

export class CollegeStore {
  constructor(private readonly repository: CollegeRepository) {}

  async list(): Promise<College[]> {
    return this.repository.list();
  }

  async listByLocation(locationId: string): Promise<College[]> {
    const id = validateLocationId(locationId);
    await getLocationStore().get(id);
    return this.repository.listByLocation(id);
  }

  async countByLocation(locationId: string): Promise<number> {
    return this.repository.countByLocation(locationId);
  }

  async get(id: string): Promise<College> {
    const college = await this.repository.get(id);

    if (!college) {
      throw new CollegeError(
        CollegeErrorCodes.COLLEGE_NOT_FOUND,
        `College not found: ${id}`,
      );
    }

    return college;
  }

  async create(input: {
    name: unknown;
    locationId: unknown;
    attendance: unknown;
  }): Promise<College> {
    const collegeId = crypto.randomUUID();
    const locationId = validateLocationId(input.locationId);

    let location;
    try {
      location = await getLocationStore().get(locationId);
    } catch (error) {
      if (error instanceof LocationError) {
        throw new CollegeError(
          CollegeErrorCodes.LOCATION_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const college = buildCollege(
      input,
      collegeId,
      location.name,
      location.region,
    );
    return this.repository.create(college);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const college = await this.repository.get(id);
    if (!college) {
      throw new CollegeError(
        CollegeErrorCodes.COLLEGE_NOT_FOUND,
        `College not found: ${id}`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForColleges = globalThis as typeof globalThis & {
  __collegeStore?: CollegeStore;
};

export function getCollegeStore(): CollegeStore {
  if (!globalForColleges.__collegeStore) {
    globalForColleges.__collegeStore = new CollegeStore(
      getDefaultCollegeRepository(),
    );
  }
  return globalForColleges.__collegeStore;
}

export function resetCollegeStore(
  repository?: CollegeRepository,
): CollegeStore {
  const store = new CollegeStore(repository ?? getDefaultCollegeRepository());
  globalForColleges.__collegeStore = store;
  return store;
}

export async function executeCollege(input: CollegeInput): Promise<CollegeOutput> {
  const store = getCollegeStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "delete":
      return store.delete(validateId(input.id));

    case "listByLocation":
      return store.listByLocation(validateLocationId(input.locationId));

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new CollegeError(
        CollegeErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listColleges(): Promise<College[]> {
  return getCollegeStore().list();
}

export * from "./types";
export * from "./errors";
export {
  buildCollege,
  validateAttendance,
  validateId,
  validateLocationId,
} from "./transform";
