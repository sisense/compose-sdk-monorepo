import { useMemo } from 'react';
import { dedupe } from '../../../utils/dedupe';
import { Member, SelectedMember } from './members-reducer';

interface Props {
  allMembers: Member[];
  initialSelectedMembers: SelectedMember[];
  maxAllowedMembers: number;
}

export const useValidatedMembers = ({
  allMembers,
  initialSelectedMembers,
  maxAllowedMembers,
}: Props): Member[] => {
  const cappedMembers = useMemo(() => {
    if (allMembers.length > maxAllowedMembers) {
      console.warn(
        `List of members exceeds max allowed size, limiting from ${allMembers.length} to ${maxAllowedMembers} members`,
      );

      return [
        ...allMembers.slice(0, maxAllowedMembers - initialSelectedMembers.length),
        ...initialSelectedMembers,
      ];
    }

    return allMembers;
  }, [allMembers, maxAllowedMembers, initialSelectedMembers]);

  return useMemo(() => {
    const dedupedMembers = dedupe(cappedMembers, (m) => m.key);

    if (dedupedMembers.length !== cappedMembers.length) {
      console.warn('Removing detected duplicate member(s)');
      return dedupedMembers;
    }

    return cappedMembers;
  }, [cappedMembers]);
};
