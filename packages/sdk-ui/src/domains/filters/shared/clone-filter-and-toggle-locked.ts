import { Filter } from '@sisense/sdk-data';

import { cloneFilter } from '@/shared/utils/filters';

/**
 * Clones a filter with a toggled 'locked' state.
 *
 * @param filter - Filter to clone
 */
export const cloneFilterAndToggleLocked = <TFilter extends Filter>(filter: TFilter): TFilter => {
  const newFilter = cloneFilter(filter);
  newFilter.config.locked = !filter.config.locked;
  return newFilter;
};
