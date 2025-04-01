import { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import { Filter } from '@sisense/sdk-data';
import { IncludeAllSection } from './sections/include-all-section';
import { MembersSection } from './sections/members-section';
import {
  isIncludeAllFilter,
  isIncludeMembersFilter,
  isNumericBetweenFilter,
  isSupportedByFilterEditor,
} from './utils';
import { MultiSelectControl } from './multi-select-control';
import { FilterEditorContainer } from './filter-editor-container';
import { NumericRangeSection } from './sections/numeric-range-section';
import {
  NumericAttributeStats,
  useGetAttributeStats,
} from '@/filters/components/filter-editor-popover/hooks/use-get-attribute-stats';
import { NumericConditionSection } from './sections/numeric-condition-section';
import { useThemeContext } from '@/theme-provider';
import { NotSupportedSection } from '@/filters/components/filter-editor-popover/sections/not-supported-section';
import { useFilterEditorContext } from './filter-editor-context';

enum FilterSections {
  NOT_SUPPORTED = 'not-supported',
  ALL = 'all',
  MEMBERS = 'members',
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

  if (isNumericBetweenFilter(filter)) {
    return FilterSections.RANGE;
  }

  return FilterSections.CONDITION;
};

type FilterEditorNumericalProps = {
  filter: Filter;
  onChange?: (filter: Filter | null) => void;
  showMultiselectToggle?: boolean;
};

/** @internal */
export const FilterEditorNumerical = ({
  filter,
  onChange,
  showMultiselectToggle = true,
}: FilterEditorNumericalProps) => {
  const { themeSettings } = useThemeContext();
  const { defaultDataSource } = useFilterEditorContext();
  const [editedFilter, setEditedFilter] = useState<Filter | null>(filter ?? null);
  const [selectedSection, setSelectedSection] = useState<FilterSections | null>(
    getSelectedSection(editedFilter),
  );
  const [multiSelectEnabled, setMultiSelectEnabled] = useState<boolean>(
    'enableMultiSelection' in filter.config ? filter.config.enableMultiSelection : true,
  );

  const { data: attributeStats } = useGetAttributeStats<NumericAttributeStats>({
    attribute: filter.attribute,
    enabled: !!filter,
    ...(defaultDataSource && { defaultDataSource }),
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
    <FilterEditorContainer theme={themeSettings} aria-label="Filter editor numerical">
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
      <MembersSection
        filter={filter}
        selected={selectedSection === FilterSections.MEMBERS}
        multiSelectEnabled={multiSelectEnabled}
        onChange={handleMembersSectionChange}
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
        selected={selectedSection === FilterSections.CONDITION}
        multiSelectEnabled={multiSelectEnabled}
        onChange={handleConditionSectionChange}
      />
    </FilterEditorContainer>
  );
};
