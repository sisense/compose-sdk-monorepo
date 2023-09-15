import dayjs from 'dayjs';
import { SelectorMode } from './calendar-date-selector.js';

type DayjsDateRange = {
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
};

export function calculateNewDateRange(
  currentDateRange: DayjsDateRange,
  newSelectedDate: dayjs.Dayjs,
  selectorMode: SelectorMode,
): DayjsDateRange {
  const isBeforeCurrentFrom = newSelectedDate.isBefore(currentDateRange.from);
  const isAfterCurrentTo = newSelectedDate.isAfter(currentDateRange.to);

  let newFrom: dayjs.Dayjs;
  let newTo: dayjs.Dayjs;

  if (selectorMode === 'fromSelector') {
    if (isAfterCurrentTo) {
      newFrom = newSelectedDate;
      newTo = newSelectedDate;
    } else {
      newFrom = newSelectedDate;
      newTo = currentDateRange.to;
    }
  } else {
    if (isBeforeCurrentFrom) {
      newFrom = newSelectedDate;
      newTo = newSelectedDate;
    } else {
      newFrom = currentDateRange.from;
      newTo = newSelectedDate;
    }
  }

  return {
    from: newFrom,
    to: newTo,
  };
}
