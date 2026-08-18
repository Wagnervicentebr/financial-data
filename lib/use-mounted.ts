import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only after client hydration — avoids SSR/client markup mismatches. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
