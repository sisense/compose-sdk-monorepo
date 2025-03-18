import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectableSection } from '../common/selectable-section';
import { SearchableMultiSelect } from '../common/select/searchable-multi-select';
import {
  Attribute,
  DateLevels,
  DimensionalLevelAttribute,
  Filter,
  FilterConfig,
  filterFactory,
  Sort,
} from '@sisense/sdk-data';
import { convertDateToMemberString, createLevelAttribute, isIncludeMembersFilter } from '../utils';
import { SearchableSingleSelect } from '../common/select/searchable-single-select';
import { usePrevious } from '@/common/hooks/use-previous';
import { useThemeContext } from '@/theme-provider';
import { SingleSelect } from '../common';
import { useDatetimeFormatter } from '../hooks/use-datetime-formatter';
import { getDefaultDateMask } from '@/query/date-formats/apply-date-format';
import { useGetFilterMembersInternal } from '@/filters/hooks/use-get-filter-members';
import { LIST_SCROLL_LOAD_MORE_THRESHOLD, QUERY_MEMBERS_COUNT } from '../constants';
import { ScrollWrapperOnScrollEvent } from '../common/scroll-wrapper';
import { isSameAttribute } from '@/utils/filters';
import { CalendarSelect, CalendarSelectTypes } from '../common/select/calendar-select';
import { DatetimeLimits } from './types';
import { granularities } from './common/granularities';

function createMembersFilter(attribute: Attribute, members: string[], config?: FilterConfig) {
  return members.length
    ? filterFactory.members(attribute, members, { ...config, excludeMembers: false })
    : null;
}

type MembersFilterData = {
  selectedMembers: string[];
  multiSelectEnabled: boolean;
  attribute: DimensionalLevelAttribute;
};

type DatetimeMembersSectionProps = {
  filter: Filter;
  selected: boolean;
  multiSelectEnabled: boolean;
  limits?: DatetimeLimits;
  onChange: (filter: Filter | null) => void;
};

/** @internal */
export const DatetimeMembersSection = (props: DatetimeMembersSectionProps) => {
  const { themeSettings } = useThemeContext();
  const { filter, selected, multiSelectEnabled, limits, onChange } = props;
  const { t } = useTranslation();
  const [attribute, setAttribute] = useState<DimensionalLevelAttribute>(
    filter.attribute as DimensionalLevelAttribute,
  );
  const [selectedMembers, setSelectedMembers] = useState(
    isIncludeMembersFilter(filter) ? filter.members : [],
  );
  const prevMultiSelectEnabled = usePrevious(multiSelectEnabled);
  const formatter = useDatetimeFormatter();
  const isDaysLevel = attribute.granularity === DateLevels.Days;
  const filterToQueryMembers = useMemo(
    () => filterFactory.members(attribute.sort(Sort.Descending), []),
    [attribute],
  );
  const {
    data: membersData,
    isLoading: membersLoading,
    loadMore: loadMoreMembers,
  } = useGetFilterMembersInternal({
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

  const selectItems = useMemo(() => {
    let allMembers = (membersData?.allMembers || []).map(({ key, title }) => ({
      value: key,
      displayValue: title,
    }));
    if (
      isIncludeMembersFilter(filter) &&
      isSameAttribute(filter.attribute, attribute) &&
      filter.members.length
    ) {
      const selectedMembers = multiSelectEnabled ? filter.members : [filter.members[0]];
      allMembers = [
        ...selectedMembers.map((member) => ({
          value: member,
          displayValue: formatter(member, getDefaultDateMask(attribute.granularity)),
        })),
        ...allMembers.filter((member) => !selectedMembers.includes(member.value)),
      ];
    }
    return allMembers;
  }, [multiSelectEnabled, membersData, filter, attribute, formatter]);

  const isMultiSelectChanged =
    typeof prevMultiSelectEnabled !== 'undefined' && prevMultiSelectEnabled !== multiSelectEnabled;
  const translatedGranularities = useMemo(
    () =>
      granularities.map((granularity) => ({
        value: granularity.value,
        displayValue: t(granularity.displayValue),
      })),
    [t],
  );

  const prepareAndChangeFilter = useCallback(
    ({ selectedMembers, multiSelectEnabled, attribute }: MembersFilterData) => {
      const newFilter = createMembersFilter(attribute, selectedMembers, {
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

      prepareAndChangeFilter({
        selectedMembers: newSelectedMembers,
        multiSelectEnabled,
        attribute,
      });
    }
  }, [
    isMultiSelectChanged,
    multiSelectEnabled,
    selectedMembers,
    attribute,
    selected,
    prepareAndChangeFilter,
  ]);

  const handleSectionSelect = useCallback(() => {
    prepareAndChangeFilter({ selectedMembers, multiSelectEnabled, attribute });
  }, [selectedMembers, multiSelectEnabled, attribute, prepareAndChangeFilter]);

  const handleMembersChange = useCallback(
    (members: string[] | string) => {
      const newMembers = Array.isArray(members) ? members : [members];
      setSelectedMembers(newMembers);
      prepareAndChangeFilter({ selectedMembers: newMembers, multiSelectEnabled, attribute });
    },
    [multiSelectEnabled, attribute, prepareAndChangeFilter],
  );

  const handleDaysMembersChange = useCallback(
    (dateMembers: Date[]) => {
      const members = dateMembers.map((date) => convertDateToMemberString(date));
      handleMembersChange(members);
    },
    [handleMembersChange],
  );

  const handleGranularityChange = useCallback(
    (granularity: string) => {
      const newAttribute = createLevelAttribute(attribute, granularity, t);
      setAttribute(newAttribute);
      setSelectedMembers([]);
      prepareAndChangeFilter({ selectedMembers: [], multiSelectEnabled, attribute: newAttribute });
    },
    [multiSelectEnabled, attribute, prepareAndChangeFilter, t],
  );

  const selectedDaysMembers = useMemo(() => {
    return isDaysLevel ? selectedMembers.map((member) => new Date(member)) : undefined;
  }, [selectedMembers, isDaysLevel]);

  const normalizedLimits = useMemo(() => {
    return limits
      ? {
          minDate: limits.minDate ? new Date(limits.minDate) : undefined,
          maxDate: limits.maxDate ? new Date(limits.maxDate) : undefined,
        }
      : undefined;
  }, [limits]);

  return (
    <SelectableSection
      selected={selected}
      onSelect={handleSectionSelect}
      aria-label="Members section"
    >
      {() => (
        <>
          <SingleSelect
            style={{ width: '168px', marginRight: '8px' }}
            value={attribute.granularity}
            items={translatedGranularities}
            onChange={handleGranularityChange}
            primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
            primaryColor={themeSettings.typography.primaryTextColor}
            aria-label="Condition select"
          />
          <>
            {multiSelectEnabled && !isDaysLevel && (
              <SearchableMultiSelect<string>
                style={{ width: '150px' }}
                values={selectedMembers}
                placeholder={t('filterEditor.placeholders.selectFromList')}
                items={selectItems}
                onChange={handleMembersChange}
                onListScroll={handleMembersListScroll}
                showListLoader={membersLoading}
                primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
                primaryColor={themeSettings.typography.primaryTextColor}
                showSearch={false}
              />
            )}
            {!multiSelectEnabled && !isDaysLevel && (
              <SearchableSingleSelect<string>
                style={{ width: '150px' }}
                value={selectedMembers[0]}
                placeholder={t('filterEditor.placeholders.selectFromList')}
                items={selectItems}
                onChange={handleMembersChange}
                onListScroll={handleMembersListScroll}
                showListLoader={membersLoading}
                primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
                primaryColor={themeSettings.typography.primaryTextColor}
                showSearch={false}
              />
            )}
            {isDaysLevel && (
              <CalendarSelect
                style={{ width: '152px' }}
                type={CalendarSelectTypes.MULTI_SELECT}
                value={selectedDaysMembers}
                limits={normalizedLimits}
                onChange={handleDaysMembersChange}
                placeholder={t('filterEditor.placeholders.select')}
                primaryColor={themeSettings.typography.primaryTextColor}
                primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
              />
            )}
          </>
        </>
      )}
    </SelectableSection>
  );
};
