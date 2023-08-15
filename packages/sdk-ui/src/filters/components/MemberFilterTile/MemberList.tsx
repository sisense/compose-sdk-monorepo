import { debounce } from 'lodash';
import { FunctionComponent, useMemo, useState } from 'react';
import { Checkbox } from '../common';
import { Member, SelectedMember } from './membersReducer';

const SEARCH_DELAY_MS = 300;
const SearchBox: FunctionComponent<{
  onChange: (searchString: string) => void;
  delayMs?: number;
  disabled: boolean;
}> = ({ onChange, delayMs = SEARCH_DELAY_MS, disabled }) => {
  const debouncedOnChange = debounce((v: string) => onChange(v), delayMs);

  return (
    <input
      className="text-[13px] focus:outline-none pl-2"
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
  onCheck: () => void;
  disabled: boolean;
}> = ({ label, checked, onCheck, disabled }) => {
  return (
    <Checkbox
      wrapperClassName="border-b hover:bg-row-hover"
      label={label}
      checked={checked}
      readOnly
      onChange={onCheck}
      disabled={disabled}
    />
  );
};

export interface MemberListProps {
  members: Member[];
  selectedMembers: SelectedMember[];
  onSelectMember: (member: Member) => void;
  selectAllMembers: () => void;
  clearAllMembers: () => void;
  disabled: boolean;
}

export const MemberList: FunctionComponent<MemberListProps> = ({
  members,
  selectedMembers,
  onSelectMember,
  selectAllMembers,
  clearAllMembers,
  disabled,
}) => {
  const [searchString, setSearchString] = useState('');
  const filteredMembers = useMemo(() => {
    if (searchString && searchString.trim().length > 0) {
      return members.filter((m) => m.title.toLowerCase().includes(searchString.toLowerCase()));
    }

    return members;
  }, [members, searchString]);

  const allSelected = selectedMembers.length === members.length;

  return (
    <div className={'p-3'}>
      <div className="flex">
        <Checkbox
          aria-label="change-all"
          checked={allSelected}
          onChange={(e) => {
            if (e.target.checked) {
              selectAllMembers();
            } else {
              clearAllMembers();
            }
          }}
          readOnly
          disabled={disabled}
        />
        <SearchBox onChange={(s) => setSearchString(s)} disabled={disabled} />
      </div>
      <div className="max-h-[150px] overflow-auto">
        {filteredMembers.map((m) => (
          <MemberRow
            key={m.key}
            label={m.title}
            checked={!!selectedMembers.find((sm) => m.key === sm.key)}
            onCheck={() => onSelectMember(m)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};
