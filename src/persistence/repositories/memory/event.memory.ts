import type { EventRecord } from "@/modules/events/types";
import { paginateArray, type ListOptions } from "@/lib/pagination";
import type { EventRepository } from "../types";

function sortByStart(events: EventRecord[]): EventRecord[] {
  return [...events].sort((left, right) =>
    left.isoUtcStart.localeCompare(right.isoUtcStart),
  );
}

export class MemoryEventRepository implements EventRepository {
  private readonly events = new Map<string, EventRecord>();

  async list(options?: ListOptions): Promise<EventRecord[]> {
    const sorted = sortByStart([...this.events.values()]);
    return options ? paginateArray(sorted, options) : sorted;
  }

  async count(): Promise<number> {
    return this.events.size;
  }

  async listByVenue(venueId: string): Promise<EventRecord[]> {
    return sortByStart(
      [...this.events.values()].filter((event) => event.venueId === venueId),
    );
  }

  async listDirectChildren(parentId: string): Promise<EventRecord[]> {
    return sortByStart(
      [...this.events.values()].filter((event) => event.parentId === parentId),
    );
  }

  async listActiveAt(isoUtc: string): Promise<EventRecord[]> {
    const now = Date.parse(isoUtc);
    return sortByStart(
      [...this.events.values()].filter((event) => {
        const start = Date.parse(event.isoUtcStart);
        const end = Date.parse(event.isoUtcEnd);
        return now >= start && now < end;
      }),
    );
  }

  async get(id: string): Promise<EventRecord | null> {
    return this.events.get(id) ?? null;
  }

  async create(event: EventRecord): Promise<EventRecord> {
    this.events.set(event.id, event);
    return event;
  }

  async update(event: EventRecord): Promise<EventRecord> {
    this.events.set(event.id, event);
    return event;
  }

  async delete(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  async clear(): Promise<void> {
    this.events.clear();
  }
}
