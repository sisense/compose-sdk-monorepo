import { useEffect, useRef } from 'react';

/**
 * Custom hook to track if a value was modified at any point,
 * even if it returns to its initial state.
 */
export const useWasModified = <T>(value: T, initialValue: T): boolean => {
  const wasModified = useRef(false);

  useEffect(() => {
    if (value !== initialValue) {
      wasModified.current = true;
    }
  }, [value, initialValue]);

  return wasModified.current;
};
