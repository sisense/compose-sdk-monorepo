import { filterFactory, type MembersFilter } from '@sisense/sdk-data';

import type {
  Member,
  SelectedMember,
} from '@/domains/filters/components/member-filter-tile/members-reducer';

/**
 * Pure selection state for a members filter that supports select-all, explicit
 * include, and exclude in one list (MemberFilterTile / FilterWidget).
 *
 * - `excludeMembers: false` — `selectedMembers` are inclusions (explicit).
 * - `excludeMembers: true` — `selectedMembers` are exclusions.
 * - Select-all is represented as `{ selectedMembers: [], excludeMembers: true }`
 * (exclude nothing ⇒ include all), not as an explicit list of every member.
 * @internal
 */
export type MembersFilterSelection = {
  readonly selectedMembers: readonly SelectedMember[];
  readonly excludeMembers: boolean;
};

/**
 * Context needed to decide whether a multi-select toggle should collapse into
 * the select-all / include-all representation (Fusion parity).
 * @internal
 */
export type MemberToggleContext = {
  readonly enableMultiSelection: boolean;
  /** Count of members currently loaded into the list UI. */
  readonly loadedMembersCount: number;
  /** Whether every attribute member has been loaded (pagination complete). */
  readonly allItemsLoaded: boolean;
  /** Whether a non-empty search filter is active (collapse is skipped while searching). */
  readonly hasSearchFilter: boolean;
};

/**
 * Returns the select-all selection: empty exclusion list.
 * @returns Selection representing "all members included"
 * @internal
 */
export function asSelectAllSelection(): MembersFilterSelection {
  return { selectedMembers: [], excludeMembers: true };
}

/**
 * Returns the clear / include-all selection: empty inclusion list.
 * @returns Selection representing "no members filter applied"
 * @internal
 */
export function asClearAllSelection(): MembersFilterSelection {
  return { selectedMembers: [], excludeMembers: false };
}

/**
 * Applies a member check/uncheck to the selection.
 *
 * In multi-select, when every loaded member ends up selected, pagination is
 * complete, there is no search filter, and no deactivated members, the
 * selection collapses the same way Fusion does:
 * - include mode → select-all (`[], excludeMembers: true`)
 * - exclude mode → include-all (`[], excludeMembers: false`)
 * @param selection - Current selection state
 * @param member - Member being toggled
 * @param isSelected - Whether the member should be in the selection list after the toggle
 * @param context - Multi-select / pagination / search context
 * @returns Next selection state
 * @internal
 */
export function applyMemberToggle(
  selection: MembersFilterSelection,
  member: Member,
  isSelected: boolean,
  context: MemberToggleContext,
): MembersFilterSelection {
  if (!context.enableMultiSelection) {
    // Single-select always means "include this one member". Preserving an
    // inherited excludeMembers flag would show the member as selected while
    // the filter excludes it.
    return {
      selectedMembers: [member],
      excludeMembers: false,
    };
  }

  const nextSelectedMembers = isSelected
    ? addSelectedMember(selection.selectedMembers, member)
    : removeSelectedMember(selection.selectedMembers, member);

  return shouldCollapseToEmptySelection(nextSelectedMembers, context)
    ? { selectedMembers: [], excludeMembers: !selection.excludeMembers }
    : { selectedMembers: nextSelectedMembers, excludeMembers: selection.excludeMembers };
}

/**
 * Toggles the inactive (deactivated) flag of a selected member by key.
 * Members not in the selection are left unchanged.
 * @param selectedMembers - Current selected members
 * @param memberKey - Key of the member whose inactive flag should flip
 * @returns New selected-members array
 * @internal
 */
export function toggleSelectedMemberActivation(
  selectedMembers: readonly SelectedMember[],
  memberKey: string,
): SelectedMember[] {
  return selectedMembers.map((selectedMember) =>
    selectedMember.key === memberKey
      ? { ...selectedMember, inactive: !selectedMember.inactive }
      : selectedMember,
  );
}

/**
 * Splits selected members into active filter members and deactivated members.
 * @param selectedMembers - Selected members, both active and inactive
 * @returns Active and inactive member keys
 * @internal
 */
export function splitToActiveAndInactiveFilterMembers(selectedMembers: readonly SelectedMember[]): {
  activeFilterMembers: string[];
  inactiveFilterMembers: string[];
} {
  return selectedMembers.reduce<{
    activeFilterMembers: string[];
    inactiveFilterMembers: string[];
  }>(
    (acc, selectedMember) => {
      if (selectedMember.inactive) {
        return {
          ...acc,
          inactiveFilterMembers: [...acc.inactiveFilterMembers, selectedMember.key],
        };
      }
      return {
        ...acc,
        activeFilterMembers: [...acc.activeFilterMembers, selectedMember.key],
      };
    },
    { activeFilterMembers: [], inactiveFilterMembers: [] },
  );
}

/**
 * Builds a new {@link MembersFilter} from a selection, preserving guid and
 * other config from the previous filter.
 * @param filter - Existing members filter (config source)
 * @param selection - Next selection state
 * @returns New MembersFilter instance
 * @internal
 */
export function withMembersFilterSelection(
  filter: MembersFilter,
  selection: MembersFilterSelection,
): MembersFilter {
  const { activeFilterMembers, inactiveFilterMembers } = splitToActiveAndInactiveFilterMembers(
    selection.selectedMembers,
  );

  // Cast rationale: filterFactory.members returns the base Filter type but always
  // constructs a MembersFilter.
  return filterFactory.members(filter.attribute, activeFilterMembers, {
    guid: filter.config.guid,
    excludeMembers: selection.excludeMembers,
    deactivatedMembers: inactiveFilterMembers,
    backgroundFilter: filter.config.backgroundFilter,
    enableMultiSelection: filter.config.enableMultiSelection,
  }) as MembersFilter;
}

/**
 * Returns a new selected-members list with `member` added when missing.
 * @param selectedMembers - Current selected members
 * @param member - Member to add
 * @returns New array; unchanged content when the member is already present
 * @internal
 */
export function addSelectedMember(
  selectedMembers: readonly SelectedMember[],
  member: SelectedMember,
): SelectedMember[] {
  if (selectedMembers.some((selectedMember) => selectedMember.key === member.key)) {
    return [...selectedMembers];
  }
  return [...selectedMembers, member];
}

/**
 * Returns a new selected-members list without `member`.
 * @param selectedMembers - Current selected members
 * @param member - Member to remove
 * @returns New array without the member
 * @internal
 */
export function removeSelectedMember(
  selectedMembers: readonly SelectedMember[],
  member: SelectedMember,
): SelectedMember[] {
  return selectedMembers.filter((selectedMember) => selectedMember.key !== member.key);
}

/**
 * Whether a member row checkbox should appear checked under include/exclude semantics.
 * @param memberKey - Member key
 * @param selectedKeys - Keys currently in the selection list (Set or Map)
 * @param excludeMembers - Exclude-mode flag
 * @returns Visual checked state
 * @internal
 */
export function isMemberVisuallySelected(
  memberKey: string,
  selectedKeys: { readonly has: (key: string) => boolean },
  excludeMembers: boolean,
): boolean {
  // In exclude mode, members in the list are exclusions (unchecked); all others are checked.
  return selectedKeys.has(memberKey) === !excludeMembers;
}

/**
 * Maps a visual checkbox state to whether the member should be in the selection
 * list (inclusions or exclusions).
 * @param visuallySelected - Whether the row appears checked
 * @param excludeMembers - Exclude-mode flag
 * @returns `isSelected` for `applyMemberToggle` / `onSelectMember`
 * @internal
 */
export function asSelectionListMembership(
  visuallySelected: boolean,
  excludeMembers: boolean,
): boolean {
  return excludeMembers ? !visuallySelected : visuallySelected;
}

/**
 * Maps a visual checkbox toggle to whether the member should be in the selection
 * list after the click.
 * @param memberKey - Member key being toggled
 * @param selectedKeys - Keys currently in the selection list
 * @param excludeMembers - Exclude-mode flag
 * @returns Next `isSelected` value for `applyMemberToggle` / `onSelectMember`
 * @internal
 */
export function getSelectionListMembershipAfterToggle(
  memberKey: string,
  selectedKeys: { readonly has: (key: string) => boolean },
  excludeMembers: boolean,
): boolean {
  return asSelectionListMembership(
    !isMemberVisuallySelected(memberKey, selectedKeys, excludeMembers),
    excludeMembers,
  );
}

function shouldCollapseToEmptySelection(
  selectedMembers: readonly SelectedMember[],
  context: MemberToggleContext,
): boolean {
  const isAllMembersSelected =
    selectedMembers.length === context.loadedMembersCount && context.allItemsLoaded;
  const hasInactiveMember = selectedMembers.some((selectedMember) => selectedMember.inactive);

  return isAllMembersSelected && !context.hasSearchFilter && !hasInactiveMember;
}
