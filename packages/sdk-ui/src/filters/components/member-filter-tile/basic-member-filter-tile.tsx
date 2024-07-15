import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { PillSection } from './pill-section';
import { MemberList } from './member-list';
import { useMembers } from './use-members';
import { FilterTile } from '../filter-tile';
import { Member, SelectedMember } from './members-reducer';
import { useValidatedMembers } from './use-validate-members';
import isEqual from 'lodash/isEqual';

/**
 * Props for {@link BasicMemberFilterTile}
 *
 * @internal
 */
export interface BasicMemberFilterTileProps {
  /** Title to display in the header */
  title: string;
  /** All selectable members */
  allMembers: Member[];
  /** Initial list of selected members. Defaults to empty list */
  initialSelectedMembers?: SelectedMember[];
  /** Callback that executes whenever the final list of active and selected members is updated */
  onUpdateSelectedMembers?: (members: string[], disabled?: boolean) => void;
  /** Configurable limit on size of allowedMembers */
  maxAllowedMembers?: number;
  /** Whether this is a dependent filter */
  isDependent?: boolean;
  /** Flag to update selected members when caused by an external change */
  shouldUpdateSelectedMembers?: boolean;
  /** Whether the filter tile is disabled initially */
  disabled?: boolean;
}

/**
 * UI component that, given a list of members to select from and a list of
 * initial selections, can render selected members as "pills" and can also show
 * a searchable list of members to choose from.
 *
 * @example
 *
 * The example below constructs a BasicMemberFilterTile with a list of all members and a list of initially selected members.
 *
 *
 * ```tsx
 *   const allMembers = ['United States', 'Canada', 'Mexico'].map((m) => ({ key: m, title: m }));
 *   const selectedMembers = ['United States', 'Mexico'].map((m) => ({ key: m, title: m }));
 *
 *   return (
 *     <div>
 *       <BasicMemberFilterTile
 *         title={'Country'}
 *         allMembers={allMembers}
 *         initialSelectedMembers={selectedMembers}
 *       />
 *     </div>
 *   );
 * ```
 *
 * <img src="media://basic-member-filter-tile-example-1.png" width="300px" />
 * @param props - Basic member filter tile props
 * @returns Basic member filter tile component
 * @internal
 */
export const BasicMemberFilterTile: FunctionComponent<BasicMemberFilterTileProps> = ({
  title,
  allMembers,
  initialSelectedMembers = [],
  onUpdateSelectedMembers,
  maxAllowedMembers = 2000,
  isDependent,
  shouldUpdateSelectedMembers,
  disabled: initialDisabled,
}) => {
  const [disabled, setDisabled] = useState(initialDisabled ?? false);

  const initialMembers = useValidatedMembers({
    allMembers,
    initialSelectedMembers,
    maxAllowedMembers,
  });

  const {
    members,
    selectedMembers,
    dispatch: dispatchMembersAction,
  } = useMembers({
    initialMembers,
    initialSelectedMembers,
    onUpdateSelectedMembers,
    disabled,
  });

  const onChangeSelectedMembers = (member: Member) => {
    const memberIndex = selectedMembers.findIndex((m) => m.key === member.key);
    if (memberIndex === -1) {
      dispatchMembersAction({
        type: 'selectMember',
        member,
      });
    } else {
      dispatchMembersAction({
        type: 'deselectMember',
        memberIndex,
      });
    }
  };

  const pills = useMemo(
    () =>
      members
        .filter(
          (m) =>
            selectedMembers.some((sm) => m.key === sm.key) ||
            initialSelectedMembers.some((sm) => m.key === sm.key),
        )
        .map((m) => ({ ...m, inactive: !initialSelectedMembers.some((sm) => m.key === sm.key) })),
    [initialSelectedMembers, members, selectedMembers],
  );

  useEffect(() => {
    const initialMembersAreNotAllSelected =
      initialSelectedMembers.filter((m) =>
        selectedMembers.some((sm) => m.key === sm.key && !!m.inactive === !!sm.inactive),
      ).length !== initialSelectedMembers.length;
    const otherMembersAreSelected =
      selectedMembers.filter(
        (sm) => !initialSelectedMembers.some((m) => sm.key === m.key) && !sm.inactive,
      ).length !== 0;

    const doesNotMatchCurrentSelectedMembers =
      initialMembersAreNotAllSelected || otherMembersAreSelected;

    if (shouldUpdateSelectedMembers && doesNotMatchCurrentSelectedMembers) {
      dispatchMembersAction({
        type: 'updateMembers',
        members: pills,
      });
      if (disabled && initialSelectedMembers.length > 0) {
        setDisabled((v) => !v);
      }
    }

    if (!isEqual(allMembers, members)) {
      dispatchMembersAction({
        type: 'updatePossibleMembers',
        members: allMembers,
      });
    }
  }, [
    allMembers,
    disabled,
    dispatchMembersAction,
    initialSelectedMembers,
    members,
    pills,
    selectedMembers,
    title,
    shouldUpdateSelectedMembers,
  ]);

  return (
    <FilterTile
      title={title}
      renderContent={(collapsed, tileDisabled) => {
        if (collapsed) {
          return (
            <PillSection
              members={allMembers}
              selectedMembers={selectedMembers}
              onToggleSelectedMember={(memberKey) => {
                dispatchMembersAction({ type: 'toggleSelectedMember', memberKey });
              }}
              excludeMembers={false}
              disabled={tileDisabled}
            />
          );
        }
        return (
          <MemberList
            members={members}
            selectedMembers={selectedMembers}
            onSelectMember={onChangeSelectedMembers}
            checkAllMembers={() => dispatchMembersAction({ type: 'selectAllMembers' })}
            uncheckAllMembers={() => dispatchMembersAction({ type: 'clearAllMembers' })}
            excludeMembers={false}
            disabled={tileDisabled}
          />
        );
      }}
      disabled={disabled}
      onToggleDisabled={() => setDisabled((v) => !v)}
      isDependent={isDependent}
    />
  );
};
