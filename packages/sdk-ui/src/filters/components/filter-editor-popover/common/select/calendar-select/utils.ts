import { DateLevels } from '@ethings-os/sdk-data';
import { getDefaultDateMask } from '@/query/date-formats/apply-date-format';
import { DatetimeFormatter } from '../../../hooks/use-datetime-formatter';
import { CalendarSelectTypes } from './types';
import { SelectorMode } from '@/filters/components/date-filter/date-filter/calendar-date-selector';

const MAX_CALENDAR_DISPLAY_ITEMS = 1;

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
