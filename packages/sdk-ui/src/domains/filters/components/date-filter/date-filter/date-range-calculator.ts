import dayjs from 'dayjs';

import { RangeSelectorMode } from './calendar-date-selector.js';

type DayjsDateRange = {
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
};

export function calculateNewDateRange(
  existingDateRange: Partial<DayjsDateRange>,
  newSelectedDate: dayjs.Dayjs,
  selectorMode: RangeSelectorMode,
): Partial<DayjsDateRange> {
  const { from, to } = existingDateRange;

  if (selectorMode === 'fromSelector') {
    return {
      from: newSelectedDate,
      to: to !== undefined && newSelectedDate.isAfter(to) ? newSelectedDate : to,
    };
  }

  return {
    from: from !== undefined && newSelectedDate.isBefore(from) ? newSelectedDate : from,
    to: newSelectedDate,
  };
}
