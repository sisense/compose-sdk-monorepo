/* eslint-disable max-lines-per-function */
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import {
  DateLevels,
  DimensionalLevelAttribute,
  Filter,
  isRankingFilter,
  Measure,
} from '@sisense/sdk-data';

import { createLevelAttribute } from '@/shared/utils/create-level-attribute';

import {
  FilterOption,
  filterToOption,
} from '../../../criteria-filter-tile/criteria-filter-operations.js';
import { SingleSelect } from '../../common/index.js';
import { SelectableSection } from '../../common/selectable-section.js';
import { useFilterEditorContext } from '../../filter-editor-context.js';
import {
  isExcludeMembersFilter,
  isRelativeDateFilterWithAnchor,
  isSupportedByFilterEditor,
} from '../../utils.js';
import {
  createRankingFilter,
  DEFAULT_DATETIME_RANKING_COUNT,
  getRankingStateFromFilter,
  isRankingCondition,
  RankingConditionControls,
} from '../ranking-condition/index.js';
import { DatetimeLimits } from '../types.js';
import { DatetimeExcludeConditionForm } from './condition-forms/datetime-exclude-condition-form.js';
import { DatetimeIsWithinConditionForm } from './condition-forms/datetime-is-within-condition-form.js';

const ConditionSelect = styled(SingleSelect<DatetimeConditionType>)<{ $ranking?: boolean }>`
  width: 128px;
  margin-right: ${({ $ranking }) => ($ranking ? '0' : '8px')};
`;

const DatetimeCondition = {
  EXCLUDE: 'exclude',
  IS_WITHIN: 'isWithin',
  TOP: FilterOption.TOP,
  BOTTOM: FilterOption.BOTTOM,
} as const;

type DatetimeConditionType = (typeof DatetimeCondition)[keyof typeof DatetimeCondition];

const membersOnlyConditionItems = [
  { value: DatetimeCondition.EXCLUDE, displayValue: 'filterEditor.conditions.exclude' },
];

const conditionItems = [
  { value: DatetimeCondition.EXCLUDE, displayValue: 'filterEditor.conditions.exclude' },
  { value: DatetimeCondition.IS_WITHIN, displayValue: 'filterEditor.conditions.isWithin' },
  { value: DatetimeCondition.TOP, displayValue: 'filterEditor.conditions.top' },
  { value: DatetimeCondition.BOTTOM, displayValue: 'filterEditor.conditions.bottom' },
];

type DatetimeConditionFilterData = {
  condition: DatetimeConditionType;
  editedFilter: Filter | null;
  rankingCount: number;
  rankingMeasure: Measure | null;
  granularity: string;
};

function getInitialGranularity(filter: Filter): string {
  if (isRankingFilter(filter)) {
    return (filter.attribute as DimensionalLevelAttribute).granularity ?? DateLevels.Years;
  }
  return DateLevels.Years;
}

function getDatetimeConditionFilterData(filter: Filter): DatetimeConditionFilterData {
  const defaultData: DatetimeConditionFilterData = {
    condition: DatetimeCondition.EXCLUDE,
    editedFilter: null,
    rankingCount: DEFAULT_DATETIME_RANKING_COUNT,
    rankingMeasure: null,
    granularity: getInitialGranularity(filter),
  };

  if (isExcludeMembersFilter(filter)) {
    return {
      ...defaultData,
      condition: DatetimeCondition.EXCLUDE,
      editedFilter: filter,
    };
  }

  if (isRelativeDateFilterWithAnchor(filter)) {
    return {
      ...defaultData,
      condition: DatetimeCondition.IS_WITHIN,
      editedFilter: filter,
    };
  }

  if (isRankingFilter(filter) && isSupportedByFilterEditor(filter)) {
    const rankingState = getRankingStateFromFilter(filter);
    return {
      ...defaultData,
      condition: filterToOption(filter) as DatetimeConditionType,
      editedFilter: null,
      rankingCount: rankingState.count,
      rankingMeasure: rankingState.measure,
      granularity: getInitialGranularity(filter),
    };
  }

  return defaultData;
}

type DatetimeConditionSectionProps = {
  filter: Filter;
  selected: boolean;
  multiSelectEnabled: boolean;
  limits?: DatetimeLimits;
  onChange: (filter: Filter | null) => void;
};

/** @internal */
export const DatetimeConditionSection = ({
  filter,
  selected,
  multiSelectEnabled,
  limits,
  onChange,
}: DatetimeConditionSectionProps) => {
  const { t } = useTranslation();
  const { membersOnlyMode } = useFilterEditorContext();
  const initialFilterData = getDatetimeConditionFilterData(filter);
  const [condition, setCondition] = useState<DatetimeConditionType>(initialFilterData.condition);
  const [editedFilter, setEditedFilter] = useState<Filter | null>(initialFilterData.editedFilter);
  const [rankingCount, setRankingCount] = useState(initialFilterData.rankingCount);
  const [rankingMeasure, setRankingMeasure] = useState<Measure | null>(
    initialFilterData.rankingMeasure,
  );
  const [granularity, setGranularity] = useState(initialFilterData.granularity);
  const conditionItemsToUse = membersOnlyMode ? membersOnlyConditionItems : conditionItems;
  const translatedConditionItems = useMemo(
    () =>
      conditionItemsToUse.map((item) => ({
        ...item,
        displayValue: t(item.displayValue),
      })),
    [t, conditionItemsToUse],
  );

  const showRankingControls = isRankingCondition(condition);

  const buildRankingFilter = useCallback(
    (
      rankingCondition: DatetimeConditionType,
      count: number,
      measure: Measure | null,
      level: string,
    ) => {
      if (!isRankingCondition(rankingCondition)) {
        return null;
      }

      const levelAttribute = createLevelAttribute(
        filter.attribute as DimensionalLevelAttribute,
        level,
        t,
      );

      return createRankingFilter(filter, rankingCondition, count, measure, levelAttribute);
    },
    [filter, t],
  );

  const handleSectionSelect = useCallback(() => {
    if (showRankingControls) {
      onChange(buildRankingFilter(condition, rankingCount, rankingMeasure, granularity));
      return;
    }
    onChange(editedFilter);
  }, [
    showRankingControls,
    buildRankingFilter,
    condition,
    rankingCount,
    rankingMeasure,
    granularity,
    editedFilter,
    onChange,
  ]);

  const handleConditionChange = useCallback(
    (newCondition: DatetimeConditionType) => {
      setCondition(newCondition);

      if (isRankingCondition(newCondition) && !isRankingCondition(condition)) {
        setRankingCount(DEFAULT_DATETIME_RANKING_COUNT);
        setRankingMeasure(null);
        onChange(null);
        return;
      }

      if (isRankingCondition(newCondition)) {
        onChange(buildRankingFilter(newCondition, rankingCount, rankingMeasure, granularity));
        return;
      }

      onChange(editedFilter);
    },
    [
      condition,
      editedFilter,
      onChange,
      buildRankingFilter,
      rankingCount,
      rankingMeasure,
      granularity,
    ],
  );

  const handleFilterChange = useCallback(
    (newFilter: Filter | null) => {
      setEditedFilter(newFilter);
      onChange(newFilter);
    },
    [onChange],
  );

  const handleRankingCountChange = useCallback(
    (count: number) => {
      setRankingCount(count);
      onChange(buildRankingFilter(condition, count, rankingMeasure, granularity));
    },
    [buildRankingFilter, condition, rankingMeasure, granularity, onChange],
  );

  const handleRankingMeasureChange = useCallback(
    (measure: Measure) => {
      setRankingMeasure(measure);
      onChange(buildRankingFilter(condition, rankingCount, measure, granularity));
    },
    [buildRankingFilter, condition, rankingCount, granularity, onChange],
  );

  const handleDateLevelChange = useCallback(
    (level: string) => {
      setGranularity(level);
      onChange(buildRankingFilter(condition, rankingCount, rankingMeasure, level));
    },
    [buildRankingFilter, condition, rankingCount, rankingMeasure, onChange],
  );

  return (
    <SelectableSection
      selected={selected}
      onSelect={handleSectionSelect}
      aria-label="Datetime condition section"
    >
      <ConditionSelect
        $ranking={showRankingControls}
        value={condition}
        items={translatedConditionItems}
        onChange={handleConditionChange}
        aria-label="Condition select"
      />
      {condition === DatetimeCondition.EXCLUDE && (
        <DatetimeExcludeConditionForm
          filter={filter}
          multiSelectEnabled={multiSelectEnabled}
          limits={limits}
          onChange={handleFilterChange}
        />
      )}
      {condition === DatetimeCondition.IS_WITHIN && (
        <DatetimeIsWithinConditionForm
          filter={filter}
          limits={limits}
          onChange={handleFilterChange}
        />
      )}
      {showRankingControls && (
        <RankingConditionControls
          count={rankingCount}
          measure={rankingMeasure}
          onCountChange={handleRankingCountChange}
          onMeasureChange={handleRankingMeasureChange}
          showDateLevel
          dateLevel={granularity}
          onDateLevelChange={handleDateLevelChange}
        />
      )}
    </SelectableSection>
  );
};
