import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from '@sisense/sdk-data';
import { SelectableSection } from '../../common/selectable-section.js';
import { Input, SingleSelect } from '../../common/index.js';
import { isExcludeMembersFilter } from '../../utils.js';
import { usePrevious } from '@/common/hooks/use-previous.js';
import {
  EqualIcon,
  NotEqualIcon,
  SmallerThanIcon,
  SmallerThanOrEqualIcon,
  GreaterThanIcon,
  GreaterThanOrEqualIcon,
} from '../../../icons';
import { useThemeContext } from '@/index-typedoc.js';
import { useWasModified } from '@/common/hooks/use-was-modified.js';
import { NumericCondition, NumericConditionFilterData, NumericConditionType } from './types.js';
import {
  createConditionalFilter,
  getNumericFilterCondition,
  getNumericFilterValue,
  validateInputValue,
} from './utils.js';
import { MembersListSelect } from '@/filters/components/filter-editor-popover/common/select/members-list-select';

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
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  const [condition, setCondition] = useState<NumericConditionType>(
    getNumericFilterCondition(filter, conditionItems[0].value),
  );
  const [value, setValue] = useState(getNumericFilterValue(filter));
  const [selectedMembers, setSelectedMembers] = useState(
    isExcludeMembersFilter(filter) ? filter.members : [],
  );
  const isValueWasModified = useWasModified(value, '');
  const prevMultiSelectEnabled = usePrevious(multiSelectEnabled);

  const multiSelectChanged =
    typeof prevMultiSelectEnabled !== 'undefined' && prevMultiSelectEnabled !== multiSelectEnabled;
  const translatedConditionItems = useMemo(
    () =>
      conditionItems.map((item) => ({
        ...item,
        displayValue: t(item.displayValue),
      })),
    [t],
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
      });
    }
  }, [
    condition,
    value,
    selectedMembers,
    multiSelectEnabled,
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
    });
  }, [condition, value, selectedMembers, multiSelectEnabled, prepareAndChangeFilter]);

  const handleMembersChange = useCallback(
    (members: string[] | string) => {
      const newMembers = Array.isArray(members) ? members : [members];
      setSelectedMembers(newMembers);
      prepareAndChangeFilter({
        condition,
        value,
        selectedMembers: newMembers,
        multiSelectEnabled,
      });
    },
    [condition, value, multiSelectEnabled, prepareAndChangeFilter],
  );

  const handleConditionChange = useCallback(
    (newCondition: NumericConditionType) => {
      setCondition(newCondition);

      prepareAndChangeFilter({
        condition: newCondition,
        value,
        selectedMembers,
        multiSelectEnabled,
      });
    },
    [value, selectedMembers, multiSelectEnabled, prepareAndChangeFilter],
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
      });
    },
    [condition, selectedMembers, multiSelectEnabled, prepareAndChangeFilter],
  );

  return (
    <SelectableSection
      selected={selected}
      onSelect={handleSectionSelect}
      aria-label="Numeric condition section"
    >
      <SingleSelect
        style={{ width: '210px', marginRight: '8px' }}
        value={condition}
        items={translatedConditionItems}
        onChange={handleConditionChange}
        primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
        primaryColor={themeSettings.typography.primaryTextColor}
        aria-label="Condition select"
      />
      {showInput && (
        <Input
          style={{
            width: '136px',
            backgroundColor: themeSettings.filter.panel.backgroundColor,
            color: themeSettings.typography.primaryTextColor,
          }}
          placeholder={t('filterEditor.placeholders.enterEntry')}
          value={value}
          onChange={handleValueChange}
          error={isValueWasModified && validateInputValue(value, t)}
          aria-label="Value input"
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
