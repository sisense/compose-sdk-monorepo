import { useEffect, useRef } from 'react';

/**
 * Hook that returns the last defined value.
 *
 * @param value - last defined value to return.
 */
export function useLastDefined<T>(value: T | null | undefined): T {
  const ref = useRef<T | null | undefined>(undefined);
  useEffect(() => {
    if (value !== null && value !== undefined) {
      ref.current = value;
    }
  }, [value]);
  return value ? value : (ref.current as T);
}
