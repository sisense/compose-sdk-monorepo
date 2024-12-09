import { haveSameAttribute } from '@/utils/filters-comparator.js';
import { isSameAttribute } from '@/utils/filters.js';
import { Filter, Attribute, filterFactory, MembersFilter } from '@sisense/sdk-data';
import isEqual from 'lodash-es/isEqual';
import { FiltersIgnoringRules, PureFilter } from './types.js';

export function getAllowedFilters(
  filters: PureFilter[],
  ignoreFiltersOptions: FiltersIgnoringRules,
) {
  if (ignoreFiltersOptions.all) {
    return [];
  }

  return filters.filter((pureFilter) => {
    return !ignoreFiltersOptions.ids?.includes(pureFilter.config.guid);
  });
}

export function getFilterByAttribute(filters: Filter[], attribute: Attribute) {
  return filters.find((f) => isSameAttribute(f.attribute, attribute));
}

export function createCommonFilter(
  attribute: Attribute,
  members: (string | number)[],
  existingCommonFilters: Filter[],
) {
  const existingFilter = getFilterByAttribute(existingCommonFilters, attribute);
  return filterFactory.members(
    attribute,
    members.map((v) => `${v}`),
    {
      guid: existingFilter?.config.guid,
      backgroundFilter: (existingFilter as MembersFilter | undefined)?.config.backgroundFilter,
    },
  );
}

export function isEqualMembersFilters(filterA: Filter, filterB: Filter) {
  return (
    haveSameAttribute(filterA, filterB) &&
    'members' in filterA &&
    'members' in filterB &&
    isEqual((filterA as MembersFilter).members, (filterB as MembersFilter).members)
  );
}
