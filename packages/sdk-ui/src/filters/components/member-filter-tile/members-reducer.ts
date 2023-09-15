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
    case 'clearAllMembers':
      return clearAllReducer(state);
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
