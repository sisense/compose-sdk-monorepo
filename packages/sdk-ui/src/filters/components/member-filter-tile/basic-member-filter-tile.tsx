import { FunctionComponent, useState } from 'react';
import { PillSection } from './pill-section';
import { MemberList } from './member-list';
import { useMembers } from './use-members';
import { FilterTile } from '../filter-tile';
import { Member, SelectedMember } from './members-reducer';
import { useValidatedMembers } from './use-validate-members';

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
  onUpdateSelectedMembers?: (members: string[]) => void;
  /** Configurable limit on size of allowedMembers */
  maxAllowedMembers?: number;
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
 * ###
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
  maxAllowedMembers = 1000,
}) => {
  const [disabled, setDisabled] = useState(false);

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

  return (
    <FilterTile
      title={title}
      renderContent={(collapsed, tileDisabled) => {
        if (collapsed) {
          return (
            <PillSection
              membersSize={members.length}
              selectedMembers={selectedMembers}
              onToggleSelectedMember={(memberKey) =>
                dispatchMembersAction({ type: 'toggleSelectedMember', memberKey })
              }
              disabled={tileDisabled}
            />
          );
        }

        return (
          <MemberList
            members={members}
            selectedMembers={selectedMembers}
            onSelectMember={onChangeSelectedMembers}
            selectAllMembers={() => dispatchMembersAction({ type: 'selectAllMembers' })}
            clearAllMembers={() => dispatchMembersAction({ type: 'clearAllMembers' })}
            disabled={tileDisabled}
          />
        );
      }}
      disabled={disabled}
      onToggleDisabled={() => setDisabled((v) => !v)}
    />
  );
};
