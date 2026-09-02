import { DateLevels } from '@sisense/sdk-data';
import dayjs from 'dayjs';

import { SelectorMode } from '@/domains/filters/components/date-filter/date-filter/calendar-date-selector';
import { getDefaultDateMask } from '@/domains/query-execution/core/date-formats/apply-date-format';

import { DatetimeFormatter } from '../../../hooks/use-datetime-formatter';
import { CalendarSelectTypes } from './types';

const MAX_CALENDAR_DISPLAY_ITEMS = 1;

/**
 * Re-anchors a locally picked calendar day to UTC midnight.
 *
 * The calendar works in local time; everything outside it treats a date as UTC midnight of the
 * day it names.
 */
export function toUtcCalendarDate(date: dayjs.Dayjs): Date {
  return new Date(Date.UTC(date.year(), date.month(), date.date()));
}

/**
 * Re-anchors a UTC-midnight date to the local-midnight day the calendar expects.
 *
 * Inverse of {@link toUtcCalendarDate}.
 */
export function toLocalCalendarDate(date: Date): dayjs.Dayjs {
  return dayjs(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getCalendarSelectedItemsDisplayValue(
  values: Date[],
  formatter: DatetimeFormatter,
): string | undefined {
  if (values.length === 0) {
    return undefined;
  }

  if (values.length > MAX_CALENDAR_DISPLAY_ITEMS) {
    return `${values.length} Dates selected`;
  }

  return values
    .map((dateValue) => formatter(dateValue, getDefaultDateMask(DateLevels.Days)))
    .join(', ');
}

export function getCalendarDateSelectorMode(type: CalendarSelectTypes): SelectorMode {
  switch (type) {
    case CalendarSelectTypes.SINGLE_SELECT:
      return 'pointSelector';
    case CalendarSelectTypes.MULTI_SELECT:
      return 'multiPointsSelector';
    case CalendarSelectTypes.RANGE_FROM_SELECT:
      return 'fromSelector';
    case CalendarSelectTypes.RANGE_TO_SELECT:
      return 'toSelector';
  }
}
