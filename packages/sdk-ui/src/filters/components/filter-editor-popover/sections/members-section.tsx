import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectableSection } from '../common/selectable-section';
import { SearchableMultiSelect } from '../common/select/searchable-multi-select';
import { Attribute, Filter, FilterConfig, filterFactory } from '@sisense/sdk-data';
import { SearchableSingleSelect } from '../common/select/searchable-single-select';
import { usePrevious } from '@/common/hooks/use-previous';
import { useThemeContext } from '@/theme-provider';
import { Member } from '@/filters';
import { isIncludeMembersFilter } from '@/filters/components/filter-editor-popover/utils';
import { ScrollWrapperOnScrollEvent } from '@/filters/components/filter-editor-popover/common/scroll-wrapper';

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
  members: Member[];
  multiSelectEnabled: boolean;
  onChange: (filter: Filter | null) => void;
  onListScroll?: (event: ScrollWrapperOnScrollEvent) => void;
  showListLoader?: boolean;
};

/** @internal */
export const MembersSection = (props: MembersSectionProps) => {
  const { themeSettings } = useThemeContext();
  const {
    filter,
    selected,
    members,
    multiSelectEnabled,
    onChange,
    onListScroll,
    showListLoader = false,
  } = props;
  const { t } = useTranslation();
  const [selectedMembers, setSelectedMembers] = useState(
    isIncludeMembersFilter(filter) ? filter.members : [],
  );
  const prevMultiSelectEnabled = usePrevious(multiSelectEnabled);
  const selectItems = useMemo(() => {
    let allMembers = members.map((member) => ({ value: member.key }));
    if (isIncludeMembersFilter(filter) && filter.members.length) {
      const selectedMembers = multiSelectEnabled ? filter.members : [filter.members[0]];
      allMembers = [
        ...selectedMembers.map((member) => ({ value: member })),
        ...allMembers.filter((member) => !selectedMembers.includes(member.value)),
      ];
    }
    return allMembers;
  }, [multiSelectEnabled, members, filter]);
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
    <SelectableSection
      selected={selected}
      onSelect={handleSectionSelect}
      aria-label="Members section"
    >
      {() =>
        multiSelectEnabled ? (
          <SearchableMultiSelect<string>
            style={{ width: '320px' }}
            values={selectedMembers}
            placeholder={t('filterEditor.placeholders.selectFromList')}
            items={selectItems}
            onChange={handleMembersChange}
            primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
            primaryColor={themeSettings.typography.primaryTextColor}
            onListScroll={onListScroll}
            showListLoader={showListLoader}
          />
        ) : (
          <SearchableSingleSelect<string>
            style={{ width: '320px' }}
            value={selectedMembers[0]}
            placeholder={t('filterEditor.placeholders.selectFromList')}
            items={selectItems}
            onChange={handleMembersChange}
            primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
            primaryColor={themeSettings.typography.primaryTextColor}
            onListScroll={onListScroll}
            showListLoader={showListLoader}
          />
        )
      }
    </SelectableSection>
  );
};
