import { useEffect, useRef } from 'react';

/**
 * Hook that returns the value from the previous render.
 *
 * @param value - Value to return from the previous render.
 * @returns Value from the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
