import { Filter } from '../../interfaces.js';
import { isMembersFilter, MembersFilter } from '../filters.js';

/**
 * Checks whether a filter is a no-op "include all" members filter — a members
 * filter with an empty `members` list, regardless of `excludeMembers` mode.
 * Both "include nothing" and "exclude nothing" leave the result set unconstrained,
 * so the filter has no effect on results and can be safely omitted from a JAQL payload.
 *
 * @param filter - The filter to check.
 * @returns `true` when the filter is a no-op include-all members filter; otherwise `false`.
 *
 * @internal
 */
export function isIncludeAllMembersFilter(filter: Filter): filter is MembersFilter {
  return isMembersFilter(filter) && filter.members.length === 0;
}
