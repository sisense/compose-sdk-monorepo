import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from '@ethings-os/sdk-common';
import {
  DateLevels,
  DimensionalLevelAttribute,
  Filter,
  filterFactory,
  Sort,
} from '@ethings-os/sdk-data';
import { SingleSelect } from '../../../common/index.js';
import {
  convertDateToMemberString,
  isExcludeMembersFilter,
  isIncludeMembersFilter,
} from '../../../utils.js';
import { SearchableMultiSelect } from '../../../common/select/searchable-multi-select.js';
import { SearchableSingleSelect } from '../../../common/select/searchable-single-select.js';
import { usePrevious } from '@/common/hooks/use-previous.js';
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
import {
  createExcludeMembersFilter,
  getConfigWithUpdatedDeactivated,
  getMembersWithDeactivated,
  getRestrictedGranularities,
} from '../../utils.js';
import { granularities } from '../../common/granularities';
import { useFilterEditorContext } from '../../../filter-editor-context';
import { createLevelAttribute } from '@/utils/create-level-attribute.js';

function createExcludeConditionFilter(baseFilter: Filter, data: DatetimeConditionFilterData) {
  const { selectedMembers, multiSelectEnabled, attribute } = data;
  const config = getConfigWithUpdatedDeactivated(baseFilter, selectedMembers);
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
  shouldMatchFilterGranularity = false,
): Omit<DatetimeConditionFilterData, 'multiSelectEnabled'> {
  const defaultData = {
    selectedMembers: [],
    attribute: shouldMatchFilterGranularity
      ? (filter.attribute as DimensionalLevelAttribute)
      : createLevelAttribute(filter.attribute as DimensionalLevelAttribute, DateLevels.Years, t),
  };

  if (isExcludeMembersFilter(filter)) {
    return {
      ...defaultData,
      selectedMembers: getMembersWithDeactivated(filter),
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
  const { t } = useTranslation();
  const { defaultDataSource, parentFilters } = useFilterEditorContext();
  const initialFilterData = useMemo(
    () => getDatetimeExcludeConditionFilterData(filter, t, !!parentFilters?.length),
    [filter, parentFilters, t],
  );
  const [attribute, setAttribute] = useState<DimensionalLevelAttribute>(
    initialFilterData.attribute,
  );
  const members = initialFilterData.selectedMembers;

  const [selectedMembers, setSelectedMembers] = useState(members);
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
    parentFilters,
    count: QUERY_MEMBERS_COUNT,
    enabled: !isDaysLevel,
    ...(defaultDataSource && { defaultDataSource }),
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
      members.length
    ) {
      const selectedMembers = multiSelectEnabled ? members : [members[0]];
      allMembers = [
        ...selectedMembers.map((member) => ({
          value: member,
          displayValue: formatter(member, getDefaultDateMask(attribute.granularity)),
        })),
        ...allMembers.filter((member) => !selectedMembers.includes(member.value)),
      ];
    }
    return allMembers;
  }, [multiSelectEnabled, membersData, filter, attribute, formatter, members]);

  const multiSelectChanged =
    typeof prevMultiSelectEnabled !== 'undefined' && prevMultiSelectEnabled !== multiSelectEnabled;
  const translatedGranularities = useMemo(() => {
    const restrictedGranularities = getRestrictedGranularities(filter.attribute, parentFilters);

    return granularities
      .filter((granularity) => !restrictedGranularities.includes(granularity.value))
      .map((granularity) => ({
        value: granularity.value,
        displayValue: t(granularity.displayValue),
      }));
  }, [parentFilters, filter.attribute, t]);

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
        aria-label="Condition select"
      />
      <>
        {multiSelectEnabled && !isDaysLevel && (
          <SearchableMultiSelect<string>
            width={152}
            values={selectedMembers}
            placeholder={t('filterEditor.placeholders.selectFromList')}
            items={selectItems}
            onChange={handleMembersChange}
            onListScroll={handleMembersListScroll}
            showListLoader={membersLoading}
            showSearch={false}
          />
        )}
        {!multiSelectEnabled && !isDaysLevel && (
          <SearchableSingleSelect<string>
            width={152}
            value={selectedMembers[0]}
            placeholder={t('filterEditor.placeholders.selectFromList')}
            items={selectItems}
            onChange={handleMembersChange}
            onListScroll={handleMembersListScroll}
            showListLoader={membersLoading}
            showSearch={false}
          />
        )}
        {isDaysLevel && (
          <CalendarSelect
            width={152}
            type={CalendarSelectTypes.MULTI_SELECT}
            value={selectedDaysMembers}
            limits={normalizedLimits}
            onChange={handleDaysMembersChange}
            placeholder={t('filterEditor.placeholders.select')}
          />
        )}
      </>
    </>
  );
};
