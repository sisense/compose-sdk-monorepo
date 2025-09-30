import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from '@sisense/sdk-common';
import {
  DateLevels,
  DateOperators,
  DimensionalLevelAttribute,
  Filter,
  filterFactory,
} from '@sisense/sdk-data';
import { Input, SingleSelect } from '../../../common/index.js';
import { isRelativeDateFilterWithAnchor } from '../../../utils.js';
import { useThemeContext } from '@/index-typedoc.js';
import { DatetimeLimits } from '../../types.js';
import styled from '@emotion/styled';
import { Themable } from '@/theme-provider/types.js';
import { CalendarSelect } from '../../../common/select/calendar-select/calendar-select.js';
import { CalendarSelectTypes } from '../../../common/select/calendar-select/types.js';
import { dateLevelGranularities as granularities } from '../../common/granularities';
import { createLevelAttribute } from '@/utils/create-level-attribute.js';

const CountInput = styled(Input)<Themable>`
  width: 64px;
  margin-right: 8px;
  background-color: ${({ theme }) => theme.general.popover.input.backgroundColor};
  color: ${({ theme }) => theme.general.popover.input.textColor};
`;

const GranularitySelect = styled(SingleSelect<string>)`
  width: 112px;
  margin-right: 8px;
`;

const PositionSelect = styled(SingleSelect<DatetimePosition>)`
  width: 112px;
  margin-right: 8px;
`;

enum DatetimePosition {
  BEFORE = 'before',
  AFTER = 'after',
}

const positions = [
  { value: DatetimePosition.BEFORE, displayValue: 'filterEditor.datetimePositions.before' },
  { value: DatetimePosition.AFTER, displayValue: 'filterEditor.datetimePositions.after' },
];

function createIsWithinConditionFilterFilter(
  baseFilter: Filter,
  data: DatetimeIsWithinConditionFilterData,
) {
  const { config } = baseFilter;
  const { position, count, baseDate, attribute } = data;

  if (!baseDate) {
    return null;
  }

  switch (position) {
    case DatetimePosition.BEFORE:
      return filterFactory.dateRelativeTo(attribute, 0, count, baseDate, config);
    case DatetimePosition.AFTER:
      return filterFactory.dateRelativeFrom(attribute, 0, count, baseDate, config);
  }
}

type DatetimeIsWithinConditionFilterData = {
  count: number;
  position: DatetimePosition;
  baseDate?: Date;
  attribute: DimensionalLevelAttribute;
};

function getDatetimeIsWithinConditionFilterData(
  filter: Filter,
  t: TFunction,
): DatetimeIsWithinConditionFilterData {
  const defaultData = {
    count: 1,
    position: DatetimePosition.BEFORE,
    baseDate: undefined,
    attribute: createLevelAttribute(
      filter.attribute as DimensionalLevelAttribute,
      DateLevels.Years,
      t,
    ),
  };

  if (isRelativeDateFilterWithAnchor(filter)) {
    return {
      ...defaultData,
      count: filter.count,
      position:
        filter.operator === DateOperators.Last ? DatetimePosition.BEFORE : DatetimePosition.AFTER,
      baseDate: new Date(filter.anchor!),
      attribute: filter.attribute as DimensionalLevelAttribute,
    };
  }

  return defaultData;
}

type DatetimeConditionSectionProps = {
  filter: Filter;
  limits?: DatetimeLimits;
  onChange: (filter: Filter | null) => void;
};

/** @internal */
export const DatetimeIsWithinConditionForm = ({
  filter,
  limits,
  onChange,
}: DatetimeConditionSectionProps) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  const initialFilterData = getDatetimeIsWithinConditionFilterData(filter, t);
  const [count, setCount] = useState(initialFilterData.count);
  const [position, setPosition] = useState(initialFilterData.position);
  const [baseDate, setBaseDate] = useState(initialFilterData.baseDate);
  const [attribute, setAttribute] = useState<DimensionalLevelAttribute>(
    initialFilterData.attribute,
  );
  const translatedGranularities = useMemo(
    () =>
      granularities.map((granularity) => ({
        ...granularity,
        displayValue: t(granularity.displayValue),
      })),
    [t],
  );
  const translatedPositions = useMemo(
    () =>
      positions.map((position) => ({
        ...position,
        displayValue: t(position.displayValue),
      })),
    [t],
  );

  const prepareAndChangeFilter = useCallback(
    (data: DatetimeIsWithinConditionFilterData) => {
      const newFilter = createIsWithinConditionFilterFilter(filter, data);
      onChange(newFilter);
    },
    [filter, onChange],
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
      prepareAndChangeFilter({
        count: newCount,
        position,
        baseDate,
        attribute,
      });
    },
    [count, position, baseDate, attribute, prepareAndChangeFilter],
  );

  const handleGranularityChange = useCallback(
    (granularity: string) => {
      const newAttribute = createLevelAttribute(attribute, granularity, t);
      setAttribute(newAttribute);
      prepareAndChangeFilter({
        count,
        position,
        baseDate,
        attribute: newAttribute,
      });
    },
    [count, position, baseDate, attribute, prepareAndChangeFilter, t],
  );

  const handlePositionChange = useCallback(
    (position: DatetimePosition) => {
      setPosition(position);
      prepareAndChangeFilter({
        count,
        position,
        baseDate,
        attribute,
      });
    },
    [count, baseDate, attribute, prepareAndChangeFilter],
  );

  const handleBaseDateChange = useCallback(
    (baseDate: Date) => {
      setBaseDate(baseDate);
      prepareAndChangeFilter({
        count,
        position,
        baseDate,
        attribute,
      });
    },
    [count, position, attribute, prepareAndChangeFilter],
  );

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
      <CountInput theme={themeSettings} type="number" value={count} onChange={handleCountChange} />
      <GranularitySelect
        value={attribute.granularity}
        items={translatedGranularities}
        onChange={handleGranularityChange}
        aria-label="Granularity select"
      />
      <PositionSelect
        value={position}
        items={translatedPositions}
        onChange={handlePositionChange}
        aria-label="Position select"
      />
      <CalendarSelect
        width={152}
        type={CalendarSelectTypes.SINGLE_SELECT}
        value={baseDate}
        limits={normalizedLimits}
        onChange={handleBaseDateChange}
        placeholder={t('filterEditor.placeholders.select')}
      />
    </>
  );
};
