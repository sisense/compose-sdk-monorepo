import {
  SearchableMultiSelect,
  SearchableSingleSelect,
} from '@/filters/components/filter-editor-popover/common';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGetFilterMembers } from '@/filters';
import { Attribute, filterFactory } from '@sisense/sdk-data';
import { useTranslation } from 'react-i18next';
import { ScrollWrapperOnScrollEvent } from '@/filters/components/filter-editor-popover/common/scroll-wrapper';
import debounce from 'lodash-es/debounce';
import { useFilterEditorContext } from '../../filter-editor-context';

type MembersListSelectProps = {
  attribute: Attribute;
  selectedMembers: string[];
  onChange: (values: string[]) => void;
  multiSelect?: boolean;
  showSearch?: boolean;
  width?: number | string;
};

const QUERY_MEMBERS_COUNT = 50;
const SEARCH_VALUE_UPDATE_DELAY = 300;
const LIST_SCROLL_LOAD_MORE_THRESHOLD = 0.75;

export const MembersListSelect = ({
  attribute,
  multiSelect = true,
  onChange,
  selectedMembers,
  showSearch = true,
  width = '100%',
}: MembersListSelectProps) => {
  const { t } = useTranslation();
  const { defaultDataSource } = useFilterEditorContext();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSetSearchValue = useMemo(
    () => debounce(setSearchValue, SEARCH_VALUE_UPDATE_DELAY),
    [setSearchValue],
  );
  const [initialSelectedMembers, setInitialSelectedMembers] = useState<string[]>(selectedMembers);

  const {
    data: membersData,
    isLoading: membersLoading,
    loadMore: loadMoreMembers,
  } = useGetFilterMembers({
    parentFilters: useMemo(
      () => [filterFactory.contains(attribute, searchValue)],
      [attribute, searchValue],
    ),
    filter: useMemo(() => filterFactory.members(attribute, []), [attribute]),
    count: QUERY_MEMBERS_COUNT,
    ...(defaultDataSource && { defaultDataSource }),
  });

  const selectItems = useMemo(() => {
    const allMembers = membersData?.allMembers.map((member) => ({ value: member.key })) || [];
    return [
      ...initialSelectedMembers
        .map((member) => ({ value: member }))
        .filter((m) => m.value.toLowerCase().includes(searchValue.toLowerCase())),
      ...allMembers.filter((member) => !initialSelectedMembers.includes(member.value)),
    ];
  }, [initialSelectedMembers, membersData, searchValue]);

  const handleMembersListScroll = useCallback(
    ({ top, direction }: ScrollWrapperOnScrollEvent) => {
      if (!membersLoading && top > LIST_SCROLL_LOAD_MORE_THRESHOLD && direction === 'down') {
        loadMoreMembers(QUERY_MEMBERS_COUNT);
      }
    },
    [loadMoreMembers, membersLoading],
  );

  const prevAttributeRef = useRef(attribute);
  useEffect(() => {
    if (prevAttributeRef.current !== attribute) {
      prevAttributeRef.current = attribute;
      setInitialSelectedMembers(selectedMembers);
    }
  }, [attribute, selectedMembers]);

  return multiSelect ? (
    <SearchableMultiSelect<string>
      width={width}
      values={selectedMembers}
      placeholder={t('filterEditor.placeholders.selectFromList')}
      items={selectItems}
      onChange={onChange}
      onListScroll={handleMembersListScroll}
      showListLoader={membersLoading}
      showSearch={showSearch}
      onSearchUpdate={debouncedSetSearchValue}
    />
  ) : (
    <SearchableSingleSelect<string>
      width={width}
      value={selectedMembers[0]}
      placeholder={t('filterEditor.placeholders.selectFromList')}
      items={selectItems}
      onChange={(value) => onChange([value])}
      onListScroll={handleMembersListScroll}
      showListLoader={membersLoading}
      showSearch={showSearch}
      onSearchUpdate={debouncedSetSearchValue}
    />
  );
};
