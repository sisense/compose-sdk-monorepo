import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectableSection } from '../common/selectable-section';
import { SearchableMultiSelect } from '../common/select/searchable-multi-select';
import { Attribute, Filter, FilterConfig, filterFactory } from '@sisense/sdk-data';
import { isIncludeMembersFilter } from '../utils';
import { SearchableSingleSelect } from '../common/select/searchable-single-select';
import { usePrevious } from '@/common/hooks/use-previous';

function createMembersFilter(attribute: Attribute, members: string[], config?: FilterConfig) {
  return members.length
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
  members: string[];
  multiSelectEnabled: boolean;
  onChange: (filter: Filter | null) => void;
};

/** @internal */
export const MembersSection = (props: MembersSectionProps) => {
  const { filter, selected, members, multiSelectEnabled, onChange } = props;
  const { t } = useTranslation();
  const [selectedMembers, setSelectedMembers] = useState(
    isIncludeMembersFilter(filter) ? filter.members : [],
  );
  const prevMultiSelectEnabled = usePrevious(multiSelectEnabled);
  const selectItems = useMemo(() => members.map((member) => ({ value: member })), [members]);
  const isMultiSelectChanged =
    typeof prevMultiSelectEnabled !== 'undefined' && prevMultiSelectEnabled !== multiSelectEnabled;

  const prepareAndChangeFilter = useCallback(
    ({ selectedMembers, multiSelectEnabled }: MembersFilterData) => {
      const newFilter = createMembersFilter(filter.attribute, selectedMembers, {
        ...filter.config,
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
    <SelectableSection selected={selected} onSelect={handleSectionSelect}>
      {() =>
        multiSelectEnabled ? (
          <SearchableMultiSelect<string>
            style={{ width: '320px' }}
            values={selectedMembers}
            placeholder={t('filterEditor.placeholders.selectFromList')}
            items={selectItems}
            onChange={handleMembersChange}
          />
        ) : (
          <SearchableSingleSelect<string>
            style={{ width: '320px' }}
            value={selectedMembers[0]}
            placeholder={t('filterEditor.placeholders.selectFromList')}
            items={selectItems}
            onChange={handleMembersChange}
          />
        )
      }
    </SelectableSection>
  );
};
