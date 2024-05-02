import dayjs from 'dayjs';
import { StyledDatePicker } from './styled-date-picker.js';
import { useThemeContext } from '../../../../theme-provider/index.js';
import { CalendarHeader } from './calendar-header.js';
import { ButtonId, QuickDateSelectionButtons } from './quick-date-selection-buttons.js';
import { calculateNewDateRange } from './date-range-calculator.js';

export type SelectorMode = 'fromSelector' | 'toSelector' | 'pointSelector';

export type DateRangeLimits = {
  maxDate?: dayjs.Dayjs;
  minDate?: dayjs.Dayjs;
};

type DayjsDateRange = {
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
};

export type CalendarDateSelectorProps = {
  selectorMode: SelectorMode;
  limit?: DateRangeLimits;
  onDateRangeChanged?: (dateRange: DayjsDateRange) => void;
  onSelectorModeChanged?: (newSelectorMode: SelectorMode) => void;
  selectedDateRange?: DayjsDateRange;
  onDateChanged?: (selectedDate: dayjs.Dayjs) => void;
  selectedDate?: dayjs.Dayjs;
};

export function CalendarDateSelector({
  selectedDateRange,
  limit,
  onDateRangeChanged,
  selectorMode,
  onSelectorModeChanged,
  onDateChanged,
  selectedDate,
}: CalendarDateSelectorProps) {
  const onDateSelected = (selectedDate: dayjs.Dayjs) => {
    if (selectorMode === 'pointSelector' && onDateChanged) {
      onDateChanged(selectedDate);
    } else if (limit && onDateRangeChanged && onSelectorModeChanged && selectedDateRange) {
      onDateRangeChanged?.(
        calculateNewDateRange(
          { from: selectedDateRange.from, to: selectedDateRange.to },
          selectedDate,
          selectorMode,
        ),
      );
      onSelectorModeChanged(selectorMode === 'fromSelector' ? 'toSelector' : 'fromSelector');
    }
  };

  const { themeSettings } = useThemeContext();
  const startDate = selectedDateRange?.from.toDate();
  const endDate = selectedDateRange?.to.toDate();
  const minDate = limit?.minDate?.toDate();
  const maxDate = limit?.maxDate?.toDate();
  const buttons = [minDate && 'earliest', 'today', maxDate && 'latest'].filter(
    (elt) => elt !== undefined,
  ) as ButtonId[];
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: themeSettings.general.backgroundColor,
      }}
      aria-label="date range filter calendar container"
    >
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
            : endDate
        }
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
    </div>
  );
}
