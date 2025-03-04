import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from '@sisense/sdk-data';
import { SelectableSection } from '../common/selectable-section.js';
import { Input, SingleSelect } from '../common/index.js';
import {
  CRITERIA_FILTER_MAP,
  FilterOption,
  filterToDefaultValues,
  filterToOption,
} from '../../criteria-filter-tile/criteria-filter-operations.js';
import { isConditionalFilter, isExcludeMembersFilter } from '../utils.js';
import { SearchableMultiSelect } from '../common/select/searchable-multi-select.js';
import { SearchableSingleSelect } from '../common/select/searchable-single-select.js';
import { usePrevious } from '@/common/hooks/use-previous.js';
import { useThemeContext } from '@/theme-provider';
import { Member } from '@/filters';
import { ScrollWrapperOnScrollEvent } from '../common/scroll-wrapper';
import { createExcludeMembersFilter } from './utils.js';

const TextCondition = {
  EXCLUDE: 'exclude',
  CONTAINS: FilterOption.CONTAINS,
  NOT_CONTAIN: FilterOption.NOT_CONTAIN,
  STARTS_WITH: FilterOption.STARTS_WITH,
  NOT_STARTS_WITH: FilterOption.NOT_STARTS_WITH,
  ENDS_WITH: FilterOption.ENDS_WITH,
  NOT_ENDS_WITH: FilterOption.NOT_ENDS_WITH,
  EQUALS: FilterOption.EQUALS_TEXT,
  NOT_EQUALS: FilterOption.NOT_EQUALS_TEXT,
  IS_EMPTY: 'isEmpty',
  IS_NOT_EMPTY: 'isNotEmpty',
} as const;

type TextConditionType = (typeof TextCondition)[keyof typeof TextCondition];

const conditionItems = [
  { value: TextCondition.EXCLUDE, displayValue: 'filterEditor.conditions.exclude' },
  { value: TextCondition.CONTAINS, displayValue: 'filterEditor.conditions.contains' },
  { value: TextCondition.NOT_CONTAIN, displayValue: 'filterEditor.conditions.notContain' },
  { value: TextCondition.STARTS_WITH, displayValue: 'filterEditor.conditions.startsWith' },
  { value: TextCondition.NOT_STARTS_WITH, displayValue: 'filterEditor.conditions.notStartsWith' },
  { value: TextCondition.ENDS_WITH, displayValue: 'filterEditor.conditions.endsWith' },
  { value: TextCondition.NOT_ENDS_WITH, displayValue: 'filterEditor.conditions.notEndsWith' },
  { value: TextCondition.EQUALS, displayValue: 'filterEditor.conditions.equals' },
  { value: TextCondition.NOT_EQUALS, displayValue: 'filterEditor.conditions.notEquals' },
  { value: TextCondition.IS_EMPTY, displayValue: 'filterEditor.conditions.isEmpty' },
  { value: TextCondition.IS_NOT_EMPTY, displayValue: 'filterEditor.conditions.isNotEmpty' },
];

const getTextFilterCondition = (filter: Filter): TextConditionType => {
  if (!isConditionalFilter(filter)) {
    // returns first condition by default
    return conditionItems[0].value;
  }

  if (isExcludeMembersFilter(filter)) {
    return TextCondition.EXCLUDE;
  }

  const condition = filterToOption(filter) as TextConditionType;
  const value = getTextFilterValue(filter);

  if (condition === TextCondition.EQUALS && value === '') {
    return TextCondition.IS_EMPTY;
  }

  if (condition === TextCondition.NOT_EQUALS && value === '') {
    return TextCondition.IS_NOT_EMPTY;
  }

  return condition;
};

const getTextFilterValue = (filter: Filter) => {
  if (!isConditionalFilter(filter)) {
    return '';
  }
  return filterToDefaultValues(filter)[0] || '';
};

const getCriteriaFilterBuilder = (condition: string) => {
  if (condition === TextCondition.IS_EMPTY) {
    return CRITERIA_FILTER_MAP[TextCondition.EQUALS];
  }
  if (condition === TextCondition.IS_NOT_EMPTY) {
    return CRITERIA_FILTER_MAP[TextCondition.NOT_EQUALS];
  }
  return CRITERIA_FILTER_MAP[condition];
};

function createConditionalFilter(baseFilter: Filter, data: TextConditionFilterData) {
  const { attribute, config } = baseFilter;
  const { condition, value, selectedMembers, multiSelectEnabled } = data;
  if (condition === TextCondition.EXCLUDE) {
    return createExcludeMembersFilter(attribute, selectedMembers, {
      ...config,
      enableMultiSelection: multiSelectEnabled,
    });
  }

  const builder = getCriteriaFilterBuilder(condition);
  return builder.fn(attribute, value, config);
}

type TextConditionFilterData = {
  condition: string;
  value: string;
  selectedMembers: string[];
  multiSelectEnabled: boolean;
};

type TextConditionSectionProps = {
  filter: Filter;
  selected: boolean;
  members: Member[];
  multiSelectEnabled: boolean;
  onChange: (filter: Filter | null) => void;
  onListScroll?: (event: ScrollWrapperOnScrollEvent) => void;
  showListLoader?: boolean;
};

/** @internal */
export const TextConditionSection = ({
  filter,
  selected,
  members,
  multiSelectEnabled,
  onChange,
  onListScroll,
  showListLoader = false,
}: TextConditionSectionProps) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  const [condition, setCondition] = useState<TextConditionType>(getTextFilterCondition(filter));
  const [value, setValue] = useState(getTextFilterValue(filter) as string);
  const [selectedMembers, setSelectedMembers] = useState(
    isExcludeMembersFilter(filter) ? filter.members : [],
  );
  const prevMultiSelectEnabled = usePrevious(multiSelectEnabled);
  const selectItems = useMemo(() => {
    let allMembers = members.map((member) => ({ value: member.key }));
    if (isExcludeMembersFilter(filter) && filter.members.length) {
      const selectedMembers = multiSelectEnabled ? filter.members : [filter.members[0]];
      allMembers = [
        ...selectedMembers.map((member) => ({ value: member })),
        ...allMembers.filter((member) => !selectedMembers.includes(member.value)),
      ];
    }
    return allMembers;
  }, [multiSelectEnabled, members, filter]);
  const multiSelectChanged =
    typeof prevMultiSelectEnabled !== 'undefined' && prevMultiSelectEnabled !== multiSelectEnabled;
  const translatedConditionItems = useMemo(
    () => conditionItems.map((item) => ({ ...item, displayValue: t(item.displayValue) })),
    [t],
  );

  const showInput = useMemo(
    () =>
      (
        [
          TextCondition.CONTAINS,
          TextCondition.ENDS_WITH,
          TextCondition.EQUALS,
          TextCondition.NOT_CONTAIN,
          TextCondition.NOT_ENDS_WITH,
          TextCondition.NOT_EQUALS,
          TextCondition.NOT_STARTS_WITH,
          TextCondition.STARTS_WITH,
        ] as TextConditionType[]
      ).includes(condition),
    [condition],
  );

  const prepareAndChangeFilter = useCallback(
    (data: TextConditionFilterData) => {
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
    (newCondition: TextConditionType) => {
      let currentValue = value;

      setCondition(newCondition);

      if (newCondition === TextCondition.IS_EMPTY) {
        setValue('');
        currentValue = '';
      }

      prepareAndChangeFilter({
        condition: newCondition,
        value: currentValue,
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
      aria-label="Text condition section"
    >
      <SingleSelect
        style={{ width: '168px', marginRight: '8px' }}
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
            width: '300px',
            backgroundColor: themeSettings.filter.panel.backgroundColor,
            color: themeSettings.typography.primaryTextColor,
          }}
          placeholder={t('filterEditor.placeholders.enterEntry')}
          value={value}
          onChange={handleValueChange}
          aria-label="Value input"
        />
      )}
      {condition === TextCondition.EXCLUDE &&
        (multiSelectEnabled ? (
          <SearchableMultiSelect<string>
            style={{ width: '300px' }}
            values={selectedMembers}
            placeholder={t('filterEditor.placeholders.selectFromList')}
            items={selectItems}
            onChange={handleMembersChange}
            primaryColor={themeSettings.typography.primaryTextColor}
            primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
            onListScroll={onListScroll}
            showListLoader={showListLoader}
          />
        ) : (
          <SearchableSingleSelect<string>
            style={{ width: '300px' }}
            value={selectedMembers[0]}
            placeholder={t('filterEditor.placeholders.selectFromList')}
            items={selectItems}
            onChange={handleMembersChange}
            primaryColor={themeSettings.typography.primaryTextColor}
            primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
            onListScroll={onListScroll}
            showListLoader={showListLoader}
          />
        ))}
    </SelectableSection>
  );
};
