import { useEffect, useMemo, useReducer, useRef } from 'react';
import isEqual from 'lodash/isEqual';
import { Member, membersReducer } from './membersReducer';

interface Props {
  initialMembers: Member[];
  initialSelectedMembers: Member[];
  onUpdateSelectedMembers?: (members: string[]) => void;
  disabled: boolean;
}

export const useMembers = ({
  initialMembers,
  initialSelectedMembers,
  onUpdateSelectedMembers,
  disabled,
}: Props) => {
  const [{ members, selectedMembers }, dispatch] = useReducer(membersReducer, {
    selectedMembers: initialSelectedMembers,
    members: initialMembers,
  });

  const activeSelectedMembers = useMemo(
    () => selectedMembers.filter((m) => !m.inactive).map((m) => m.key),
    [selectedMembers],
  );

  const prevDisabledRef = useRef(disabled);
  useEffect(() => {
    if (disabled !== prevDisabledRef.current) {
      prevDisabledRef.current = disabled;
      onUpdateSelectedMembers?.(disabled ? [] : activeSelectedMembers);
    }
  }, [disabled, activeSelectedMembers, onUpdateSelectedMembers]);

  const prevSelectedMembersRef = useRef(selectedMembers);
  useEffect(() => {
    if (!isEqual(selectedMembers, prevSelectedMembersRef.current)) {
      prevSelectedMembersRef.current = selectedMembers;
      onUpdateSelectedMembers?.(activeSelectedMembers);
    }
  }, [selectedMembers, activeSelectedMembers, onUpdateSelectedMembers]);

  return {
    members,
    selectedMembers,
    dispatch,
  };
};
