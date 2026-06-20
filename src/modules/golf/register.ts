import { registerClockTransitionHandler } from "@/modules/world-clock/clock-scheduler";
import { processGolfSchedulers } from "./scheduling";

const globalForGolfRegister = globalThis as typeof globalThis & {
  __golfClockHandlersRegistered?: boolean;
};

export function registerGolfClockHandlers(): void {
  if (globalForGolfRegister.__golfClockHandlersRegistered) {
    return;
  }

  globalForGolfRegister.__golfClockHandlersRegistered = true;
  registerClockTransitionHandler(processGolfSchedulers);
}

/** Test-only helper to allow re-registering handlers. */
export function resetGolfClockHandlerRegistrationForTests(): void {
  globalForGolfRegister.__golfClockHandlersRegistered = false;
}
