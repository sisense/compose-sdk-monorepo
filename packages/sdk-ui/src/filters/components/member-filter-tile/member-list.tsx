import debounce from 'lodash-es/debounce';
import { FunctionComponent, useMemo, useState } from 'react';
import { Checkbox } from '../common';
import { Member, SelectedMember } from './members-reducer';
import styled from '@emotion/styled';

const SearchInput = styled.input`
  font-size: 13px;
  padding-left: 0.75rem;
  background-color: transparent;
  color: inherit;
  outline: none;
  border: none;
  appearance: none;
  font-family: inherit;

  &:focus {
    outline: none;
  }

  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }

  &::placeholder {
    color: inherit;
    opacity: 0.75;
  }
`;

const SEARCH_DELAY_MS = 300;
const SearchBox: FunctionComponent<{
  onChange: (searchString: string) => void;
  delayMs?: number;
  disabled: boolean;
}> = ({ onChange, delayMs = SEARCH_DELAY_MS, disabled }) => {
  const debouncedOnChange = debounce((v: string) => onChange(v), delayMs);

  return (
    <SearchInput
      placeholder="Start typing to search..."
      disabled={disabled}
      onChange={(e) => {
        debouncedOnChange(e.target.value);
      }}
      type="search"
    />
  );
};

const MemberRow: FunctionComponent<{
  label: string;
  checked: boolean;
  onCheck: (isChecked: boolean) => void;
  inactive: boolean;
  disabled: boolean;
}> = ({ label, checked, onCheck, disabled, inactive }) => {
  return (
    <Checkbox
      wrapperClassName="csdk-border-b hover:csdk-bg-row-hover"
      label={label}
      isLabelInactive={inactive}
      checked={checked}
      readOnly
      onChange={(e) => onCheck(e.target.checked)}
      disabled={disabled}
    />
  );
};

export interface MemberListProps {
  members: Member[];
  selectedMembers: SelectedMember[];
  onSelectMember: (member: Member, isSelected: boolean) => void;
  checkAllMembers: () => void;
  uncheckAllMembers: () => void;
  excludeMembers: boolean;
  disabled: boolean;
}

export const MemberList: FunctionComponent<MemberListProps> = ({
  members,
  selectedMembers,
  onSelectMember,
  checkAllMembers,
  uncheckAllMembers,
  excludeMembers,
  disabled,
}) => {
  const [searchString, setSearchString] = useState('');
  const filteredMembers = useMemo(() => {
    if (searchString && searchString.trim().length > 0) {
      return members.filter((m) => m.title.toLowerCase().includes(searchString.toLowerCase()));
    }

    return members;
  }, [members, searchString]);

  const allChecked = excludeMembers
    ? selectedMembers.length === 0
    : selectedMembers.length === members.length;

  return (
    <div className={'csdk-p-3'}>
      <div className="csdk-flex csdk-mb-[3px]">
        <Checkbox
          aria-label="change-all"
          checked={allChecked}
          onChange={(e) => {
            if (e.target.checked) {
              checkAllMembers();
            } else {
              uncheckAllMembers();
            }
          }}
          readOnly
          indeterminate={
            excludeMembers && selectedMembers.length > 0 && selectedMembers.length < members.length
          }
          disabled={disabled}
        />
        <SearchBox onChange={(s) => setSearchString(s)} disabled={disabled} />
      </div>
      <div className="csdk-max-h-[150px] csdk-overflow-auto">
        {filteredMembers.map((member) => (
          <MemberRow
            key={member.key}
            label={member.title}
            checked={
              // when excludeMembers is true, checking (ticking) a member means deselecting it.
              // In other words, selected member is unchecked
              selectedMembers.some((selectedMember) => member.key === selectedMember.key) ===
              !excludeMembers
            }
            onCheck={(isChecked) =>
              // when excludeMembers is true, unchecking (unticking) a member means selecting it
              onSelectMember(member, excludeMembers ? !isChecked : isChecked)
            }
            disabled={disabled}
            inactive={selectedMembers.some(
              (selectedMember) => member.key === selectedMember.key && selectedMember.inactive,
            )}
          />
        ))}
      </div>
    </div>
  );
};
