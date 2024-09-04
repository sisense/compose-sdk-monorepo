import { useEffect, useMemo, useReducer, useRef } from 'react';
import isEqual from 'lodash-es/isEqual';
import { Member, membersReducer } from './members-reducer';

interface Props {
  initialMembers: Member[];
  initialSelectedMembers: Member[];
  onUpdateSelectedMembers?: (members: string[], disabled?: boolean) => void;
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
      onUpdateSelectedMembers?.(disabled ? [] : activeSelectedMembers, disabled);
    }
  }, [disabled, activeSelectedMembers, onUpdateSelectedMembers]);

  const prevSelectedMembersRef = useRef(selectedMembers);
  useEffect(() => {
    if (!isEqual(selectedMembers, prevSelectedMembersRef.current)) {
      prevSelectedMembersRef.current = selectedMembers;
      onUpdateSelectedMembers?.(activeSelectedMembers, disabled);
    }
  }, [selectedMembers, activeSelectedMembers, onUpdateSelectedMembers, disabled]);

  return {
    members,
    selectedMembers,
    dispatch,
  };
};
