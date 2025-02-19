import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash-es/debounce';

/**
 * A hook that returns a debounced version of the given value.
 * The value is updated only after the specified delay (`wait`), preventing frequent updates.
 */
export function useDebouncedValue<T>(value: T, wait: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const updateDebouncedValue = useMemo(() => {
    return debounce((value: T) => {
      setDebouncedValue(value);
    }, wait);
  }, [wait]);

  useEffect(() => {
    updateDebouncedValue(value);
  }, [value, updateDebouncedValue]);

  return debouncedValue;
}
