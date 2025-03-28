/* eslint-disable max-lines-per-function */
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { Filter } from '@sisense/sdk-data';
import { SelectableSection } from '../../common/selectable-section.js';
import { SingleSelect } from '../../common/index.js';
import { isExcludeMembersFilter, isRelativeDateFilterWithAnchor } from '../../utils.js';
import { useThemeContext } from '@/index-typedoc.js';
import { DatetimeLimits } from '../types.js';
import { DatetimeExcludeConditionForm } from './condition-forms/datetime-exclude-condition-form.js';
import { DatetimeIsWithinConditionForm } from './condition-forms/datetime-is-within-condition-form.js';

const ConditionSelect = styled(SingleSelect<DatetimeCondition>)`
  width: 128px;
  margin-right: 8px;
`;

enum DatetimeCondition {
  EXCLUDE = 'exclude',
  IS_WITHIN = 'isWithin',
}

const conditionItems = [
  { value: DatetimeCondition.EXCLUDE, displayValue: 'filterEditor.conditions.exclude' },
  { value: DatetimeCondition.IS_WITHIN, displayValue: 'filterEditor.conditions.isWithin' },
];

type DatetimeConditionFilterData = {
  condition: DatetimeCondition;
  editedFilter: Filter | null;
};

function getDatetimeConditionFilterData(filter: Filter): DatetimeConditionFilterData {
  const defaultData = {
    condition: DatetimeCondition.EXCLUDE,
    editedFilter: null,
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
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  const initialFilterData = getDatetimeConditionFilterData(filter);
  const [condition, setCondition] = useState<DatetimeCondition>(initialFilterData.condition);
  const [editedFilter, setEditedFilter] = useState<Filter | null>(initialFilterData.editedFilter);
  const translatedConditionItems = useMemo(
    () =>
      conditionItems.map((item) => ({
        ...item,
        displayValue: t(item.displayValue),
      })),
    [t],
  );

  const handleSectionSelect = useCallback(() => {
    onChange(editedFilter);
  }, [editedFilter, onChange]);

  const handleConditionChange = useCallback(
    (newCondition: DatetimeCondition) => {
      setCondition(newCondition);
      onChange(editedFilter);
    },
    [editedFilter, onChange],
  );

  const handleFilterChange = useCallback(
    (newFilter: Filter | null) => {
      setEditedFilter(newFilter);
      onChange(newFilter);
    },
    [onChange],
  );

  return (
    <SelectableSection
      selected={selected}
      onSelect={handleSectionSelect}
      aria-label="Datetime condition section"
    >
      <ConditionSelect
        value={condition}
        items={translatedConditionItems}
        onChange={handleConditionChange}
        primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
        primaryColor={themeSettings.typography.primaryTextColor}
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
    </SelectableSection>
  );
};
