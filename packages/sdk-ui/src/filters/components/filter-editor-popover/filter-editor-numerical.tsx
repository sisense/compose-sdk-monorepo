import { useCallback, useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import { Filter, filterFactory, isMembersFilter } from '@sisense/sdk-data';
import { IncludeAllSection } from './sections/include-all-section';
import { MembersSection } from './sections/members-section';
import { isIncludeAllFilter, isIncludeMembersFilter, isNumericBetweenFilter } from './utils';
import { MultiSelectControl } from './multi-select-control';
import { FilterEditorContainer } from './filter-editor-container';
import { NumericRangeSection } from './sections/numeric-range-section';
import { NumericAttributeStats, useGetAttributeStats } from './hooks/use-get-attribute-stats';
import { NumericConditionSection } from './sections/numeric-condition-section';
import { useThemeContext } from '@/theme-provider';
import { ScrollWrapperOnScrollEvent } from './common/scroll-wrapper';
import { useGetFilterMembers } from '@/filters';
import { LIST_SCROLL_LOAD_MORE_THRESHOLD, QUERY_MEMBERS_COUNT } from './constants';

enum FilterSections {
  ALL = 'all',
  MEMBERS = 'members',
  RANGE = 'range',
  CONDITION = 'condition',
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

  if (isNumericBetweenFilter(filter)) {
    return FilterSections.RANGE;
  }

  return FilterSections.CONDITION;
};

type FilterEditorNumericalProps = {
  filter: Filter;
  onChange?: (filter: Filter | null) => void;
};

/** @internal */
export const FilterEditorNumerical = ({ filter, onChange }: FilterEditorNumericalProps) => {
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

  const { data: attributeStats } = useGetAttributeStats<NumericAttributeStats>({
    attribute: filter.attribute,
    enabled: !!filter,
  });

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

  const handleRangeSectionChange = useCallback((newFilter: Filter | null) => {
    setEditedFilter(newFilter);
    setSelectedSection(FilterSections.RANGE);
  }, []);

  const handleConditionSectionChange = useCallback((newFilter: Filter | null) => {
    setEditedFilter(newFilter);
    setSelectedSection(FilterSections.CONDITION);
  }, []);

  return (
    <FilterEditorContainer
      style={{
        color: themeSettings.typography.primaryTextColor,
      }}
      aria-label="Filter editor numerical"
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
      <NumericRangeSection
        filter={filter}
        selected={selectedSection === FilterSections.RANGE}
        defaultFrom={attributeStats?.min}
        defaultTo={attributeStats?.max}
        onChange={handleRangeSectionChange}
      />
      <NumericConditionSection
        filter={filter}
        members={membersData?.allMembers || []}
        selected={selectedSection === FilterSections.CONDITION}
        multiSelectEnabled={multiSelectEnabled}
        onChange={handleConditionSectionChange}
        onListScroll={handleMembersListScroll}
        showListLoader={membersLoading}
      />
    </FilterEditorContainer>
  );
};
