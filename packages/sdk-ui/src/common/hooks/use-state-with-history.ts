import { useState, useCallback, useRef } from 'react';

interface UseStateWithHistoryOptions<T> {
  /**
   * Maximum number of history entries to store
   * @default 10
   */
  capacity?: number;

  /**
   * Initial history entries
   * @default []
   */
  initialHistory?: T[];
}

interface StateWithHistoryResult<T> {
  /** Current state value */
  state: T;

  /** All history entries */
  history: T[];

  /** Index of the current state in history */
  currentIndex: number;

  /** Set state and add to history */
  setState: (value: T | ((prev: T) => T)) => void;

  /** Go back to the previous state in history */
  undo: () => void;

  /** Go forward to the next state in history */
  redo: () => void;

  /** Whether there's a previous state to go back to */
  canUndo: boolean;

  /** Whether there's a next state to go forward to */
  canRedo: boolean;

  /** Go to a specific point in history by index */
  goTo: (index: number) => void;

  /** Clear all history except current state */
  clearHistory: () => void;
}

/**
 * A hook that provides state management with history tracking for undo/redo functionality.
 *
 * @param initialState - The initial state value
 * @param options - Configuration options for history management
 * @returns An object containing the current state, history, and methods to navigate through history
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   setState,
 *   undo,
 *   redo,
 *   canUndo,
 *   canRedo
 * } = useStateWithHistory({ count: 0 });
 *
 * // Update state
 * setState({ count: state.count + 1 });
 *
 * // Undo last action if possible
 * if (canUndo) undo();
 *
 * // Redo last undone action if possible
 * if (canRedo) redo();
 * ```
 */
export function useStateWithHistory<T>(
  initialState: T,
  options: UseStateWithHistoryOptions<T> = {},
): StateWithHistoryResult<T> {
  const { capacity = 10, initialHistory = [] } = options;

  const historyRef = useRef<T[]>([
    ...(initialHistory.length > 0 ? initialHistory.slice(-capacity) : []),
    initialState,
  ]);
  const currentIndexRef = useRef<number>(historyRef.current.length - 1);

  const [internalState, setInternalState] = useState<T>(initialState);
  const [canUndo, setCanUndo] = useState<boolean>(currentIndexRef.current > 0);
  const [canRedo, setCanRedo] = useState<boolean>(
    currentIndexRef.current < historyRef.current.length - 1,
  );

  const setState = useCallback(
    (value: T | ((prev: T) => T)) => {
      const newState =
        typeof value === 'function' ? (value as (prev: T) => T)(internalState) : value;

      setInternalState(newState);

      if (currentIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
      }

      historyRef.current.push(newState);

      if (historyRef.current.length > capacity) {
        historyRef.current = historyRef.current.slice(-capacity);
      }

      currentIndexRef.current = historyRef.current.length - 1;

      setCanUndo(currentIndexRef.current > 0);
      setCanRedo(false);
    },
    [internalState, capacity],
  );

  const undo = useCallback(() => {
    if (currentIndexRef.current <= 0) return;

    currentIndexRef.current--;
    const previousState = historyRef.current[currentIndexRef.current];
    setInternalState(previousState);
    setCanUndo(currentIndexRef.current > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    if (currentIndexRef.current >= historyRef.current.length - 1) return;

    currentIndexRef.current++;
    const nextState = historyRef.current[currentIndexRef.current];
    setInternalState(nextState);
    setCanUndo(true);
    setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
  }, []);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= historyRef.current.length || index === currentIndexRef.current) {
      return;
    }

    currentIndexRef.current = index;
    const targetState = historyRef.current[index];
    setInternalState(targetState);
    setCanUndo(index > 0);
    setCanRedo(index < historyRef.current.length - 1);
  }, []);

  const clearHistory = useCallback(() => {
    const currentState = historyRef.current[currentIndexRef.current];
    historyRef.current = [currentState];
    currentIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  return {
    state: internalState,
    history: historyRef.current,
    currentIndex: currentIndexRef.current,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    goTo,
    clearHistory,
  };
}
