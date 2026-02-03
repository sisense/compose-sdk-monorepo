import { CSSProperties, FunctionComponent, useMemo } from 'react';

import { MemberRadio } from '@/domains/filters/components/common/member-radio';
import styled from '@/infra/styled';

import { Checkbox } from '../common';
import {
  ScrollWrapper,
  ScrollWrapperOnScrollEvent,
} from '../filter-editor-popover/common/scroll-wrapper';
import { SmallLoader } from '../filter-editor-popover/common/small-loader';
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

const SearchBox: FunctionComponent<{
  value?: string;
  onChange: (searchString: string) => void;
  disabled: boolean;
  style?: CSSProperties;
}> = ({ onChange, disabled, style, value }) => {
  return (
    <SearchInput
      placeholder="Start typing to search..."
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
  isMembersLoading?: boolean;
  selectedMembers: SelectedMember[];
  onSelectMember: (member: Member, isSelected: boolean) => void;
  checkAllMembers: () => void;
  uncheckAllMembers: () => void;
  excludeMembers: boolean;
  enableMultiSelection: boolean;
  disabled: boolean;
  onListScroll?: (event: ScrollWrapperOnScrollEvent) => void;
  searchValue?: string;
  onSearchValueChange?: (searchString: string) => void;
}

export const MemberList: FunctionComponent<MemberListProps> = ({
  members,
  isMembersLoading,
  selectedMembers,
  onSelectMember,
  checkAllMembers,
  uncheckAllMembers,
  excludeMembers,
  enableMultiSelection,
  disabled,
  onListScroll,
  searchValue,
  onSearchValueChange,
}) => {
  const filteredMembers = useMemo(() => {
    if (searchValue && searchValue.trim().length > 0) {
      return members.filter((m) => m.title.toLowerCase().includes(searchValue.toLowerCase()));
    }

    return members;
  }, [members, searchValue]);

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
            checked={allChecked && selectedMembers.length === 0}
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
          value={searchValue}
          onChange={(s) => onSearchValueChange?.(s)}
          disabled={disabled}
          style={enableMultiSelection ? {} : { paddingLeft: 6 }}
        />
      </div>
      <ScrollWrapper style={{ maxHeight: 150 }} onScroll={onListScroll}>
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
        {isMembersLoading && <SmallLoader />}
      </ScrollWrapper>
    </div>
  );
};
