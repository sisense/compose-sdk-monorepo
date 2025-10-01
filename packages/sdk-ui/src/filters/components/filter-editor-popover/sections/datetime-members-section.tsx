import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectableSection } from '../common/selectable-section';
import { SearchableMultiSelect } from '../common/select/searchable-multi-select';
import {
  Attribute,
  CompleteMembersFilterConfig,
  DateLevels,
  DimensionalLevelAttribute,
  Filter,
  FilterConfig,
  filterFactory,
  Sort,
} from '@ethings-os/sdk-data';
import { convertDateToMemberString, isIncludeMembersFilter } from '../utils';
import { SearchableSingleSelect } from '../common/select/searchable-single-select';
import { usePrevious } from '@/common/hooks/use-previous';
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
import { useFilterEditorContext } from '../filter-editor-context';
import {
  getConfigWithUpdatedDeactivated,
  getMembersWithDeactivated,
  getMembersWithoutDeactivated,
  getRestrictedGranularities,
} from './utils';
import { createLevelAttribute } from '@/utils/create-level-attribute';

function createMembersFilter(attribute: Attribute, members: string[], config?: FilterConfig) {
  return members.length || (config as CompleteMembersFilterConfig)?.deactivatedMembers?.length
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
  const { filter, selected, multiSelectEnabled, limits, onChange } = props;
  const { t } = useTranslation();
  const { defaultDataSource, parentFilters } = useFilterEditorContext();
  const isIncludeFilter = isIncludeMembersFilter(filter);

  const [attribute, setAttribute] = useState<DimensionalLevelAttribute>(
    isIncludeFilter
      ? (filter.attribute as DimensionalLevelAttribute)
      : createLevelAttribute(filter.attribute as DimensionalLevelAttribute, DateLevels.Years, t),
  );

  const members = useMemo(
    () => (isIncludeFilter ? getMembersWithDeactivated(filter) : []),
    [isIncludeFilter, filter],
  );
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
    count: QUERY_MEMBERS_COUNT,
    parentFilters,
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
  const isMultiSelectChanged =
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
    ({ selectedMembers, multiSelectEnabled, attribute }: MembersFilterData) => {
      const config = getConfigWithUpdatedDeactivated(filter, selectedMembers);
      const members = getMembersWithoutDeactivated(filter, selectedMembers);
      const newFilter = createMembersFilter(attribute, members, {
        ...config,
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
            aria-label="Condition select"
          />
          <>
            {multiSelectEnabled && !isDaysLevel && (
              <SearchableMultiSelect<string>
                width={150}
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
                width={150}
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
      )}
    </SelectableSection>
  );
};
