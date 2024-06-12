import isEqual from 'lodash/isEqual';
import { usePrevious } from './use-previous';

/**
 * Hook that returns if a value from the previous render has changed.
 *
 * @param value - Value for the current render.
 * @param propNames - Names of keys to compare.
 * @param [compare] - Optional comparison function
 * @returns Has the value changed or not.
 */
export function useHasChanged<T>(
  value: T,
  propNames: Array<keyof T>,
  compare?: (value: T, prev: T) => boolean,
) {
  const prev = usePrevious(value);
  if (!prev) {
    return true;
  }

  const changed = propNames.some(
    // eslint-disable-next-line security/detect-object-injection
    (paramName) => !isEqual(prev[paramName], value[paramName]),
  );
  if (changed) {
    return true;
  }

  if (!compare) {
    return false;
  }
  return compare(value, prev);
}
