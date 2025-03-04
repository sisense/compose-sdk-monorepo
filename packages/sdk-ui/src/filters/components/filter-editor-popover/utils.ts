import {
  Filter,
  isMembersFilter,
  MembersFilter,
  isMeasureFilter,
  isNumericFilter,
  isRankingFilter,
  isTextFilter,
  NumericOperators,
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

export function isNumericBetweenFilter(filter: Filter): boolean {
  return (
    isNumericFilter(filter) &&
    filter.operatorA === NumericOperators.From &&
    filter.operatorB === NumericOperators.To
  );
}
