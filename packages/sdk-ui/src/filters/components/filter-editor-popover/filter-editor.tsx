import { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import styled from '@emotion/styled';
import { Attribute, Filter, convertDataSource } from '@sisense/sdk-data';
import { HookEnableParam } from '@/common/hooks/types';
import { IncludeAllSection } from './sections/include-all-section';
import { MembersSection } from './sections/members-section';
import { TextConditionSection } from './sections/text-condition-section';
import { useExecuteQueryInternal } from '@/query-execution/use-execute-query';
import { isIncludeAllFilter, isIncludeMembersFilter } from './utils';
import { MultiSelectControl } from './multi-select-control';
import { useThemeContext } from '@/theme-provider';

const FilterEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 16px 16px 40px;
  justify-content: space-around;
  align-items: stretch;
  font-size: 13px;
`;

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

interface UseGetMembersParams extends HookEnableParam {
  attribute: Attribute;
  count?: number;
}

type MembersData = {
  members: string[];
  total: number;
};

type MembersState = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | undefined;
  data: MembersData | undefined;
};

// todo: migrate to a recently added useGetFilterMembers hook
const useGetMembers = (params: UseGetMembersParams): MembersState => {
  const { attribute, count = 50, enabled } = params;
  const {
    data: queryResult,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useExecuteQueryInternal({
    dataSource: attribute.dataSource && convertDataSource(attribute.dataSource),
    dimensions: [attribute],
    count,
    enabled,
  });

  return {
    isLoading,
    isError,
    isSuccess,
    error,
    data: queryResult
      ? {
          members: queryResult.rows.map((row) => row[0].data),
          total: queryResult.rows.length,
        }
      : undefined,
  };
};

type FilterEditorProps = {
  filter: Filter;
  onChange?: (filter: Filter | null) => void;
};

/** @internal */
export const FilterEditor = ({ filter, onChange }: FilterEditorProps) => {
  const { themeSettings } = useThemeContext();
  const [editedFilter, setEditedFilter] = useState<Filter | null>(filter ?? null);
  const [selectedSection, setSelectedSection] = useState<FilterSections | null>(
    getSelectedSection(editedFilter),
  );
  const [multiSelectEnabled, setMultiSelectEnabled] = useState<boolean>(
    'enableMultiSelection' in filter.config ? filter.config.enableMultiSelection : true,
  );
  const { data: membersData } = useGetMembers({
    attribute: filter.attribute,
    count: 50,
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

  const handleTextConditionSectionChange = useCallback((newFilter: Filter | null) => {
    setEditedFilter(newFilter);
    setSelectedSection(FilterSections.TEXT_CONDITION);
  }, []);

  return (
    <FilterEditorContainer
      style={{
        color: themeSettings.typography.primaryTextColor,
      }}
      aria-label="Filter editor"
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
        members={membersData?.members || []}
        selected={selectedSection === FilterSections.MEMBERS}
        multiSelectEnabled={multiSelectEnabled}
        onChange={handleMembersSectionChange}
      />
      <TextConditionSection
        filter={filter}
        members={membersData?.members || []}
        selected={selectedSection === FilterSections.TEXT_CONDITION}
        multiSelectEnabled={multiSelectEnabled}
        onChange={handleTextConditionSectionChange}
      />
    </FilterEditorContainer>
  );
};
