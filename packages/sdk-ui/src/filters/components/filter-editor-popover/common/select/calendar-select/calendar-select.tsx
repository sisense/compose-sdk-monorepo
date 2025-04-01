import { useCallback, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { DateIcon } from '../../../../icons';
import { CalendarRangeValue, CalendarSelectLimits, CalendarSelectTypes } from './types';
import { getCalendarDateSelectorMode, getCalendarSelectedItemsDisplayValue } from './utils';
import { SelectField, SelectLabel } from '../base';
import {
  CalendarDateSelector,
  DayjsDateRange,
} from '@/filters/components/date-filter/date-filter/calendar-date-selector';
import { useDatetimeFormatter } from '../../../hooks/use-datetime-formatter';
import { Popper } from '@/common/components/popper';
import { useThemeContext } from '@/theme-provider';
import ClickAwayListener from '@mui/material/ClickAwayListener';

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

type CalendarRangeSelectProps = BaseCalendarSelectProps & {
  type: CalendarSelectTypes.RANGE_FROM_SELECT | CalendarSelectTypes.RANGE_TO_SELECT;
  value?: CalendarRangeValue;
  onChange?: (value: CalendarRangeValue) => void;
};

type CalendarSelectProps =
  | CalendarSingleSelectProps
  | CalendarMultiSelectProps
  | CalendarRangeSelectProps;

export function CalendarSelect(props: CalendarSelectProps) {
  const { value, type, limits, placeholder, onChange, width, ...rest } = props;
  const formatter = useDatetimeFormatter();
  const { themeSettings } = useThemeContext();
  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);

  const handleDateChange = useCallback(
    (date: dayjs.Dayjs) => {
      if (type === CalendarSelectTypes.SINGLE_SELECT) {
        onChange?.(date.toDate());
      }
    },
    [type, onChange],
  );

  const handleDatesChange = useCallback(
    (dates: dayjs.Dayjs[]) => {
      if (type === CalendarSelectTypes.MULTI_SELECT) {
        onChange?.(dates.map((date) => date.toDate()));
      }
    },
    [type, onChange],
  );

  const handleDateRangeChange = useCallback(
    (range: DayjsDateRange) => {
      if (
        type === CalendarSelectTypes.RANGE_FROM_SELECT ||
        type === CalendarSelectTypes.RANGE_TO_SELECT
      ) {
        onChange?.({
          from: range.from.toDate(),
          to: range.to.toDate(),
        });
      }
    },
    [type, onChange],
  );

  const selectedDate = useMemo(() => {
    if (type === CalendarSelectTypes.SINGLE_SELECT && value) {
      return dayjs(value);
    }
    return undefined;
  }, [type, value]);

  const selectedDates = useMemo(() => {
    if (type === CalendarSelectTypes.MULTI_SELECT && value?.length) {
      return value.map((date) => dayjs(date));
    }
    return undefined;
  }, [type, value]);

  const selectedDateRange = useMemo(() => {
    if (
      type === CalendarSelectTypes.RANGE_FROM_SELECT ||
      type === CalendarSelectTypes.RANGE_TO_SELECT
    ) {
      return {
        ...(value?.from && { from: dayjs(value.from) }),
        ...(value?.to && { to: dayjs(value.to) }),
      };
    }
    return undefined;
  }, [type, value]);

  const valuesToDisplay = useMemo(() => {
    const values =
      type === CalendarSelectTypes.SINGLE_SELECT
        ? [value]
        : type === CalendarSelectTypes.RANGE_FROM_SELECT
        ? [value?.from]
        : type === CalendarSelectTypes.RANGE_TO_SELECT
        ? [value?.to]
        : type === CalendarSelectTypes.MULTI_SELECT
        ? value
        : [];

    return (values || []).filter((v): v is Date => !!v);
  }, [type, value]);

  const normalizedLimits = useMemo(() => {
    return limits
      ? {
          minDate: limits.minDate ? dayjs(limits.minDate) : undefined,
          maxDate: limits.maxDate ? dayjs(limits.maxDate) : undefined,
        }
      : undefined;
  }, [limits]);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div style={{ width }}>
        <SelectField
          ref={selectElementRef}
          focus={open}
          onClick={() => setOpen((isOpen) => !isOpen)}
          theme={themeSettings}
          {...rest}
        >
          <SelectLabel
            theme={themeSettings}
            style={{ opacity: valuesToDisplay.length ? '100%' : '50%' }}
            aria-label="Value"
          >
            <>{getCalendarSelectedItemsDisplayValue(valuesToDisplay, formatter) ?? placeholder}</>
          </SelectLabel>
          <DateIcon
            iconColor={themeSettings.general.popover.input.textColor}
            aria-label="Calendar icon"
            style={{ marginRight: '3px' }}
          />
        </SelectField>
        <Popper open={open} anchorEl={selectElementRef.current}>
          <CalendarDateSelector
            selectorMode={getCalendarDateSelectorMode(type)}
            limit={normalizedLimits}
            selectedDate={selectedDate}
            selectedDates={selectedDates}
            selectedDateRange={selectedDateRange}
            onDateChanged={handleDateChange}
            onDatesChanged={handleDatesChange}
            onDateRangeChanged={handleDateRangeChange}
          />
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
