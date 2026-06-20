import { registerClockTransitionHandler } from "@/modules/world-clock/clock-scheduler";
import { processTennisSchedulers } from "./scheduling";

const globalForTennisRegister = globalThis as typeof globalThis & {
  __tennisClockHandlersRegistered?: boolean;
};

export function registerTennisClockHandlers(): void {
  if (globalForTennisRegister.__tennisClockHandlersRegistered) {
    return;
  }

  globalForTennisRegister.__tennisClockHandlersRegistered = true;
  registerClockTransitionHandler(processTennisSchedulers);
}

/** Test-only helper to allow re-registering handlers. */
export function resetTennisClockHandlerRegistrationForTests(): void {
  globalForTennisRegister.__tennisClockHandlersRegistered = false;
}
