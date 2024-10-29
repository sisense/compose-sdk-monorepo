import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import isEqual from 'lodash-es/isEqual';
import isFunction from 'lodash-es/isFunction';

type UseSyncedStateOptions<T> = {
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
 */
export function useSyncedState<T>(
  syncValue: T,
  { onLocalStateChange, syncCompareFn = isEqual }: UseSyncedStateOptions<T> = {},
) {
  const [state, setState] = useState(syncValue);

  // Synchronize state with syncValue only if it has changed (by value)
  useEffect(() => {
    setState((existingState) =>
      // Returns the existing state if the current value hasn't changed. It doesn't provide state update or children re-render.
      syncCompareFn(existingState, syncValue) ? existingState : syncValue,
    );
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
