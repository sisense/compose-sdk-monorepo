import { produce } from 'immer';

export interface Member {
  key: string;
  title: string;
}

export interface SelectedMember extends Member {
  inactive?: boolean;
}

type MembersState = {
  members: Member[];
  selectedMembers: SelectedMember[];
};

type SelectMemberAction = {
  type: 'selectMember';
  member: Member;
};

type DeselectMemberAction = {
  type: 'deselectMember';
  memberIndex: number;
};

type SelectAllMembersAction = {
  type: 'selectAllMembers';
};

type UpdatePossibleMembersAction = {
  type: 'updatePossibleMembers';
  members: Member[];
};

type UpdateMembersAction = {
  type: 'updateMembers';
  members: SelectedMember[];
};

type ClearAllMembersAction = {
  type: 'clearAllMembers';
};

type ToggleSelectedMemberAction = {
  type: 'toggleSelectedMember';
  memberKey: string;
};

export type MembersAction =
  | SelectMemberAction
  | DeselectMemberAction
  | SelectAllMembersAction
  | UpdatePossibleMembersAction
  | UpdateMembersAction
  | ClearAllMembersAction
  | ToggleSelectedMemberAction;

export function membersReducer(state: MembersState, action: MembersAction): MembersState {
  switch (action.type) {
    case 'selectMember':
      return selectMemberReducer(state, action.member);
    case 'deselectMember':
      return deselectMemberReducer(state, action.memberIndex);
    case 'selectAllMembers':
      return selectAllReducer(state);
    case 'updateMembers':
      return updateMembersAction(state, action.members);
    case 'clearAllMembers':
      return clearAllReducer(state);
    case 'updatePossibleMembers':
      return updatePossibleMembersAction(state, action.members);
    case 'toggleSelectedMember':
      return toggleSelectedMemberReducer(state, action.memberKey);
  }
}

function selectMemberReducer(state: MembersState, member: Member): MembersState {
  return produce(state, (draft) => {
    draft.selectedMembers.push(member);
  });
}

function deselectMemberReducer(state: MembersState, index: number): MembersState {
  return produce(state, (draft) => {
    draft.selectedMembers.splice(index, 1);
  });
}

function selectAllReducer(state: MembersState): MembersState {
  return produce(state, (draft) => {
    draft.selectedMembers = draft.members;
  });
}

function updateMembersAction(state: MembersState, members: SelectedMember[]): MembersState {
  return produce(state, (draft) => {
    draft.selectedMembers = members;
  });
}

function updatePossibleMembersAction(state: MembersState, members: SelectedMember[]): MembersState {
  return produce(state, (draft) => {
    draft.members = members;
    if (members.some((m) => !draft.selectedMembers.some((sm) => m.key === sm.key))) {
      draft.selectedMembers = [];
    } else {
      draft.selectedMembers = draft.selectedMembers.filter((sm) =>
        members.some((m) => m.key === sm.key),
      );
    }
  });
}

function clearAllReducer(state: MembersState): MembersState {
  return produce(state, (draft) => {
    draft.selectedMembers = [];
  });
}

function toggleSelectedMemberReducer(state: MembersState, key: string): MembersState {
  return produce(state, (draft) => {
    const member = draft.selectedMembers.find((m) => m.key === key);
    if (member) {
      member.inactive = !member.inactive;
    }
  });
}
