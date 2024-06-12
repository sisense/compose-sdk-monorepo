import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { SelectorMode } from './calendar-date-selector';
import { CalendarDateSelector } from './calendar-date-selector';
import { DEFAULT_FORMAT } from '../consts';
import { DateFilterRange } from '../types';
import Popover from '@mui/material/Popover';
import { DateRangeFieldButton, TriangleIndicator } from '../../common';
import { useThemeContext } from '../../../../theme-provider';

const DATE_RANGE = 'date-range';

export type { DateFilterRange };
/**
 * Props for {@link DateFilter}
 *
 * @internal
 */
export type DateRangeFilterProps = {
  /**
   * Callback function that is called when the date range is changed.
   *
   * @param filter - Date range filter
   */
  onChange: (filter: DateFilterRange) => void;
  /**
   * Selected date range.
   */
  value: DateFilterRange['filter'];
  /**
   * Limit of the date range that can be selected.
   */
  limit?: {
    maxDate: string;
    minDate: string;
  };
  /**
   * Whether this is a dependent filter.
   */
  isDependent?: boolean;

  /**
   * The variant of the date range field button.
   * To be compatible with the old DateRangeFilterTile.
   *
   * TODO: Remove this prop when the old DateRangeFilterTile is deprecated.
   * @internal
   * @default 'grey'
   */
  variant?: 'white' | 'grey';

  /**
   * Whether the filter is disabled.
   *
   * @internal
   */
  disabled?: boolean;
};

/**
 * Date Filter component for filtering data by date range.
 *
 * @example
 * React example of configuring the limit date range as well as the selected date range.
 * ```tsx
 * const [{ filter }, setDateRangeFilter] = useState<DateFilterRange>({
 *   type: 'date-range',
 *   filter: {
 *     from: '2019-06-08',
 *     to: '2019-06-16',
 *   },
 * });
 *
 * return (
 *   <DateFilter
 *     onChange={(dateFilter) => {
 *       setDateRangeFilter(dateFilter);
 *     }}
 *     limit={{
 *       minDate: '2019-06-05',
 *       maxDate: '2019-06-25',
 *     }}
 *     value={{ from: filter.from, to: filter.to }}
 *   />
 * );
 * ```
 *
 * <img src="media://date-filter-example-1.png" width="800px" />
 * @param props - Date Filter Props
 * @returns Date Filter component
 * @internal
 */
export function DateFilter(props: DateRangeFilterProps) {
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDateRangeSelectorOpen, setIsDateRangeSelectorOpen] = useState<boolean>(false);

  const closeDateRangeSelector = () => {
    setIsDateRangeSelectorOpen(false);
  };

  const id = isDateRangeSelectorOpen ? 'simple-popover' : undefined;
  const { from, to } = props.value;
  const fromVal = dayjs((from || props.limit?.minDate) as string);
  const toVal = dayjs((to || props.limit?.maxDate) as string);
  const dateRangeLimits = {
    maxDate: dayjs(props.limit?.maxDate),
    minDate: dayjs(props.limit?.minDate),
  };
  const [activeSelectorMode, setActiveSelectorMode] = useState<SelectorMode>('fromSelector');

  const openDateRangeSelector = (selectorMode: SelectorMode) => {
    setActiveSelectorMode(selectorMode);
    setIsDateRangeSelectorOpen(true);
  };

  const { themeSettings } = useThemeContext();
  const buttonsVariant = props.variant || 'grey';

  return (
    <div>
      {props.isDependent && (
        <div className="csdk-h-[20px]">
          <TriangleIndicator />
        </div>
      )}
      <div
        aria-label="date range filter"
        className="csdk-w-fit csdk-flex csdk-flex-wrap"
        ref={filterContainerRef}
      >
        <DateRangeFieldButton
          value={fromVal ? fromVal.format(DEFAULT_FORMAT) : 'Select'}
          label="From"
          onClick={() => openDateRangeSelector('fromSelector')}
          isActive={isDateRangeSelectorOpen && activeSelectorMode === 'fromSelector'}
          theme={themeSettings}
          variant={buttonsVariant}
          disabled={props.disabled}
        />
        <DateRangeFieldButton
          onClick={() => openDateRangeSelector('toSelector')}
          value={toVal ? toVal.format(DEFAULT_FORMAT) : 'Today'}
          label="To"
          isActive={isDateRangeSelectorOpen && activeSelectorMode === 'toSelector'}
          theme={themeSettings}
          variant={buttonsVariant}
          disabled={props.disabled}
        />
        <Popover
          id={id}
          open={isDateRangeSelectorOpen}
          anchorEl={filterContainerRef.current}
          onClose={closeDateRangeSelector}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <CalendarDateSelector
            selectorMode={activeSelectorMode}
            onDateRangeChanged={(newDateRange) => {
              props.onChange({
                type: DATE_RANGE,
                filter: {
                  from: newDateRange.from.format(DEFAULT_FORMAT),
                  to: newDateRange.to.format(DEFAULT_FORMAT),
                },
              });
            }}
            onSelectorModeChanged={(newSelectorMode) => {
              setActiveSelectorMode(newSelectorMode);
            }}
            selectedDateRange={{ from: fromVal, to: toVal }}
            limit={dateRangeLimits}
          />
        </Popover>
      </div>
    </div>
  );
}
