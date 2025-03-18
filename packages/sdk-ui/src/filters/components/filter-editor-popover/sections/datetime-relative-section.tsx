import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from '@sisense/sdk-common';
import {
  DateLevels,
  DateOperators,
  DimensionalLevelAttribute,
  Filter,
  FilterConfig,
  filterFactory,
} from '@sisense/sdk-data';
import { SelectableSection } from '../common/selectable-section';
import { createLevelAttribute, isRelativeDateFilterWithoutAnchor } from '../utils';
import { useThemeContext } from '@/theme-provider';
import { Input, SingleSelect } from '../common';
import { Checkbox } from '../../common';
import styled from '@emotion/styled';
import { Themable } from '@/theme-provider/types';
import { dateLevelGranularities as granularities } from './common/granularities';

const IncludeCurrentCheckbox = styled(Checkbox)`
  margin-top: 0;
  margin-bottom: 0;
  input {
    width: 13px;
    height: 13px;
  }
  span {
    border-left: none;
    padding-left: 0;
  }
`;

const TypeSelect = styled(SingleSelect<RelativeFilterType>)`
  width: 88px;
  margin-right: 8px;
`;

const CountInput = styled(Input)<Themable>`
  width: 64px;
  margin-right: 8px;
  background-color: ${({ theme }) => theme.filter.panel.backgroundColor};
  color: ${({ theme }) => theme.typography.primaryTextColor};
`;

const GranularitySelect = styled(SingleSelect<string>)`
  width: 112px;
  margin-right: 8px;
`;

enum RelativeFilterType {
  LAST = 'last',
  THIS = 'this',
  NEXT = 'next',
}

const types = [
  { value: RelativeFilterType.LAST, displayValue: 'filterEditor.relativeTypes.last' },
  { value: RelativeFilterType.THIS, displayValue: 'filterEditor.relativeTypes.this' },
  { value: RelativeFilterType.NEXT, displayValue: 'filterEditor.relativeTypes.next' },
];

function getRelativeFilterData(filter: Filter, t: TFunction): RelativeFilterData {
  if (!isRelativeDateFilterWithoutAnchor(filter)) {
    return {
      type: RelativeFilterType.LAST,
      attribute: createLevelAttribute(
        filter.attribute as DimensionalLevelAttribute,
        DateLevels.Months,
        t,
      ),
      count: 1,
      includeCurrent: false,
    };
  }
  const isThis =
    filter.operator === DateOperators.Last && filter.count === 1 && filter.offset === 0;
  const includeCurrent = filter.offset === 0 && !isThis;
  return {
    type: isThis ? RelativeFilterType.THIS : (filter.operator as RelativeFilterType),
    attribute: filter.attribute as DimensionalLevelAttribute,
    count: filter.count,
    includeCurrent: includeCurrent,
  };
}

function createRelativeFilter(data: RelativeFilterData, config?: FilterConfig) {
  const { type, attribute, count, includeCurrent } = data;
  const offset = includeCurrent ? 0 : 1;

  switch (type) {
    case RelativeFilterType.LAST:
      return filterFactory.dateRelativeTo(attribute, offset, count, undefined, config);
    case RelativeFilterType.THIS:
      return filterFactory.dateRelativeTo(attribute, 0, 1, undefined, config);
    case RelativeFilterType.NEXT:
      return filterFactory.dateRelative(attribute, offset, count, undefined, config);
  }
}

type RelativeFilterData = {
  type: RelativeFilterType;
  attribute: DimensionalLevelAttribute;
  count: number;
  includeCurrent: boolean;
};

type DatetimeRelativeSectionProps = {
  filter: Filter;
  selected: boolean;
  onChange: (filter: Filter | null) => void;
};

/** @internal */
export const DatetimeRelativeSection = (props: DatetimeRelativeSectionProps) => {
  const { themeSettings } = useThemeContext();
  const { filter, selected, onChange } = props;
  const { t } = useTranslation();
  const initialRelativeFilterData = getRelativeFilterData(filter, t);
  const [attribute, setAttribute] = useState(initialRelativeFilterData.attribute);
  const [type, setType] = useState(initialRelativeFilterData.type);
  const [count, setCount] = useState(initialRelativeFilterData.count);
  const [includeCurrent, setIncludeCurrent] = useState(initialRelativeFilterData.includeCurrent);

  const translatedGranularities = useMemo(
    () =>
      granularities.map((granularity) => ({
        value: granularity.value,
        displayValue: t(granularity.displayValue),
      })),
    [t],
  );

  const translatedTypes = useMemo(
    () =>
      types.map((type) => ({
        value: type.value,
        displayValue: t(type.displayValue),
      })),
    [t],
  );

  const prepareAndChangeFilter = useCallback(
    (filterData: RelativeFilterData) => {
      const newFilter = createRelativeFilter(filterData, filter.config);
      onChange(newFilter);
    },
    [filter, onChange],
  );

  const handleSectionSelect = useCallback(() => {
    prepareAndChangeFilter({ type, count, includeCurrent, attribute });
  }, [type, count, includeCurrent, attribute, prepareAndChangeFilter]);

  const handleTypeChange = useCallback(
    (type: RelativeFilterType) => {
      setType(type);
      prepareAndChangeFilter({ type, count, includeCurrent, attribute });
    },
    [count, includeCurrent, attribute, prepareAndChangeFilter],
  );

  const handleGranularityChange = useCallback(
    (granularity: string) => {
      const newAttribute = createLevelAttribute(attribute, granularity, t);
      setAttribute(newAttribute);
      prepareAndChangeFilter({ type, count, includeCurrent, attribute: newAttribute });
    },
    [type, count, includeCurrent, attribute, prepareAndChangeFilter, t],
  );

  const handleCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const defaultValue = 1;
      const rawCount = e.target.value;
      let newCount = count;

      if (rawCount === '') {
        newCount = defaultValue;
      } else if (/^\d+$/.test(rawCount)) {
        newCount = parseInt(rawCount) || defaultValue;
      }

      setCount(newCount);
      prepareAndChangeFilter({ type, count: newCount, includeCurrent, attribute });
    },
    [type, count, includeCurrent, attribute, prepareAndChangeFilter],
  );

  const handleIncludeCurrentChange = useCallback(() => {
    const newIncludeCurrent = !includeCurrent;
    setIncludeCurrent(newIncludeCurrent);
    prepareAndChangeFilter({ type, count, includeCurrent: newIncludeCurrent, attribute });
  }, [type, count, includeCurrent, attribute, prepareAndChangeFilter]);

  return (
    <SelectableSection
      selected={selected}
      onSelect={handleSectionSelect}
      aria-label="Datetime relative section"
    >
      {() => (
        <>
          <TypeSelect
            value={type}
            items={translatedTypes}
            onChange={handleTypeChange}
            primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
            primaryColor={themeSettings.typography.primaryTextColor}
            aria-label="Type"
          />
          {type !== RelativeFilterType.THIS && (
            <CountInput
              theme={themeSettings}
              type="number"
              value={count}
              onChange={handleCountChange}
              aria-label="Count"
            />
          )}
          <GranularitySelect
            value={attribute.granularity}
            items={translatedGranularities}
            onChange={handleGranularityChange}
            primaryBackgroundColor={themeSettings.filter.panel.backgroundColor}
            primaryColor={themeSettings.typography.primaryTextColor}
            aria-label="Granularity"
          />
          {type !== RelativeFilterType.THIS && (
            <IncludeCurrentCheckbox
              label="Including current"
              checked={includeCurrent}
              onChange={handleIncludeCurrentChange}
            />
          )}
        </>
      )}
    </SelectableSection>
  );
};
