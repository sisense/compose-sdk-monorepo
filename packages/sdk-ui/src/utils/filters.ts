import {
  Attribute,
  CascadingFilter,
  DimensionalLevelAttribute,
  Filter,
  filterFactory,
  MembersFilter,
} from '@sisense/sdk-data';
import { cloneDeep } from 'lodash';

export function isCascadingFilter(filter: Filter): filter is CascadingFilter {
  return filter instanceof CascadingFilter;
}

/**
 * Clones a filter with a toggled 'disabled' state.
 *
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

function createIncludeAllFilter(attribute: Attribute, backgroundFilter?: Filter, guid?: string) {
  return filterFactory.members(attribute, [], false, guid, undefined, backgroundFilter);
}

export function clearMembersFilter(filter: Filter) {
  if (!isMembersFilter(filter)) {
    throw new Error('Filter is not a MembersFilter');
  }
  const { attribute, guid, backgroundFilter } = filter;
  return createIncludeAllFilter(attribute, backgroundFilter, guid);
}

export function isMembersFilter(filter: Filter): filter is MembersFilter {
  return filter instanceof MembersFilter;
}

export function isIncludeAllFilter(filter: Filter) {
  return 'members' in filter && (filter as MembersFilter).members.length === 0;
}

export function haveSameAttribute(filterA: Filter, filterB: Filter) {
  return isSameAttribute(filterA.attribute, filterB.attribute);
}

export function isSameAttribute(attributeA: Attribute, attributeB: Attribute) {
  return (
    attributeA.expression === attributeB?.expression &&
    (attributeA as DimensionalLevelAttribute).granularity ===
      (attributeB as DimensionalLevelAttribute).granularity
  );
}
