import { useCallback, useEffect, useState } from 'react';
import { SelectableSection } from '../common/selectable-section';
import {
  Attribute,
  CompleteMembersFilterConfig,
  Filter,
  FilterConfig,
  filterFactory,
} from '@ethings-os/sdk-data';
import { usePrevious } from '@/common/hooks/use-previous';
import { MembersListSelect } from '@/filters/components/filter-editor-popover/common/select/members-list-select';
import {
  getConfigWithUpdatedDeactivated,
  getMembersWithDeactivated,
  getMembersWithoutDeactivated,
} from './utils';
import { isIncludeMembersFilter } from '../utils';

function createMembersFilter(attribute: Attribute, members: string[], config?: FilterConfig) {
  return members.length || (config as CompleteMembersFilterConfig)?.deactivatedMembers?.length
    ? filterFactory.members(attribute, members, { ...config, excludeMembers: false })
    : null;
}

type MembersFilterData = {
  selectedMembers: string[];
  multiSelectEnabled: boolean;
};

type MembersSectionProps = {
  filter: Filter;
  selected: boolean;
  multiSelectEnabled: boolean;
  onChange: (filter: Filter | null) => void;
};

/** @internal */
export const MembersSection = (props: MembersSectionProps) => {
  const { filter, selected, multiSelectEnabled, onChange } = props;
  const [selectedMembers, setSelectedMembers] = useState(
    isIncludeMembersFilter(filter) ? getMembersWithDeactivated(filter) : [],
  );

  const prevMultiSelectEnabled = usePrevious(multiSelectEnabled);
  const isMultiSelectChanged =
    typeof prevMultiSelectEnabled !== 'undefined' && prevMultiSelectEnabled !== multiSelectEnabled;

  const prepareAndChangeFilter = useCallback(
    ({ selectedMembers, multiSelectEnabled }: MembersFilterData) => {
      const config = getConfigWithUpdatedDeactivated(filter, selectedMembers);
      const members = getMembersWithoutDeactivated(filter, selectedMembers);
      const newFilter = createMembersFilter(filter.attribute, members, {
        ...config,
        enableMultiSelection: multiSelectEnabled,
      });
      onChange(newFilter);
    },
    [filter, onChange],
  );

  useEffect(() => {
    if (isMultiSelectChanged && selected) {
      let newSelectedMembers = selectedMembers;

      if (!multiSelectEnabled) {
        if (selectedMembers.length > 1) {
          newSelectedMembers = [selectedMembers.sort()[0]];
        }
        setSelectedMembers(newSelectedMembers);
      }

      prepareAndChangeFilter({ selectedMembers: newSelectedMembers, multiSelectEnabled });
    }
  }, [isMultiSelectChanged, multiSelectEnabled, selectedMembers, selected, prepareAndChangeFilter]);

  const handleSectionSelect = useCallback(() => {
    prepareAndChangeFilter({ selectedMembers, multiSelectEnabled });
  }, [selectedMembers, multiSelectEnabled, prepareAndChangeFilter]);

  const handleMembersChange = useCallback(
    (members: string[] | string) => {
      const newMembers = Array.isArray(members) ? members : [members];
      setSelectedMembers(newMembers);
      prepareAndChangeFilter({ selectedMembers: newMembers, multiSelectEnabled });
    },
    [multiSelectEnabled, prepareAndChangeFilter],
  );

  return (
    <SelectableSection
      selected={selected}
      onSelect={handleSectionSelect}
      aria-label="Members section"
    >
      {() => (
        <MembersListSelect
          width={320}
          attribute={filter.attribute}
          multiSelect={multiSelectEnabled}
          selectedMembers={selectedMembers}
          onChange={handleMembersChange}
        />
      )}
    </SelectableSection>
  );
};
