import {
  Filter,
  isMembersFilter,
  MembersFilter,
  isMeasureFilter,
  isNumericFilter,
  isRankingFilter,
  isTextFilter,
} from '@sisense/sdk-data';

export function isIncludeAllFilter(filter: Filter): filter is MembersFilter {
  return isMembersFilter(filter) && !filter.members.length;
}

export function isIncludeMembersFilter(filter: Filter): filter is MembersFilter {
  return isMembersFilter(filter) && !filter.config.excludeMembers;
}

export function isExcludeMembersFilter(filter: Filter): filter is MembersFilter {
  return isMembersFilter(filter) && filter.config.excludeMembers;
}

export function isConditionalFilter(filter: Filter) {
  return (
    isExcludeMembersFilter(filter) ||
    isMeasureFilter(filter) ||
    isNumericFilter(filter) ||
    isTextFilter(filter) ||
    isRankingFilter(filter)
  );
}
