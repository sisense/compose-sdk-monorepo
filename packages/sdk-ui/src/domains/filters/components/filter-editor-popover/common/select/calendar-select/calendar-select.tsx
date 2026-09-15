import { useCallback, useMemo, useRef, useState } from 'react';

import ClickAwayListener from '@mui/material/ClickAwayListener';
import dayjs from 'dayjs';

import { CalendarDateSelector } from '@/domains/filters/components/date-filter/date-filter/calendar-date-selector';
import { Popper } from '@/shared/components/popper';

import { CalendarSelectField } from './calendar-select-field';
import { CalendarSelectLimits, CalendarSelectTypes } from './types';
import { getCalendarDateSelectorMode, toLocalCalendarDate, toUtcCalendarDate } from './utils';

type BaseCalendarSelectProps = {
  limits?: CalendarSelectLimits;
  placeholder?: string;
  width?: number | string;
};

type CalendarSingleSelectProps = BaseCalendarSelectProps & {
  type: CalendarSelectTypes.SINGLE_SELECT;
  value?: Date;
  onChange?: (value: Date) => void;
};

type CalendarMultiSelectProps = BaseCalendarSelectProps & {
  type: CalendarSelectTypes.MULTI_SELECT;
  value?: Date[];
  onChange?: (value: Date[]) => void;
};

type CalendarSelectProps = CalendarSingleSelectProps | CalendarMultiSelectProps;

export function CalendarSelect(props: CalendarSelectProps) {
  const { value, type, limits, placeholder, onChange, width, ...rest } = props;
  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);

  const handleDateChange = useCallback(
    (date: dayjs.Dayjs) => {
      if (type === CalendarSelectTypes.SINGLE_SELECT) {
        onChange?.(toUtcCalendarDate(date));
      }
    },
    [type, onChange],
  );

  const handleDatesChange = useCallback(
    (dates: dayjs.Dayjs[]) => {
      if (type === CalendarSelectTypes.MULTI_SELECT) {
        onChange?.(dates.map(toUtcCalendarDate));
      }
    },
    [type, onChange],
  );

  const selectedDate = useMemo(() => {
    if (type === CalendarSelectTypes.SINGLE_SELECT && value) {
      return toLocalCalendarDate(value);
    }
    return undefined;
  }, [type, value]);

  const selectedDates = useMemo(() => {
    if (type === CalendarSelectTypes.MULTI_SELECT && value?.length) {
      return value.map(toLocalCalendarDate);
    }
    return undefined;
  }, [type, value]);

  const valuesToDisplay = useMemo(() => {
    const values = type === CalendarSelectTypes.SINGLE_SELECT ? [value] : value;

    return (values || []).filter((v): v is Date => !!v);
  }, [type, value]);

  const normalizedLimits = useMemo(() => {
    return limits
      ? {
          minDate: limits.minDate ? toLocalCalendarDate(limits.minDate) : undefined,
          maxDate: limits.maxDate ? toLocalCalendarDate(limits.maxDate) : undefined,
        }
      : undefined;
  }, [limits]);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div style={{ width }}>
        <CalendarSelectField
          ref={selectElementRef}
          values={valuesToDisplay}
          placeholder={placeholder}
          focus={open}
          onClick={() => setOpen((isOpen) => !isOpen)}
          {...rest}
        />
        <Popper open={open} anchorEl={selectElementRef.current} preventClickPropagation={true}>
          <CalendarDateSelector
            selectorMode={getCalendarDateSelectorMode(type)}
            limit={normalizedLimits}
            selectedDate={selectedDate}
            selectedDates={selectedDates}
            onDateChanged={handleDateChange}
            onDatesChanged={handleDatesChange}
          />
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
