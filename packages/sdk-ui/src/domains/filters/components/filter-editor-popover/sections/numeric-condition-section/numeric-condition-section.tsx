import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Filter, Measure } from '@sisense/sdk-data';

import { MembersListSelect } from '@/domains/filters/components/filter-editor-popover/common/select/members-list-select';
import { usePrevious } from '@/shared/hooks/use-previous.js';
import { useWasModified } from '@/shared/hooks/use-was-modified.js';

import {
  EqualIcon,
  GreaterThanIcon,
  GreaterThanOrEqualIcon,
  NotEqualIcon,
  SmallerThanIcon,
  SmallerThanOrEqualIcon,
} from '../../../icons';
import { Input, SingleSelect } from '../../common/index.js';
import { SelectableSection } from '../../common/selectable-section.js';
import { useFilterEditorContext } from '../../filter-editor-context';
import { isExcludeMembersFilter } from '../../utils.js';
import {
  DEFAULT_RANKING_COUNT,
  getRankingStateFromFilter,
  isRankingCondition,
  RankingConditionControls,
} from '../ranking-condition/index.js';
import { getMembersWithDeactivated } from '../utils.js';
import { NumericCondition, NumericConditionFilterData, NumericConditionType } from './types.js';
import {
  createConditionalFilter,
  getNumericFilterCondition,
  getNumericFilterValue,
  validateInputValue,
} from './utils.js';

const membersOnlyConditionItems = [
  { value: NumericCondition.EXCLUDE, displayValue: 'filterEditor.conditions.exclude' },
];

const conditionItems = [
  { value: NumericCondition.EXCLUDE, displayValue: 'filterEditor.conditions.exclude' },
  {
    value: NumericCondition.EQUALS,
    displayValue: 'filterEditor.conditions.equals',
    icon: <EqualIcon />,
  },
  {
    value: NumericCondition.NOT_EQUALS,
    displayValue: 'filterEditor.conditions.notEquals',
    icon: <NotEqualIcon />,
  },
  {
    value: NumericCondition.LESS_THAN,
    displayValue: 'filterEditor.conditions.lessThan',
    icon: <SmallerThanIcon />,
  },
  {
    value: NumericCondition.LESS_THAN_OR_EQUAL,
    displayValue: 'filterEditor.conditions.lessThanOrEqual',
    icon: <SmallerThanOrEqualIcon />,
  },
  {
    value: NumericCondition.GREATER_THAN,
    displayValue: 'filterEditor.conditions.greaterThan',
    icon: <GreaterThanIcon />,
  },
  {
    value: NumericCondition.GREATER_THAN_OR_EQUAL,
    displayValue: 'filterEditor.conditions.greaterThanOrEqual',
    icon: <GreaterThanOrEqualIcon />,
  },
  { value: NumericCondition.TOP, displayValue: 'filterEditor.conditions.top' },
  { value: NumericCondition.BOTTOM, displayValue: 'filterEditor.conditions.bottom' },
];

type NumericConditionSectionProps = {
  filter: Filter;
  selected: boolean;
  multiSelectEnabled: boolean;
  onChange: (filter: Filter | null) => void;
};

/** @internal */
export const NumericConditionSection = ({
  filter,
  selected,
  multiSelectEnabled,
  onChange,
}: NumericConditionSectionProps) => {
  const { t } = useTranslation();
  const { membersOnlyMode } = useFilterEditorContext();
  const [condition, setCondition] = useState<NumericConditionType>(
    getNumericFilterCondition(filter, conditionItems[0].value),
  );
  const [value, setValue] = useState(getNumericFilterValue(filter));
  const [selectedMembers, setSelectedMembers] = useState(
    isExcludeMembersFilter(filter) ? getMembersWithDeactivated(filter) : [],
  );
  const initialRankingState = getRankingStateFromFilter(filter);
  const [rankingCount, setRankingCount] = useState(initialRankingState.count);
  const [rankingMeasure, setRankingMeasure] = useState<Measure | null>(initialRankingState.measure);
  const isValueWasModified = useWasModified(value, '');
  const prevMultiSelectEnabled = usePrevious(multiSelectEnabled);

  const multiSelectChanged =
    typeof prevMultiSelectEnabled !== 'undefined' && prevMultiSelectEnabled !== multiSelectEnabled;

  const conditionItemsToUse = membersOnlyMode ? membersOnlyConditionItems : conditionItems;
  const translatedConditionItems = useMemo(
    () =>
      conditionItemsToUse.map((item) => ({
        ...item,
        displayValue: t(item.displayValue),
      })),
    [t, conditionItemsToUse],
  );

  const showInput = useMemo(
    () =>
      (
        [
          NumericCondition.EQUALS,
          NumericCondition.NOT_EQUALS,
          NumericCondition.LESS_THAN,
          NumericCondition.LESS_THAN_OR_EQUAL,
          NumericCondition.GREATER_THAN,
          NumericCondition.GREATER_THAN_OR_EQUAL,
        ] as NumericConditionType[]
      ).includes(condition),
    [condition],
  );

  const showRankingControls = isRankingCondition(condition);

  const prepareAndChangeFilter = useCallback(
    (data: NumericConditionFilterData) => {
      const newFilter = createConditionalFilter(filter, data);
      onChange(newFilter);
    },
    [filter, onChange],
  );

  useEffect(() => {
    if (multiSelectChanged && selected) {
      let newSelectedMembers = selectedMembers;

      if (!multiSelectEnabled) {
        if (selectedMembers.length > 1) {
          newSelectedMembers = [selectedMembers.sort()[0]];
        }
        setSelectedMembers(newSelectedMembers);
      }

      prepareAndChangeFilter({
        condition,
        value,
        selectedMembers: newSelectedMembers,
        multiSelectEnabled,
        rankingCount,
        rankingMeasure,
      });
    }
  }, [
    condition,
    value,
    selectedMembers,
    multiSelectEnabled,
    rankingCount,
    rankingMeasure,
    multiSelectChanged,
    selected,
    prepareAndChangeFilter,
  ]);

  const handleSectionSelect = useCallback(() => {
    prepareAndChangeFilter({
      condition,
      value,
      selectedMembers,
      multiSelectEnabled,
      rankingCount,
      rankingMeasure,
    });
  }, [
    condition,
    value,
    selectedMembers,
    multiSelectEnabled,
    rankingCount,
    rankingMeasure,
    prepareAndChangeFilter,
  ]);

  const handleMembersChange = useCallback(
    (members: string[] | string) => {
      const newMembers = Array.isArray(members) ? members : [members];
      setSelectedMembers(newMembers);
      prepareAndChangeFilter({
        condition,
        value,
        selectedMembers: newMembers,
        multiSelectEnabled,
        rankingCount,
        rankingMeasure,
      });
    },
    [condition, value, multiSelectEnabled, rankingCount, rankingMeasure, prepareAndChangeFilter],
  );

  const handleConditionChange = useCallback(
    (newCondition: NumericConditionType) => {
      setCondition(newCondition);

      let nextRankingCount = rankingCount;
      let nextRankingMeasure = rankingMeasure;
      if (isRankingCondition(newCondition) && !isRankingCondition(condition)) {
        nextRankingCount = DEFAULT_RANKING_COUNT;
        nextRankingMeasure = null;
        setRankingCount(nextRankingCount);
        setRankingMeasure(nextRankingMeasure);
      }

      prepareAndChangeFilter({
        condition: newCondition,
        value,
        selectedMembers,
        multiSelectEnabled,
        rankingCount: nextRankingCount,
        rankingMeasure: nextRankingMeasure,
      });
    },
    [
      value,
      selectedMembers,
      multiSelectEnabled,
      rankingCount,
      rankingMeasure,
      condition,
      prepareAndChangeFilter,
    ],
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      prepareAndChangeFilter({
        condition,
        value: newValue,
        selectedMembers,
        multiSelectEnabled,
        rankingCount,
        rankingMeasure,
      });
    },
    [
      condition,
      selectedMembers,
      multiSelectEnabled,
      rankingCount,
      rankingMeasure,
      prepareAndChangeFilter,
    ],
  );

  const handleRankingCountChange = useCallback(
    (count: number) => {
      setRankingCount(count);
      prepareAndChangeFilter({
        condition,
        value,
        selectedMembers,
        multiSelectEnabled,
        rankingCount: count,
        rankingMeasure,
      });
    },
    [condition, value, selectedMembers, multiSelectEnabled, rankingMeasure, prepareAndChangeFilter],
  );

  const handleRankingMeasureChange = useCallback(
    (measure: Measure) => {
      setRankingMeasure(measure);
      prepareAndChangeFilter({
        condition,
        value,
        selectedMembers,
        multiSelectEnabled,
        rankingCount,
        rankingMeasure: measure,
      });
    },
    [condition, value, selectedMembers, multiSelectEnabled, rankingCount, prepareAndChangeFilter],
  );

  return (
    <SelectableSection
      selected={selected}
      onSelect={handleSectionSelect}
      aria-label="Numeric condition section"
    >
      <SingleSelect
        style={{ width: '210px', marginRight: showRankingControls ? '0' : '8px' }}
        value={condition}
        items={translatedConditionItems}
        onChange={handleConditionChange}
        aria-label="Condition select"
      />
      {showInput && (
        <Input
          style={{
            width: '136px',
          }}
          placeholder={t('filterEditor.placeholders.enterEntry')}
          value={value}
          onChange={handleValueChange}
          error={isValueWasModified && validateInputValue(value, t)}
          aria-label="Value input"
        />
      )}
      {showRankingControls && (
        <RankingConditionControls
          count={rankingCount}
          measure={rankingMeasure}
          onCountChange={handleRankingCountChange}
          onMeasureChange={handleRankingMeasureChange}
        />
      )}
      {condition === NumericCondition.EXCLUDE && (
        <MembersListSelect
          width={240}
          attribute={filter.attribute}
          multiSelect={multiSelectEnabled}
          selectedMembers={selectedMembers}
          onChange={handleMembersChange}
        />
      )}
    </SelectableSection>
  );
};
