import { useCallback, useMemo, useRef, useState } from 'react';

import ClickAwayListener from '@mui/material/ClickAwayListener';

import {
  CalendarDateSelector,
  DayjsDateRange,
  isRangeSelectorMode,
  RangeSelectorMode,
  SelectorMode,
} from '@/domains/filters/components/date-filter/date-filter/calendar-date-selector';
import { Popper } from '@/shared/components/popper';

import { CalendarSelectField } from './calendar-select-field';
import { CalendarRangeValue, CalendarSelectLimits } from './types';
import { toLocalCalendarDate, toUtcCalendarDate } from './utils';

type CalendarRangeSelectProps = {
  value?: CalendarRangeValue;
  limits?: CalendarSelectLimits;
  placeholder?: string;
  /** Width of each of the two trigger fields. */
  fieldWidth?: number | string;
  fromLabel: string;
  toLabel: string;
  onChange?: (value: CalendarRangeValue) => void;
};

export function CalendarRangeSelect({
  value,
  limits,
  placeholder,
  fieldWidth,
  fromLabel,
  toLabel,
  onChange,
}: CalendarRangeSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<RangeSelectorMode>('fromSelector');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const openFor = useCallback((mode: RangeSelectorMode) => {
    setActiveMode(mode);
    setOpen(true);
  }, []);

  const handleRangeChange = useCallback(
    (range: Partial<DayjsDateRange>) => {
      onChange?.({
        from: range.from ? toUtcCalendarDate(range.from) : undefined,
        to: range.to ? toUtcCalendarDate(range.to) : undefined,
      });
    },
    [onChange],
  );

  const handleSelectorModeChange = useCallback((mode: SelectorMode) => {
    if (isRangeSelectorMode(mode)) {
      setActiveMode(mode);
    }
  }, []);

  const selectedDateRange = useMemo(
    () => ({
      ...(value?.from && { from: toLocalCalendarDate(value.from) }),
      ...(value?.to && { to: toLocalCalendarDate(value.to) }),
    }),
    [value],
  );

  const normalizedLimits = useMemo(() => {
    return limits
      ? {
          minDate: limits.minDate ? toLocalCalendarDate(limits.minDate) : undefined,
          maxDate: limits.maxDate ? toLocalCalendarDate(limits.maxDate) : undefined,
        }
      : undefined;
  }, [limits]);

  const fromValues = useMemo(() => (value?.from ? [value.from] : []), [value]);
  const toValues = useMemo(() => (value?.to ? [value.to] : []), [value]);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div ref={containerRef} style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ margin: '0 8px 0 0' }}>{fromLabel}</span>
        <div style={{ width: fieldWidth }}>
          <CalendarSelectField
            values={fromValues}
            placeholder={placeholder}
            focus={open && activeMode === 'fromSelector'}
            aria-label={fromLabel}
            onClick={() => openFor('fromSelector')}
          />
        </div>
        <span style={{ margin: '0 8px 0 8px' }}>{toLabel}</span>
        <div style={{ width: fieldWidth }}>
          <CalendarSelectField
            values={toValues}
            placeholder={placeholder}
            focus={open && activeMode === 'toSelector'}
            aria-label={toLabel}
            onClick={() => openFor('toSelector')}
          />
        </div>
        <Popper open={open} anchorEl={containerRef.current} preventClickPropagation={true}>
          <CalendarDateSelector
            selectorMode={activeMode}
            limit={normalizedLimits}
            selectedDateRange={selectedDateRange}
            onDateRangeChanged={handleRangeChange}
            onSelectorModeChanged={handleSelectorModeChange}
          />
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
