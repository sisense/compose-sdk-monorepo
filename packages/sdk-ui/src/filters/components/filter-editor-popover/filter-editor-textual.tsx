import { useCallback, useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import { Filter, filterFactory, isMembersFilter } from '@sisense/sdk-data';
import { IncludeAllSection } from './sections/include-all-section';
import { MembersSection } from './sections/members-section';
import { TextConditionSection } from './sections/text-condition-section';
import { isIncludeAllFilter, isIncludeMembersFilter } from './utils';
import { MultiSelectControl } from './multi-select-control';
import { FilterEditorContainer } from './filter-editor-container';
import { useThemeContext } from '@/theme-provider';
import { ScrollWrapperOnScrollEvent } from './common/scroll-wrapper';
import { useGetFilterMembers } from '@/filters';
import { LIST_SCROLL_LOAD_MORE_THRESHOLD, QUERY_MEMBERS_COUNT } from './constants';

enum FilterSections {
  ALL = 'all',
  MEMBERS = 'members',
  TEXT_CONDITION = 'text-condition',
}

const getSelectedSection = (filter: Filter | null) => {
  if (!filter) {
    return null;
  }

  if (isIncludeAllFilter(filter)) {
    return FilterSections.ALL;
  }

  if (isIncludeMembersFilter(filter)) {
    return FilterSections.MEMBERS;
  }

  return FilterSections.TEXT_CONDITION;
};

type FilterEditorTextualProps = {
  filter: Filter;
  onChange?: (filter: Filter | null) => void;
};

/** @internal */
export const FilterEditorTextual = ({ filter, onChange }: FilterEditorTextualProps) => {
  const { themeSettings } = useThemeContext();
  const [editedFilter, setEditedFilter] = useState<Filter | null>(filter ?? null);
  const [selectedSection, setSelectedSection] = useState<FilterSections | null>(
    getSelectedSection(editedFilter),
  );
  const [multiSelectEnabled, setMultiSelectEnabled] = useState<boolean>(
    'enableMultiSelection' in filter.config ? filter.config.enableMultiSelection : true,
  );

  const filterToQueryMembers = useMemo(
    () => (isMembersFilter(filter) ? filter : filterFactory.members(filter.attribute, [])),
    [filter],
  );
  const {
    data: membersData,
    isLoading: membersLoading,
    loadMore: loadMoreMembers,
  } = useGetFilterMembers({
    filter: filterToQueryMembers,
    count: QUERY_MEMBERS_COUNT,
  });

  const handleMembersListScroll = useCallback(
    ({ top, direction }: ScrollWrapperOnScrollEvent) => {
      if (!membersLoading && top > LIST_SCROLL_LOAD_MORE_THRESHOLD && direction === 'down') {
        loadMoreMembers(QUERY_MEMBERS_COUNT);
      }
    },
    [loadMoreMembers, membersLoading],
  );

  useEffect(() => {
    onChange?.(editedFilter);
  }, [editedFilter, onChange]);

  const handleIncludeAllSectionChange = useCallback((newFilter: Filter) => {
    setEditedFilter(newFilter);
    setSelectedSection(FilterSections.ALL);
  }, []);

  const handleMembersSectionChange = useCallback((newFilter: Filter | null) => {
    setEditedFilter(newFilter);
    setSelectedSection(FilterSections.MEMBERS);
  }, []);

  const handleTextConditionSectionChange = useCallback((newFilter: Filter | null) => {
    setEditedFilter(newFilter);
    setSelectedSection(FilterSections.TEXT_CONDITION);
  }, []);

  return (
    <FilterEditorContainer
      style={{
        color: themeSettings.typography.primaryTextColor,
      }}
      aria-label="Filter editor textual"
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '42px',
        }}
      >
        <IncludeAllSection
          filter={filter}
          selected={selectedSection === FilterSections.ALL}
          onChange={handleIncludeAllSectionChange}
        />
        <MultiSelectControl enabled={multiSelectEnabled} onChange={setMultiSelectEnabled} />
      </Stack>
      <MembersSection
        filter={filter}
        members={membersData?.allMembers || []}
        selected={selectedSection === FilterSections.MEMBERS}
        multiSelectEnabled={multiSelectEnabled}
        onChange={handleMembersSectionChange}
        onListScroll={handleMembersListScroll}
        showListLoader={membersLoading}
      />
      <TextConditionSection
        filter={filter}
        members={membersData?.allMembers || []}
        selected={selectedSection === FilterSections.TEXT_CONDITION}
        multiSelectEnabled={multiSelectEnabled}
        onChange={handleTextConditionSectionChange}
        onListScroll={handleMembersListScroll}
        showListLoader={membersLoading}
      />
    </FilterEditorContainer>
  );
};
