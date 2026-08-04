import {
  Attribute,
  DimensionalLevelAttribute,
  Filter,
  filterFactory,
  isMembersFilter,
  MembersFilterConfig,
} from '@sisense/sdk-data';

import { CRITERIA_FILTER_MAP } from '../../criteria-filter-tile/criteria-filter-operations.js';

export function getCriteriaFilterBuilder(condition: keyof typeof CRITERIA_FILTER_MAP) {
  return CRITERIA_FILTER_MAP[condition];
}

export function createExcludeMembersFilter(
  attribute: Attribute,
  members: string[],
  config?: MembersFilterConfig,
) {
  return members.length || config?.deactivatedMembers?.length
    ? filterFactory.members(attribute, members, {
        ...config,
        excludeMembers: true,
      })
    : null;
}

/**
 * Members are typed as strings, but a filter deserialized from JAQL keeps whatever the JAQL held —
 * numbers for a filter on a numeric column or calculated dimension. The member selects search and
 * compare them as strings, so normalize every member read off a filter.
 */
function toMemberStrings(members: string[]): string[] {
  return members.map((member) => String(member));
}

export function getMembersWithoutDeactivated(filter: Filter, selectedMembers: string[]) {
  if (!isMembersFilter(filter) || !filter.config?.deactivatedMembers) {
    return selectedMembers;
  }
  const deactivatedMembers = toMemberStrings(filter.config.deactivatedMembers);
  return selectedMembers.filter((member) => !deactivatedMembers.includes(member));
}
export function getMembersWithDeactivated(filter: Filter) {
  return isMembersFilter(filter)
    ? toMemberStrings([...filter.members, ...filter.config.deactivatedMembers])
    : [];
}

export function getConfigWithUpdatedDeactivated(filter: Filter, selectedMembers: string[]) {
  return isMembersFilter(filter) && filter?.config?.deactivatedMembers
    ? {
        ...filter.config,
        deactivatedMembers: toMemberStrings(filter.config.deactivatedMembers).filter((member) =>
          selectedMembers.includes(member),
        ),
      }
    : filter.config;
}

/**
 * Returns the granularities that are restricted by the parent filters (previous cascading levels)
 *
 * @param datetimeAttribute - The datetime attribute
 * @param parentFilters - The parent filters
 * @returns The restricted granularities
 */
export function getRestrictedGranularities(
  datetimeAttribute: Attribute,
  parentFilters: Filter[] = [],
) {
  return parentFilters
    .filter((filter) => filter.attribute.expression === datetimeAttribute.expression)
    .map((f) => (f.attribute as DimensionalLevelAttribute).granularity);
}
