import {
  Filter,
  isCustomFilter,
  isMeasureFilter,
  isMembersFilter,
  isNumericFilter,
  isRankingFilter,
  isRelativeDateFilter,
  isTextFilter,
  MembersFilter,
  NumericOperators,
  RelativeDateFilter,
} from '@sisense/sdk-data';

import { parseISOWithTimezoneCheck } from '@/shared/utils/parseISOWithTimezoneCheck';

export {
  getFilterAttributeValueType,
  getFilterEditorValueType,
  type FilterAttributeValueType,
} from '@/domains/filters/shared/filter-attribute-value-type.js';

export function isSupportedByFilterEditor(filter: Filter): boolean {
  return !isCustomFilter(filter);
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
 * Resolves a filter date value into the UTC-midnight Date the filter editor works with.
 *
 * Timezone-less strings name a calendar day rather than an instant, so they are anchored to UTC.
 */
export function asUtcDate(value: string | Date): Date {
  return typeof value === 'string' ? parseISOWithTimezoneCheck(value) : value;
}

/**
 * Formats a given Date object into a string in the format "YYYY-MM-DDT00:00:00".
 *
 * Reads the UTC calendar fields, matching the convention in {@link asUtcDate}.
 * @param {Date} date - The Date object to format.
 * @returns {string} The formatted date string in "YYYY-MM-DDT00:00:00" format.
 */
export function convertDateToMemberString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00`;
}
