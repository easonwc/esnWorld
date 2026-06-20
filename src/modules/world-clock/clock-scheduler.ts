import type { GolfSchedulingProcessResult } from "./types";

export type ClockTransitionHandler = (
  beforeIsoUtc: string,
  afterIsoUtc: string,
) => Promise<GolfSchedulingProcessResult[] | void>;

type ClockSchedulerGlobal = typeof globalThis & {
  __clockTransitionHandlers?: ClockTransitionHandler[];
  __worldClockSchedulerIntervalId?: ReturnType<typeof setInterval> | null;
  __worldClockSchedulerLastCheckpointIso?: string | null;
};

const globalForClockScheduler = globalThis as ClockSchedulerGlobal;

function getHandlers(): ClockTransitionHandler[] {
  if (!globalForClockScheduler.__clockTransitionHandlers) {
    globalForClockScheduler.__clockTransitionHandlers = [];
  }
  return globalForClockScheduler.__clockTransitionHandlers;
}

export function registerClockTransitionHandler(
  handler: ClockTransitionHandler,
): void {
  getHandlers().push(handler);
}

export function clearClockTransitionHandlers(): void {
  getHandlers().length = 0;
}

export async function runClockTransitionHandlers(
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<void> {
  for (const handler of getHandlers()) {
    await handler(beforeIsoUtc, afterIsoUtc);
  }
}

function getIntervalId(): ReturnType<typeof setInterval> | null {
  return globalForClockScheduler.__worldClockSchedulerIntervalId ?? null;
}

function setIntervalId(id: ReturnType<typeof setInterval> | null): void {
  globalForClockScheduler.__worldClockSchedulerIntervalId = id;
}

function getLastCheckpointIso(): string | null {
  return globalForClockScheduler.__worldClockSchedulerLastCheckpointIso ?? null;
}

function setLastCheckpointIso(iso: string | null): void {
  globalForClockScheduler.__worldClockSchedulerLastCheckpointIso = iso;
}

export function armWorldClockScheduler(getIsoUtc: () => string): void {
  disarmWorldClockScheduler();
  setLastCheckpointIso(getIsoUtc());

  if (process.env.VITEST === "true") {
    return;
  }

  const intervalId = setInterval(() => {
    void (async () => {
      const afterIsoUtc = getIsoUtc();
      const beforeIsoUtc = getLastCheckpointIso();
      if (!beforeIsoUtc || afterIsoUtc === beforeIsoUtc) {
        return;
      }

      await runClockTransitionHandlers(beforeIsoUtc, afterIsoUtc);
      setLastCheckpointIso(afterIsoUtc);
    })();
  }, 1000);

  setIntervalId(intervalId);
}

export function disarmWorldClockScheduler(finalIsoUtc?: string): void {
  const intervalId = getIntervalId();
  if (intervalId !== null) {
    clearInterval(intervalId);
    setIntervalId(null);
  }

  if (finalIsoUtc !== undefined) {
    setLastCheckpointIso(finalIsoUtc);
  }
}

export async function finalizeWorldClockScheduler(
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<void> {
  disarmWorldClockScheduler(afterIsoUtc);
  if (beforeIsoUtc !== afterIsoUtc) {
    await runClockTransitionHandlers(beforeIsoUtc, afterIsoUtc);
  }
}
