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

export function getMembersWithoutDeactivated(filter: Filter, selectedMembers: string[]) {
  return isMembersFilter(filter) && filter?.config?.deactivatedMembers
    ? selectedMembers.filter(
        (member: string) => !filter.config?.deactivatedMembers.includes(member),
      )
    : selectedMembers;
}
export function getMembersWithDeactivated(filter: Filter) {
  return isMembersFilter(filter) ? [...filter.members, ...filter.config.deactivatedMembers] : [];
}

export function getConfigWithUpdatedDeactivated(filter: Filter, selectedMembers: string[]) {
  return isMembersFilter(filter) && filter?.config?.deactivatedMembers
    ? {
        ...filter.config,
        deactivatedMembers: filter.config?.deactivatedMembers?.filter((member: string) =>
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
