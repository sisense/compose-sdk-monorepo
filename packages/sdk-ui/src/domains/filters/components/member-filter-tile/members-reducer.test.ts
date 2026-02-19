import { membersReducer } from './members-reducer.js';

const initialState = {
  members: [
    {
      title: 'a',
      key: 'keyA',
    },
    {
      title: 'b',
      key: 'keyB',
    },
  ],
  selectedMembers: [],
};

describe('membersReducer', () => {
  it('selects a member', () => {
    const result = membersReducer(initialState, {
      type: 'selectMember',
      member: {
        title: 'b',
        key: 'keyB',
      },
    });

    expect(result).toEqual({
      members: initialState.members,
      selectedMembers: [
        {
          title: 'b',
          key: 'keyB',
        },
      ],
    });
  });

  it('deselects a member', () => {
    const result = membersReducer(
      {
        ...initialState,
        selectedMembers: [...initialState.members],
      },
      {
        type: 'deselectMember',
        memberIndex: 1,
      },
    );

    expect(result).toEqual({
      members: initialState.members,
      selectedMembers: [
        {
          title: 'a',
          key: 'keyA',
        },
      ],
    });
  });

  it('selects all members', () => {
    const result = membersReducer(initialState, {
      type: 'selectAllMembers',
    });

    expect(result).toEqual({
      members: initialState.members,
      selectedMembers: [
        {
          title: 'a',
          key: 'keyA',
        },
        {
          title: 'b',
          key: 'keyB',
        },
      ],
    });
  });

  it('clears all selected members', () => {
    const result = membersReducer(
      {
        ...initialState,
        selectedMembers: [...initialState.members],
      },
      {
        type: 'clearAllMembers',
      },
    );

    expect(result).toEqual({
      members: initialState.members,
      selectedMembers: [],
    });
  });

  describe('toggles a selected member', () => {
    it('to inactive', () => {
      const result = membersReducer(
        {
          ...initialState,
          selectedMembers: [
            {
              title: 'b',
              key: 'keyB',
            },
          ],
        },
        {
          type: 'toggleSelectedMember',
          memberKey: 'keyB',
        },
      );

      expect(result.selectedMembers).toContainEqual({
        title: 'b',
        key: 'keyB',
        inactive: true,
      });
    });

    it('to active', () => {
      const result = membersReducer(
        {
          ...initialState,
          selectedMembers: [
            {
              title: 'b',
              key: 'keyB',
              inactive: true,
            },
          ],
        },
        {
          type: 'toggleSelectedMember',
          memberKey: 'keyB',
        },
      );

      expect(result.selectedMembers).toContainEqual({
        title: 'b',
        key: 'keyB',
        inactive: false,
      });
    });
  });
});
