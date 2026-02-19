import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DimensionalLevelAttribute,
  Filter,
  filterFactory,
  isDateRangeFilter,
} from '@sisense/sdk-data';

import { SelectableSection } from '../common/index.js';
import {
  CalendarRangeValue,
  CalendarSelect,
  CalendarSelectTypes,
} from '../common/select/calendar-select/index.js';
import { useDatetimeFormatter } from '../hooks/use-datetime-formatter.js';
import { DatetimeLimits } from './types.js';

const DATETIME_RANGE_FORMAT = 'yyyy-MM-dd';

type DatetimeRangeSectionProps = {
  filter: Filter;
  selected: boolean;
  limits?: DatetimeLimits;
  onChange: (filter: Filter | null) => void;
};

/** @internal */
export const DatetimeRangeSection = (props: DatetimeRangeSectionProps) => {
  const { filter, selected, limits, onChange } = props;
  const { t } = useTranslation();
  const formatter = useDatetimeFormatter();
  const [from, setFrom] = useState<Date | undefined>(
    isDateRangeFilter(filter) && filter.valueA ? new Date(filter.valueA) : undefined,
  );
  const [to, setTo] = useState<Date | undefined>(
    isDateRangeFilter(filter) && filter.valueB ? new Date(filter.valueB) : undefined,
  );
  const rangeValue = useMemo(() => ({ from, to }), [from, to]);
  const normalizedLimits = useMemo(() => {
    return limits
      ? {
          minDate: limits.minDate ? new Date(limits.minDate) : undefined,
          maxDate: limits.maxDate ? new Date(limits.maxDate) : undefined,
        }
      : undefined;
  }, [limits]);

  const prepareAndChangeFilter = useCallback(
    (from: Date | undefined, to: Date | undefined) => {
      const isValidRange = from && to;
      const newFilter = isValidRange
        ? filterFactory.dateRange(
            filter.attribute as DimensionalLevelAttribute,
            formatter(from, DATETIME_RANGE_FORMAT),
            formatter(to, DATETIME_RANGE_FORMAT),
            filter.config,
          )
        : null;
      onChange(newFilter);
    },
    [filter, formatter, onChange],
  );

  const handleSectionSelect = useCallback(() => {
    prepareAndChangeFilter(from, to);
  }, [from, to, prepareAndChangeFilter]);

  const handleRangeValueChange = useCallback(
    ({ from, to }: CalendarRangeValue) => {
      setFrom(from);
      setTo(to);
      prepareAndChangeFilter(from, to);
    },
    [prepareAndChangeFilter],
  );

  return (
    <SelectableSection
      selected={selected}
      onSelect={handleSectionSelect}
      aria-label="Datetime range section"
    >
      <span id="datetime-range-from" style={{ margin: '0 8px 0 0' }}>
        {t('filterEditor.labels.from')}
      </span>
      <CalendarSelect
        width={152}
        type={CalendarSelectTypes.RANGE_FROM_SELECT}
        value={rangeValue}
        limits={normalizedLimits}
        aria-labelledby="datetime-range-from"
        onChange={handleRangeValueChange}
        placeholder={t('filterEditor.placeholders.select')}
      />
      <span id="datetime-range-to" style={{ margin: '0 8px 0 8px' }}>
        {t('filterEditor.labels.to')}
      </span>
      <CalendarSelect
        width={152}
        type={CalendarSelectTypes.RANGE_TO_SELECT}
        value={rangeValue}
        limits={normalizedLimits}
        aria-labelledby="datetime-range-to"
        onChange={handleRangeValueChange}
        placeholder={t('filterEditor.placeholders.select')}
      />
    </SelectableSection>
  );
};
