import { Attribute, filterFactory, MembersFilterConfig } from '@sisense/sdk-data';
import { CRITERIA_FILTER_MAP } from '../../criteria-filter-tile/criteria-filter-operations.js';

export function getCriteriaFilterBuilder(condition: keyof typeof CRITERIA_FILTER_MAP) {
  return CRITERIA_FILTER_MAP[condition];
}

export function createExcludeMembersFilter(
  attribute: Attribute,
  members: string[],
  config?: MembersFilterConfig,
) {
  return members.length
    ? filterFactory.members(attribute, members, {
        ...config,
        excludeMembers: true,
      })
    : null;
}
