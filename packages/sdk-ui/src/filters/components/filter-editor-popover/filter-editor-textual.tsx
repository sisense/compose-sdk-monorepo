import { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import { Filter } from '@sisense/sdk-data';
import { IncludeAllSection } from './sections/include-all-section';
import { MembersSection } from './sections/members-section';
import { TextConditionSection } from './sections/text-condition-section';
import { isIncludeAllFilter, isIncludeMembersFilter } from './utils';
import { MultiSelectControl } from './multi-select-control';
import { FilterEditorContainer } from './filter-editor-container';
import { useThemeContext } from '@/theme-provider';

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
