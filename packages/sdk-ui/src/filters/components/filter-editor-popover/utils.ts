import {
  Filter,
  isMembersFilter,
  MembersFilter,
  isMeasureFilter,
  isNumericFilter,
  isRankingFilter,
  isTextFilter,
  NumericOperators,
  isRelativeDateFilter,
  RelativeDateFilter,
  isCustomFilter,
} from '@sisense/sdk-data';

export function isSupportedByFilterEditor(filter: Filter): boolean {
  return !isRankingFilter(filter) && !isCustomFilter(filter);
}

export function isIncludeAllFilter(filter: Filter): filter is MembersFilter {
  return (
    isMembersFilter(filter) && !filter.members.length && !filter.config.deactivatedMembers.length
  );
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

export function isRelativeDateFilterWithAnchor(filter: Filter): filter is RelativeDateFilter {
  return isRelativeDateFilter(filter) && !!filter.anchor;
}

export function isRelativeDateFilterWithoutAnchor(filter: Filter): filter is RelativeDateFilter {
  return isRelativeDateFilter(filter) && !filter.anchor;
}

/**
 * Formats a given Date object into a string in the format "YYYY-MM-DDT00:00:00".
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} The formatted date string in "YYYY-MM-DDT00:00:00" format.
 */
export function convertDateToMemberString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00`;
}
