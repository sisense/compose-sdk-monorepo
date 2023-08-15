/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import dayjs from 'dayjs';
import { StyledDatePicker } from './StyledDatePicker.js';
import { useThemeContext } from '../../../../components/ThemeProvider/index.js';
import { CalendarHeader } from './CalendarHeader.js';
import { QuickDateSelectionButtons } from './QuickDateSelectionButtons.js';
import { calculateNewDateRange } from './date-range-calculator.js';

export type SelectorMode = 'fromSelector' | 'toSelector';

export type DateRangeLimits = {
  maxDate: dayjs.Dayjs;
  minDate: dayjs.Dayjs;
};

type DayjsDateRange = {
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
};

export type CalendarDateSelectorProps = {
  selectorMode: SelectorMode;
  limit: DateRangeLimits;
  onDateRangeChanged: (dateRange: DayjsDateRange) => void;
  onSelectorModeChanged: (newSelectorMode: SelectorMode) => void;
  selectedDateRange: DayjsDateRange;
};

export function CalendarDateSelector({
  selectedDateRange,
  limit,
  onDateRangeChanged,
  selectorMode,
  onSelectorModeChanged,
}: CalendarDateSelectorProps) {
  const onDateSelected = (selectedDate: dayjs.Dayjs) => {
    onDateRangeChanged(
      calculateNewDateRange(
        { from: selectedDateRange.from, to: selectedDateRange.to },
        selectedDate,
        selectorMode,
      ),
    );
    onSelectorModeChanged(selectorMode === 'fromSelector' ? 'toSelector' : 'fromSelector');
  };

  const { themeSettings } = useThemeContext();
  const startDate = selectedDateRange.from.toDate();
  const endDate = selectedDateRange.to.toDate();
  const minDate = limit.minDate.toDate();
  const maxDate = limit.maxDate.toDate();
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
      <QuickDateSelectionButtons
        enabledButtons={
          selectorMode === 'fromSelector' ? ['earliest', 'today'] : ['today', 'latest']
        }
        limit={limit}
        onDateSelected={(selectedDate) => {
          onDateSelected(dayjs(selectedDate));
        }}
      />
      <StyledDatePicker
        theme={themeSettings}
        selected={selectorMode === 'fromSelector' ? startDate : endDate}
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
