import { Filter } from '@sisense/sdk-data';
import { isEqual, isEqualWith } from 'lodash';

/**
 * Checks if the filters have changed by deep comparison.
 *
 * @param prevFilters - Previous filters
 * @param newFilters - New filters
 * @returns Whether the filters have changed
 * @remarks
 * The function ignores randomly generated names of the filters.
 */
export function isFiltersChanged(
  prevFilters: Filter[] | undefined,
  newFilters: Filter[] | undefined,
): boolean {
  // if both filters are undefined, nothing has changed
  if (prevFilters === undefined && newFilters === undefined) {
    return false;
  }
  // if one of the filters is undefined, and other not - changed
  if ([prevFilters, newFilters].some((filters) => filters === undefined)) {
    return true;
  }
  // if the length of the filters is different - changed
  if (prevFilters!.length !== newFilters!.length) {
    return true;
  }
  // if both filters are empty - nothing has changed

  if (prevFilters!.length === 0 && newFilters!.length === 0) {
    return false;
  }
  // compare filters with ignoring randomly generated names
  // if filters at some index in the two arrays do not equal,
  // return true (filters have changed)
  return prevFilters!.some(
    (prevFilter, i) =>
      !isEqualWith(
        prevFilter,
        newFilters![i]!,
        (prevFilterWithRandomName: Filter, newFilterWithRandomName: Filter) => {
          const prevFilterWithoutRandomName = isRealCSDKFilter(prevFilterWithRandomName)
            ? {
                ...(prevFilterWithRandomName.toJSON() as Record<string, unknown>),
                name: undefined,
              }
            : prevFilterWithRandomName;
          const newFilterWithoutRandomName = isRealCSDKFilter(newFilterWithRandomName)
            ? {
                ...(newFilterWithRandomName.toJSON() as Record<string, unknown>),
                name: undefined,
              }
            : newFilterWithRandomName;
          return isEqual(prevFilterWithoutRandomName, newFilterWithoutRandomName);
        },
      ),
  );
}

/**
 * Validates if the filter is a real Compose SDK Filter with all props and methods or a partially converted filter from widget DTO
 * @returns
 */
function isRealCSDKFilter(filter: Filter): filter is Filter {
  return 'toJSON' in filter && typeof filter.toJSON === 'function';
}
