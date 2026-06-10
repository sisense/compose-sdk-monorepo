import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

import isEqual from 'lodash-es/isEqual';
import isFunction from 'lodash-es/isFunction';

/**
 * Options for {@link useSyncedState}.
 *
 * @alpha
 */
export type UseSyncedStateOptions<T> = {
  /**
   * A callback function that is triggered when the state is updated via the local setter,
   * but not through synchronization with `syncValue`.
   */
  onLocalStateChange?: (state: T) => void;
  /**
   * A custom comparison function to determine if the external `syncValue` is different
   * from the current state. The default function performs a deep equality check using `isEqual`.
   */
  syncCompareFn?: (currentState: T, syncValue: T) => boolean;
};

/**
 * A custom React hook that behaves like the regular `useState`, but also synchronizes the state
 * with an external `syncValue`.
 *
 * @param syncValue - The external value to synchronize with. When this value changes (as
 *   determined by `syncCompareFn`), the local state is updated to match it.
 * @param options - Optional configuration object.
 * @param options.onLocalStateChange - Callback invoked whenever the local state is updated via
 *   the returned setter (not triggered by external `syncValue` synchronization).
 * @param options.syncCompareFn - Custom equality function used to detect changes in `syncValue`.
 *   Defaults to a deep equality check via `isEqual` from lodash-es. See {@link UseSyncedStateOptions}.
 * @returns A tuple of `[localState, setState]` — the current local state and a setter that
 *   both updates state and fires `onLocalStateChange`.
 * @example
 * ```tsx
 * const [localState, setLocalState] = useSyncedState(externalValue, {
 *   onLocalStateChange: (s) => console.log('local update', s),
 * });
 * ```
 * @alpha
 */
export function useSyncedState<T>(
  syncValue: T,
  { onLocalStateChange, syncCompareFn = isEqual }: UseSyncedStateOptions<T> = {},
) {
  const [state, setState] = useState(syncValue);
  const prevSyncValueRef = useRef(syncValue);

  // Synchronize state with syncValue only if syncValue has changed (by value)
  useEffect(() => {
    if (!syncCompareFn(prevSyncValueRef.current, syncValue)) {
      setState(syncValue);
    }
    prevSyncValueRef.current = syncValue;
  }, [syncValue, syncCompareFn]);

  // Updates the state and triggers the onLocalStateChange callback (if provided)
  const setStateAndNotify = useCallback(
    (newState: SetStateAction<T>) => {
      setState((prevState) => {
        const updatedState = isFunction(newState)
          ? (newState as (prev: T) => T)(prevState)
          : newState;
        onLocalStateChange?.(updatedState);
        return updatedState;
      });
    },
    [onLocalStateChange],
  );

  return [state, setStateAndNotify] as [T, Dispatch<SetStateAction<T>>];
}
