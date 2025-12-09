import { CSSProperties, FunctionComponent, useMemo, useState } from 'react';

import debounce from 'lodash-es/debounce';

import { MemberRadio } from '@/filters/components/common/member-radio';
import styled from '@/styled';

import { Checkbox } from '../common';
import { Member, SelectedMember } from './members-reducer';

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
  style?: CSSProperties;
}> = ({ onChange, delayMs = SEARCH_DELAY_MS, disabled, style }) => {
  const debouncedOnChange = debounce((v: string) => onChange(v), delayMs);

  return (
    <SearchInput
      placeholder="Start typing to search..."
      disabled={disabled}
      onChange={(e) => {
        debouncedOnChange(e.target.value);
      }}
      type="search"
      style={style}
    />
  );
};

const MemberRow: FunctionComponent<{
  label: string;
  checked: boolean;
  onCheck: (isChecked: boolean) => void;
  inactive: boolean;
  disabled: boolean;
  mode?: 'radio' | 'checkbox';
}> = ({ label, checked, onCheck, disabled, inactive, mode }) => {
  return mode === 'radio' ? (
    <MemberRadio
      wrapperClassName="csdk-border-b hover:csdk-bg-row-hover"
      label={label}
      isLabelInactive={inactive}
      checked={checked}
      readOnly
      name="member-radio"
      onChange={(e) => onCheck(e.target.checked)}
      disabled={disabled}
    />
  ) : (
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
  enableMultiSelection: boolean;
  disabled: boolean;
}

export const MemberList: FunctionComponent<MemberListProps> = ({
  members,
  selectedMembers,
  onSelectMember,
  checkAllMembers,
  uncheckAllMembers,
  excludeMembers,
  enableMultiSelection,
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

  const [inactiveMembersMap, selectedMembersMap] = useMemo(() => {
    const inactiveMembersMap = new Map<string, boolean>();
    const selectedMembersMap = new Map<string, boolean>();

    selectedMembers.forEach((member) => {
      selectedMembersMap.set(member.key, true);
      if (member.inactive) inactiveMembersMap.set(member.key, true);
    });

    return [inactiveMembersMap, selectedMembersMap];
  }, [selectedMembers]);

  return (
    <div className={'csdk-p-3'}>
      <div className="csdk-flex csdk-mb-[3px]">
        {enableMultiSelection && (
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
              excludeMembers &&
              selectedMembers.length > 0 &&
              selectedMembers.length < members.length
            }
            disabled={disabled}
          />
        )}
        <SearchBox
          onChange={(s) => setSearchString(s)}
          disabled={disabled}
          style={enableMultiSelection ? {} : { paddingLeft: 6 }}
        />
      </div>
      <div className="csdk-max-h-[150px] csdk-overflow-auto">
        {filteredMembers.map((member) => (
          <MemberRow
            key={member.key}
            label={member.title}
            mode={enableMultiSelection ? 'checkbox' : 'radio'}
            checked={
              enableMultiSelection
                ? // when excludeMembers is true, checking (ticking) a member means deselecting it.
                  // In other words, selected member is unchecked
                  selectedMembersMap.has(member.key) === !excludeMembers
                : selectedMembersMap.has(member.key)
            }
            onCheck={(isChecked) => {
              if (enableMultiSelection) {
                // when excludeMembers is true, unchecking (unticking) a member means selecting it
                onSelectMember(member, excludeMembers ? !isChecked : isChecked);
              } else {
                onSelectMember(member, isChecked);
              }
            }}
            disabled={disabled}
            inactive={inactiveMembersMap.has(member.key)}
          />
        ))}
      </div>
    </div>
  );
};
