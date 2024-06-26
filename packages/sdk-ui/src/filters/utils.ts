import { type Filter } from '@sisense/sdk-data';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Clones a filter with a toggled 'disabled' state.
 * @param filter - Filter to clone
 */
export const cloneFilterAndToggleDisabled = <TFilter extends Filter>(filter: TFilter): TFilter => {
  const newFilter = cloneFilter(filter);
  newFilter.disabled = !filter.disabled;
  return newFilter;
};

export const cloneFilter = <TFilter extends Filter>(filter: TFilter): TFilter => {
  const newFilter = cloneDeep(filter);
  Object.setPrototypeOf(newFilter, filter);
  return newFilter;
};
