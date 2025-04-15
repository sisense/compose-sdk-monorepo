import { useCallback, useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import { DateLevels, Filter, isDateRangeFilter, LevelAttribute } from '@sisense/sdk-data';
import { IncludeAllSection } from './sections/include-all-section';
import {
  isIncludeAllFilter,
  isIncludeMembersFilter,
  isRelativeDateFilterWithoutAnchor,
  isSupportedByFilterEditor,
} from './utils';
import { MultiSelectControl } from './multi-select-control';
import { FilterEditorContainer } from './filter-editor-container';
import {
  DatetimeAttributeStats,
  useGetAttributeStats,
} from '@/filters/components/filter-editor-popover/hooks/use-get-attribute-stats';
import { useThemeContext } from '@/theme-provider';
import { DatetimeMembersSection } from './sections/datetime-members-section';
import { DatetimeRangeSection } from './sections/datetime-range-section';
import { DatetimeConditionSection } from './sections/datetime-condition-section';
import { DatetimeRelativeSection } from './sections/datetime-relative-section';
import { NotSupportedSection } from '@/filters/components/filter-editor-popover/sections/not-supported-section';
import { useFilterEditorContext } from './filter-editor-context';

enum FilterSections {
  NOT_SUPPORTED = 'not-supported',
  ALL = 'all',
  MEMBERS = 'members',
  RELATIVE = 'relative',
  RANGE = 'range',
  CONDITION = 'condition',
}

const getSelectedSection = (filter: Filter | null) => {
  if (!filter) {
    return null;
  }

  if (!isSupportedByFilterEditor(filter)) {
    return FilterSections.NOT_SUPPORTED;
  }

  if (isIncludeAllFilter(filter)) {
    return FilterSections.ALL;
  }

  if (isIncludeMembersFilter(filter)) {
    return FilterSections.MEMBERS;
  }

  if (isRelativeDateFilterWithoutAnchor(filter)) {
    return FilterSections.RELATIVE;
  }

  if (isDateRangeFilter(filter)) {
    return FilterSections.RANGE;
  }

  return FilterSections.CONDITION;
};

type FilterEditorDatetimeProps = {
  filter: Filter;
  onChange?: (filter: Filter | null) => void;
  showMultiselectToggle?: boolean;
};

/** @internal */
export const FilterEditorDatetime = ({
  filter,
  onChange,
  showMultiselectToggle = true,
}: FilterEditorDatetimeProps) => {
  const { themeSettings } = useThemeContext();
  const { defaultDataSource, parentFilters, membersOnlyMode } = useFilterEditorContext();
  const [editedFilter, setEditedFilter] = useState<Filter | null>(filter ?? null);
  const [selectedSection, setSelectedSection] = useState<FilterSections | null>(
    getSelectedSection(editedFilter),
  );
  const [multiSelectEnabled, setMultiSelectEnabled] = useState<boolean>(
    'enableMultiSelection' in filter.config ? filter.config.enableMultiSelection : true,
  );

  const { data: attributeStats } = useGetAttributeStats<DatetimeAttributeStats>({
    attribute: useMemo(
      () => (filter.attribute as LevelAttribute).setGranularity(DateLevels.Days),
      [filter],
    ),
    filters: parentFilters,
    enabled: !!filter,
    ...(defaultDataSource && { defaultDataSource }),
  });

  const dateLimits = useMemo(
    () => ({
      maxDate: attributeStats?.max,
      minDate: attributeStats?.min,
    }),
    [attributeStats],
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

  const handleRelativeSectionChange = useCallback((newFilter: Filter | null) => {
    setEditedFilter(newFilter);
    setSelectedSection(FilterSections.RELATIVE);
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
    <FilterEditorContainer theme={themeSettings} aria-label="Filter editor datetime">
      {!isSupportedByFilterEditor(filter) && (
        <NotSupportedSection selected={selectedSection === FilterSections.NOT_SUPPORTED} />
      )}
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

        {showMultiselectToggle && (
          <MultiSelectControl enabled={multiSelectEnabled} onChange={setMultiSelectEnabled} />
        )}
      </Stack>
      <DatetimeMembersSection
        filter={filter}
        selected={selectedSection === FilterSections.MEMBERS}
        multiSelectEnabled={multiSelectEnabled}
        limits={dateLimits}
        onChange={handleMembersSectionChange}
      />
      {!membersOnlyMode && (
        <>
          <DatetimeRelativeSection
            filter={filter}
            selected={selectedSection === FilterSections.RELATIVE}
            onChange={handleRelativeSectionChange}
          />
          <DatetimeRangeSection
            filter={filter}
            selected={selectedSection === FilterSections.RANGE}
            limits={dateLimits}
            onChange={handleRangeSectionChange}
          />
        </>
      )}
      <DatetimeConditionSection
        filter={filter}
        selected={selectedSection === FilterSections.CONDITION}
        multiSelectEnabled={multiSelectEnabled}
        limits={dateLimits}
        onChange={handleConditionSectionChange}
      />
    </FilterEditorContainer>
  );
};
