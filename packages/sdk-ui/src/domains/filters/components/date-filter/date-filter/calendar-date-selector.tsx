import { useMemo } from 'react';

import dayjs from 'dayjs';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled/index.js';

import { CalendarHeader } from './calendar-header.js';
import { calculateNewDateRange } from './date-range-calculator.js';
import { ButtonId, QuickDateSelectionButtons } from './quick-date-selection-buttons.js';
import { StyledDatePicker } from './styled-date-picker.js';

const Container = styled.div<Themable>`
  background-color: ${({ theme }) => theme.general.popover.input.datepicker.backgroundColor};
  border-radius: ${({ theme }) => theme.general.popover.input.datepicker.cornerRadius};
  box-shadow: ${({ theme }) => theme.general.popover.input.datepicker.shadow};
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export type SelectorMode = 'fromSelector' | 'toSelector' | 'pointSelector' | 'multiPointsSelector';

export type DateRangeLimits = {
  maxDate?: dayjs.Dayjs;
  minDate?: dayjs.Dayjs;
};

export type DayjsDateRange = {
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
};

export type CalendarDateSelectorProps = {
  selectorMode: SelectorMode;
  limit?: DateRangeLimits;
  selectedDate?: dayjs.Dayjs;
  selectedDates?: dayjs.Dayjs[];
  selectedDateRange?: Partial<DayjsDateRange>;
  onDateChanged?: (selectedDate: dayjs.Dayjs) => void;
  onDatesChanged?: (selectedDates: dayjs.Dayjs[]) => void;
  onDateRangeChanged?: (dateRange: DayjsDateRange) => void;
  onSelectorModeChanged?: (newSelectorMode: SelectorMode) => void;
};

export function CalendarDateSelector({
  selectorMode,
  limit,
  selectedDate,
  selectedDates,
  selectedDateRange,
  onDateChanged,
  onDatesChanged,
  onDateRangeChanged,
  onSelectorModeChanged,
}: CalendarDateSelectorProps) {
  const onDateSelected = (selectedDate: dayjs.Dayjs) => {
    if (selectorMode === 'pointSelector' && onDateChanged) {
      onDateChanged(selectedDate);
    } else if (limit && onDateRangeChanged && selectedDateRange) {
      onDateRangeChanged?.(
        calculateNewDateRange(
          { from: selectedDateRange.from, to: selectedDateRange.to },
          selectedDate,
          selectorMode,
        ),
      );
      onSelectorModeChanged?.(selectorMode === 'fromSelector' ? 'toSelector' : 'fromSelector');
    } else if (selectorMode === 'multiPointsSelector' && onDatesChanged) {
      const existingSelectedDates = selectedDates || [];
      const isDateAlreadySelected = existingSelectedDates.some((existingDate) =>
        existingDate.isSame(selectedDate),
      );
      const updatedSelectedDates = isDateAlreadySelected
        ? existingSelectedDates.filter((existingDate) => !existingDate.isSame(selectedDate))
        : [...existingSelectedDates, selectedDate];
      onDatesChanged(updatedSelectedDates);
    }
  };

  const { themeSettings } = useThemeContext();
  const startDate = selectedDateRange?.from?.toDate();
  const endDate = selectedDateRange?.to?.toDate();
  const minDate = limit?.minDate?.toDate();
  const maxDate = limit?.maxDate?.toDate();
  const buttons = [minDate && 'earliest', 'today', maxDate && 'latest'].filter(
    (elt) => elt !== undefined,
  ) as ButtonId[];

  const highlightDates = useMemo(() => {
    return selectorMode === 'multiPointsSelector' && selectedDates
      ? selectedDates.map((date) => date.toDate())
      : undefined;
  }, [selectorMode, selectedDates]);

  return (
    <Container theme={themeSettings} aria-label="date range filter calendar container">
      {limit && (
        <QuickDateSelectionButtons
          enabledButtons={buttons}
          limit={limit}
          onDateSelected={(selectedDate) => {
            onDateSelected(dayjs(selectedDate));
          }}
        />
      )}
      <StyledDatePicker
        theme={themeSettings}
        selected={
          selectorMode === 'pointSelector'
            ? selectedDate?.toDate()
            : selectorMode === 'fromSelector'
            ? startDate
            : selectorMode === 'toSelector'
            ? endDate
            : null
        }
        highlightDates={highlightDates}
        onChange={(selectedDate) => {
          if (selectedDate instanceof Date) {
            onDateSelected(dayjs(selectedDate));
          }
        }}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        selectsStart={selectorMode === 'fromSelector'}
        selectsEnd={selectorMode === 'toSelector'}
        renderCustomHeader={(headerProps) => <CalendarHeader {...headerProps} />}
        inline
        fixedHeight
        disabledKeyboardNavigation
      />
    </Container>
  );
}
