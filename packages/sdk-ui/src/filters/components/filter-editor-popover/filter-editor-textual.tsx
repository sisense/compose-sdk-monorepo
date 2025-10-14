import { useCallback, useEffect, useState } from 'react';

import Stack from '@mui/material/Stack';
import { Filter } from '@sisense/sdk-data';

import { NotSupportedSection } from '@/filters/components/filter-editor-popover/sections/not-supported-section';
import { useThemeContext } from '@/theme-provider';

import { FilterEditorContainer } from './filter-editor-container';
import { MultiSelectControl } from './multi-select-control';
import { IncludeAllSection } from './sections/include-all-section';
import { MembersSection } from './sections/members-section';
import { TextConditionSection } from './sections/text-condition-section';
import { isIncludeAllFilter, isIncludeMembersFilter, isSupportedByFilterEditor } from './utils';

enum FilterSections {
  NOT_SUPPORTED = 'not-supported',
  ALL = 'all',
  MEMBERS = 'members',
  TEXT_CONDITION = 'text-condition',
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

  return FilterSections.TEXT_CONDITION;
};

type FilterEditorTextualProps = {
  filter: Filter;
  onChange?: (filter: Filter | null) => void;
  showMultiselectToggle?: boolean;
};

/** @internal */
export const FilterEditorTextual = ({
  filter,
  onChange,
  showMultiselectToggle = true,
}: FilterEditorTextualProps) => {
  const { themeSettings } = useThemeContext();
  const [editedFilter, setEditedFilter] = useState<Filter | null>(filter ?? null);
  const [selectedSection, setSelectedSection] = useState<FilterSections | null>(
    getSelectedSection(editedFilter),
  );
  const [multiSelectEnabled, setMultiSelectEnabled] = useState<boolean>(
    'enableMultiSelection' in filter.config ? filter.config.enableMultiSelection : true,
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
    <FilterEditorContainer theme={themeSettings} aria-label="Filter editor textual">
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
      <TextConditionSection
        filter={filter}
        selected={selectedSection === FilterSections.TEXT_CONDITION}
        multiSelectEnabled={multiSelectEnabled}
        onChange={handleTextConditionSectionChange}
      />
    </FilterEditorContainer>
  );
};
