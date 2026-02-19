/* eslint-disable max-lines-per-function */
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Filter } from '@sisense/sdk-data';

import styled from '@/infra/styled/index.js';

import { SingleSelect } from '../../common/index.js';
import { SelectableSection } from '../../common/selectable-section.js';
import { useFilterEditorContext } from '../../filter-editor-context.js';
import { isExcludeMembersFilter, isRelativeDateFilterWithAnchor } from '../../utils.js';
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

const membersOnlyConditionItems = [
  { value: DatetimeCondition.EXCLUDE, displayValue: 'filterEditor.conditions.exclude' },
];

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
  const { t } = useTranslation();
  const { membersOnlyMode } = useFilterEditorContext();
  const initialFilterData = getDatetimeConditionFilterData(filter);
  const [condition, setCondition] = useState<DatetimeCondition>(initialFilterData.condition);
  const [editedFilter, setEditedFilter] = useState<Filter | null>(initialFilterData.editedFilter);
  const conditionItemsToUse = membersOnlyMode ? membersOnlyConditionItems : conditionItems;
  const translatedConditionItems = useMemo(
    () =>
      conditionItemsToUse.map((item) => ({
        ...item,
        displayValue: t(item.displayValue),
      })),
    [t, conditionItemsToUse],
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
