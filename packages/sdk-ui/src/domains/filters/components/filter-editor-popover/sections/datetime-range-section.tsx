import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DimensionalLevelAttribute,
  Filter,
  filterFactory,
  isDateRangeFilter,
} from '@sisense/sdk-data';

import { parseISOWithTimezoneCheck } from '@/shared/utils/parseISOWithTimezoneCheck';

import { SelectableSection } from '../common/index.js';
import { CalendarRangeSelect, CalendarRangeValue } from '../common/select/calendar-select/index.js';
import { useDatetimeFormatter } from '../hooks/use-datetime-formatter.js';
import { asUtcDate } from '../utils.js';
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
    isDateRangeFilter(filter) && filter.valueA ? asUtcDate(filter.valueA) : undefined,
  );
  const [to, setTo] = useState<Date | undefined>(
    isDateRangeFilter(filter) && filter.valueB ? asUtcDate(filter.valueB) : undefined,
  );
  const rangeValue = useMemo(() => ({ from, to }), [from, to]);
  const normalizedLimits = useMemo(() => {
    return limits
      ? {
          minDate: limits.minDate ? parseISOWithTimezoneCheck(limits.minDate) : undefined,
          maxDate: limits.maxDate ? parseISOWithTimezoneCheck(limits.maxDate) : undefined,
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
      <CalendarRangeSelect
        fieldWidth={152}
        value={rangeValue}
        limits={normalizedLimits}
        fromLabel={t('filterEditor.labels.from')}
        toLabel={t('filterEditor.labels.to')}
        onChange={handleRangeValueChange}
        placeholder={t('filterEditor.placeholders.select')}
      />
    </SelectableSection>
  );
};
