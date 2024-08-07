import {
  Filter,
  Attribute,
  DimensionalLevelAttribute,
  filterFactory,
  MembersFilter,
} from '@sisense/sdk-data';
import isEqual from 'lodash/isEqual';
import { FiltersIgnoringRules, PureFilter } from './types.js';

export function getAllowedFilters(
  filters: PureFilter[],
  ignoreFiltersOptions: FiltersIgnoringRules,
) {
  if (ignoreFiltersOptions.all) {
    return [];
  }

  return filters.filter((pureFilter) => {
    return !ignoreFiltersOptions.ids?.includes(pureFilter.guid);
  });
}

export function isSameAttribute(attributeA: Attribute, attributeB: Attribute) {
  return (
    attributeA.expression === attributeB?.expression &&
    (attributeA as DimensionalLevelAttribute).granularity ===
      (attributeB as DimensionalLevelAttribute).granularity
  );
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
    false,
    existingFilter?.guid,
    undefined,
    (existingFilter as MembersFilter | undefined)?.backgroundFilter,
  );
}

export function haveSameAttribute(filterA: Filter, filterB: Filter) {
  return isSameAttribute(filterA.attribute, filterB.attribute);
}

export function isEqualMembersFilters(filterA: Filter, filterB: Filter) {
  return (
    haveSameAttribute(filterA, filterB) &&
    'members' in filterA &&
    'members' in filterB &&
    isEqual((filterA as MembersFilter).members, (filterB as MembersFilter).members)
  );
}

export function isIncludeAllFilter(filter: Filter) {
  return 'members' in filter && (filter as MembersFilter).members.length === 0;
}

function createIncludeAllFilter(attribute: Attribute, backgroundFilter?: Filter, guid?: string) {
  return filterFactory.members(attribute, [], false, guid, undefined, backgroundFilter);
}

export function clearCommonFilter(filter: Filter) {
  const { attribute, guid, backgroundFilter } = filter as MembersFilter;
  return createIncludeAllFilter(attribute, backgroundFilter, guid);
}
