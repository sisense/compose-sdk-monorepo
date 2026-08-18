import { createAttribute, filterFactory, type MembersFilter } from '@sisense/sdk-data';

import type {
  Member,
  SelectedMember,
} from '@/domains/filters/components/member-filter-tile/members-reducer';

import {
  addSelectedMember,
  applyMemberToggle,
  asClearAllSelection,
  asSelectAllSelection,
  asSelectionListMembership,
  getSelectionListMembershipAfterToggle,
  isMemberVisuallySelected,
  type MembersFilterSelection,
  type MemberToggleContext,
  removeSelectedMember,
  splitToActiveAndInactiveFilterMembers,
  toggleSelectedMemberActivation,
  withMembersFilterSelection,
} from './members-filter-selection.js';

const female: Member = { key: 'Female', title: 'Female' };
const male: Member = { key: 'Male', title: 'Male' };
const unspecified: Member = { key: 'Unspecified', title: 'Unspecified' };

const includeNone: MembersFilterSelection = {
  selectedMembers: [],
  excludeMembers: false,
};

const excludeNone: MembersFilterSelection = {
  selectedMembers: [],
  excludeMembers: true,
};

const allLoadedMultiContext: MemberToggleContext = {
  enableMultiSelection: true,
  loadedMembersCount: 3,
  allItemsLoaded: true,
  hasSearchFilter: false,
};

describe('members-filter-selection', () => {
  describe('asSelectAllSelection / asClearAllSelection', () => {
    it('represents select-all as empty exclusions', () => {
      expect(asSelectAllSelection()).toEqual(excludeNone);
    });

    it('represents clear / include-all as empty inclusions', () => {
      expect(asClearAllSelection()).toEqual(includeNone);
    });
  });

  describe('addSelectedMember / removeSelectedMember', () => {
    it('adds a missing member immutably', () => {
      const selected: SelectedMember[] = [female];
      const next = addSelectedMember(selected, male);

      expect(next).toEqual([female, male]);
      expect(next).not.toBe(selected);
      expect(selected).toEqual([female]);
    });

    it('does not duplicate an already selected member', () => {
      const selected: SelectedMember[] = [female];
      const next = addSelectedMember(selected, female);

      expect(next).toEqual([female]);
      expect(next).not.toBe(selected);
    });

    it('removes a member by key', () => {
      expect(removeSelectedMember([female, male], female)).toEqual([male]);
    });
  });

  describe('toggleSelectedMemberActivation', () => {
    it('marks an active member inactive', () => {
      expect(toggleSelectedMemberActivation([female], 'Female')).toEqual([
        { ...female, inactive: true },
      ]);
    });

    it('marks an inactive member active', () => {
      expect(toggleSelectedMemberActivation([{ ...female, inactive: true }], 'Female')).toEqual([
        { ...female, inactive: false },
      ]);
    });

    it('leaves other members unchanged when key is missing', () => {
      expect(toggleSelectedMemberActivation([female], 'Male')).toEqual([female]);
    });
  });

  describe('splitToActiveAndInactiveFilterMembers', () => {
    it('splits active and inactive member keys', () => {
      expect(
        splitToActiveAndInactiveFilterMembers([female, { ...male, inactive: true }, unspecified]),
      ).toEqual({
        activeFilterMembers: ['Female', 'Unspecified'],
        inactiveFilterMembers: ['Male'],
      });
    });
  });

  describe('applyMemberToggle', () => {
    it('replaces the selection in single-select mode', () => {
      const selection: MembersFilterSelection = {
        selectedMembers: [female],
        excludeMembers: false,
      };

      expect(
        applyMemberToggle(selection, male, true, {
          ...allLoadedMultiContext,
          enableMultiSelection: false,
        }),
      ).toEqual({
        selectedMembers: [male],
        excludeMembers: false,
      });
    });

    it('forces include mode when picking a member in single-select from exclude state', () => {
      const selection: MembersFilterSelection = {
        selectedMembers: [female],
        excludeMembers: true,
      };

      expect(
        applyMemberToggle(selection, male, true, {
          ...allLoadedMultiContext,
          enableMultiSelection: false,
        }),
      ).toEqual({
        selectedMembers: [male],
        excludeMembers: false,
      });
    });

    it('adds a member in include (explicit) mode', () => {
      expect(applyMemberToggle(includeNone, female, true, allLoadedMultiContext)).toEqual({
        selectedMembers: [female],
        excludeMembers: false,
      });
    });

    it('removes a member in include mode without collapsing when not all selected', () => {
      const selection: MembersFilterSelection = {
        selectedMembers: [female, male],
        excludeMembers: false,
      };

      expect(applyMemberToggle(selection, male, false, allLoadedMultiContext)).toEqual({
        selectedMembers: [female],
        excludeMembers: false,
      });
    });

    it('adds an exclusion when unchecking from select-all', () => {
      // UI: select-all → uncheck Female. MemberList passes isSelected=true for the exclusion list.
      expect(applyMemberToggle(excludeNone, female, true, allLoadedMultiContext)).toEqual({
        selectedMembers: [female],
        excludeMembers: true,
      });
    });

    it('removes an exclusion in exclude mode (re-includes the member)', () => {
      // UI: select-all → uncheck Female → check Female again. Checking removes Female from exclusions.
      const selection: MembersFilterSelection = {
        selectedMembers: [female, male],
        excludeMembers: true,
      };

      expect(applyMemberToggle(selection, female, false, allLoadedMultiContext)).toEqual({
        selectedMembers: [male],
        excludeMembers: true,
      });
    });

    it('collapses include-all-selected into select-all when every member is loaded', () => {
      const selection: MembersFilterSelection = {
        selectedMembers: [female, male],
        excludeMembers: false,
      };

      expect(applyMemberToggle(selection, unspecified, true, allLoadedMultiContext)).toEqual(
        asSelectAllSelection(),
      );
    });

    it('collapses exclude-all-selected into include-all when every member is loaded', () => {
      const selection: MembersFilterSelection = {
        selectedMembers: [female, male],
        excludeMembers: true,
      };

      expect(applyMemberToggle(selection, unspecified, true, allLoadedMultiContext)).toEqual(
        asClearAllSelection(),
      );
    });

    it('does not collapse while pagination is incomplete', () => {
      const selection: MembersFilterSelection = {
        selectedMembers: [female, male],
        excludeMembers: false,
      };

      expect(
        applyMemberToggle(selection, unspecified, true, {
          ...allLoadedMultiContext,
          allItemsLoaded: false,
        }),
      ).toEqual({
        selectedMembers: [female, male, unspecified],
        excludeMembers: false,
      });
    });

    it('does not collapse while a search filter is active', () => {
      const selection: MembersFilterSelection = {
        selectedMembers: [female, male],
        excludeMembers: false,
      };

      expect(
        applyMemberToggle(selection, unspecified, true, {
          ...allLoadedMultiContext,
          hasSearchFilter: true,
        }),
      ).toEqual({
        selectedMembers: [female, male, unspecified],
        excludeMembers: false,
      });
    });

    it('does not collapse when any selected member is deactivated', () => {
      const selection: MembersFilterSelection = {
        selectedMembers: [female, { ...male, inactive: true }],
        excludeMembers: false,
      };

      expect(applyMemberToggle(selection, unspecified, true, allLoadedMultiContext)).toEqual({
        selectedMembers: [female, { ...male, inactive: true }, unspecified],
        excludeMembers: false,
      });
    });
  });

  describe('withMembersFilterSelection', () => {
    const attribute = createAttribute({
      name: 'Gender',
      expression: '[Commerce.Gender]',
    });

    it('builds an exclude filter from exclusions and deactivated members', () => {
      const previous = filterFactory.members(attribute, ['Female'], {
        guid: 'guid-1',
        excludeMembers: false,
        enableMultiSelection: true,
      }) as MembersFilter;

      const next = withMembersFilterSelection(previous, {
        selectedMembers: [female, { ...male, inactive: true }],
        excludeMembers: true,
      });

      expect(next.members).toEqual(['Female']);
      expect(next.config.excludeMembers).toBe(true);
      expect(next.config.deactivatedMembers).toEqual(['Male']);
      expect(next.config.guid).toBe('guid-1');
      expect(next.config.enableMultiSelection).toBe(true);
    });

    it('builds select-all as empty exclusions', () => {
      const previous = filterFactory.members(attribute, ['Female'], {
        guid: 'guid-1',
      }) as MembersFilter;

      const next = withMembersFilterSelection(previous, asSelectAllSelection());

      expect(next.members).toEqual([]);
      expect(next.config.excludeMembers).toBe(true);
    });

    it('builds include-all as empty inclusions', () => {
      const previous = filterFactory.members(attribute, ['Female'], {
        guid: 'guid-1',
        excludeMembers: true,
      }) as MembersFilter;

      const next = withMembersFilterSelection(previous, asClearAllSelection());

      expect(next.members).toEqual([]);
      expect(next.config.excludeMembers).toBe(false);
    });
  });

  describe('isMemberVisuallySelected / selection-list membership', () => {
    it('checks members present in the include list', () => {
      const selected = new Set(['France']);
      expect(isMemberVisuallySelected('France', selected, false)).toBe(true);
      expect(isMemberVisuallySelected('Italy', selected, false)).toBe(false);
    });

    it('unchecks exclusions and checks everyone else in exclude mode', () => {
      const exclusions = new Set(['France']);
      expect(isMemberVisuallySelected('France', exclusions, true)).toBe(false);
      expect(isMemberVisuallySelected('Italy', exclusions, true)).toBe(true);
    });

    it('checks every member for select-all (empty exclusions)', () => {
      expect(isMemberVisuallySelected('France', new Set(), true)).toBe(true);
    });

    it('maps visual state to list membership', () => {
      expect(asSelectionListMembership(true, false)).toBe(true);
      expect(asSelectionListMembership(false, false)).toBe(false);
      expect(asSelectionListMembership(true, true)).toBe(false);
      expect(asSelectionListMembership(false, true)).toBe(true);
    });

    it('adds / removes from the include list on toggle', () => {
      const selected = new Set(['France']);
      expect(getSelectionListMembershipAfterToggle('Italy', selected, false)).toBe(true);
      expect(getSelectionListMembershipAfterToggle('France', selected, false)).toBe(false);
    });

    it('adds an exclusion when unchecking from select-all', () => {
      expect(getSelectionListMembershipAfterToggle('France', new Set(), true)).toBe(true);
    });

    it('removes an exclusion when re-checking an excluded member', () => {
      const exclusions = new Set(['France', 'Italy']);
      expect(getSelectionListMembershipAfterToggle('France', exclusions, true)).toBe(false);
    });
  });
});
