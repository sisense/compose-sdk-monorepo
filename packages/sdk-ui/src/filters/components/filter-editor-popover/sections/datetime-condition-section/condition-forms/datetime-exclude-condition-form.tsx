import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from '@sisense/sdk-common';
import {
  DateLevels,
  DimensionalLevelAttribute,
  Filter,
  filterFactory,
  Sort,
} from '@sisense/sdk-data';
import { SingleSelect } from '../../../common/index.js';
import {
  convertDateToMemberString,
  createLevelAttribute,
  isExcludeMembersFilter,
  isIncludeMembersFilter,
} from '../../../utils.js';
import { SearchableMultiSelect } from '../../../common/select/searchable-multi-select.js';
import { SearchableSingleSelect } from '../../../common/select/searchable-single-select.js';
import { usePrevious } from '@/common/hooks/use-previous.js';
import { useThemeContext } from '@/index-typedoc.js';
import { useDatetimeFormatter } from '../../../hooks/use-datetime-formatter.js';
import { getDefaultDateMask } from '@/query/date-formats/apply-date-format.js';
import {
  CalendarSelect,
  CalendarSelectTypes,
} from '../../../common/select/calendar-select/index.js';
import { DatetimeLimits } from '../../types.js';
import { useGetFilterMembersInternal } from '@/filters/hooks/use-get-filter-members.js';
import { LIST_SCROLL_LOAD_MORE_THRESHOLD, QUERY_MEMBERS_COUNT } from '../../../constants.js';
import { ScrollWrapperOnScrollEvent } from '../../../common/scroll-wrapper.js';
import { isSameAttribute } from '@/utils/filters';
import { createExcludeMembersFilter } from '../../utils.js';
import { granularities } from '../../common/granularities';

function createExcludeConditionFilter(baseFilter: Filter, data: DatetimeConditionFilterData) {
  const { config } = baseFilter;
  const { selectedMembers, multiSelectEnabled, attribute } = data;

  if (selectedMembers?.length) {
    return createExcludeMembersFilter(attribute, selectedMembers, {
      ...config,
      enableMultiSelection: multiSelectEnabled,
    });
  }

  return null;
}

type DatetimeConditionFilterData = {
  selectedMembers: string[];
  attribute: DimensionalLevelAttribute;
  multiSelectEnabled: boolean;
};

function getDatetimeExcludeConditionFilterData(
  filter: Filter,
  t: TFunction,
): Omit<DatetimeConditionFilterData, 'multiSelectEnabled'> {
  const defaultData = {
    selectedMembers: [],
    attribute: createLevelAttribute(
      filter.attribute as DimensionalLevelAttribute,
      DateLevels.Years,
      t,
    ),
  };

  if (isExcludeMembersFilter(filter)) {
    return {
      ...defaultData,
      selectedMembers: filter.members,
      attribute: filter.attribute as DimensionalLevelAttribute,
    };
  }

  return defaultData;
}

type DatetimeConditionSectionFormProps = {
  filter: Filter;
  multiSelectEnabled: boolean;
  limits?: DatetimeLimits;
  onChange: (filter: Filter | null) => void;
};

/** @internal */
export const DatetimeExcludeConditionForm = ({
  filter,
  multiSelectEnabled,
  limits,
  onChange,
}: DatetimeConditionSectionFormProps) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  const initialFilterData = getDatetimeExcludeConditionFilterData(filter, t);
  const [attribute, setAttribute] = useState<DimensionalLevelAttribute>(
    initialFilterData.attribute,
  );
  const [selectedMembers, setSelectedMembers] = useState(initialFilterData.selectedMembers);
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
    enabled: !isDaysLevel,
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

  const multiSelectChanged =
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
    (data: DatetimeConditionFilterData) => {
      const newFilter = createExcludeConditionFilter(filter, data);
      onChange(newFilter);
    },
    [filter, onChange],
  );

  useEffect(() => {
    if (multiSelectChanged) {
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
  }, [selectedMembers, multiSelectEnabled, multiSelectChanged, attribute, prepareAndChangeFilter]);

  const handleMembersChange = useCallback(
    (members: string[] | string) => {
      const newMembers = Array.isArray(members) ? members : [members];
      setSelectedMembers(newMembers);
      prepareAndChangeFilter({
        selectedMembers: newMembers,
        multiSelectEnabled,
        attribute,
      });
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
      prepareAndChangeFilter({
        selectedMembers: [],
        multiSelectEnabled,
        attribute: newAttribute,
      });
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
    <>
      <SingleSelect
        style={{ width: '176px', marginRight: '8px' }}
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
            style={{ width: '152px' }}
            values={selectedMembers}
            placeholder={t('filterEditor.placeholders.selectFromList')}
            items={selectItems}
            onChange={handleMembersChange}
            onListScroll={handleMembersListScroll}
            showListLoader={membersLoading}
            primaryColor={themeSettings.typography.primaryTextColor}
            primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
            showSearch={false}
          />
        )}
        {!multiSelectEnabled && !isDaysLevel && (
          <SearchableSingleSelect<string>
            style={{ width: '152px' }}
            value={selectedMembers[0]}
            placeholder={t('filterEditor.placeholders.selectFromList')}
            items={selectItems}
            onChange={handleMembersChange}
            onListScroll={handleMembersListScroll}
            showListLoader={membersLoading}
            primaryColor={themeSettings.typography.primaryTextColor}
            primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
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
  );
};
