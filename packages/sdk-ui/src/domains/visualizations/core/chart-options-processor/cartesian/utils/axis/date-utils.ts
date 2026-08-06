import { DateLevels } from '@sisense/sdk-data';
import merge from 'deepmerge';

import { getDataOptionGranularity } from '@/domains/visualizations/core/chart-data-options/utils';
import { TranslatableError } from '@/infra/translation/translatable-error';

import { StyledColumn } from '../../../../chart-data-options/types';
import { fontStyleDefault, lineColorDefault, xAxisDefaults } from '../../../defaults/cartesian.js';
import { Axis, AxisSettings, getDefaultDateFormat } from '../../../translations/axis-section.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Nominal tick intervals for granularities whose real length varies between periods.
 * They drive the minimum axis range and the detection of gaps in the data. Because
 * they are approximations, month, quarter, and year axes also receive explicit
 * calendar tick positions so labels stay on real period boundaries.
 */
export const CONTINUOUS_INTERVAL_MS = {
  years: 364 * MS_PER_DAY,
  quarters: 91.72 * MS_PER_DAY,
  months: 28 * MS_PER_DAY,
} as const;

const CALENDAR_GRANULARITIES = new Set<string>([
  DateLevels.Years,
  DateLevels.Quarters,
  DateLevels.Months,
]);

/**
 * Checks whether a granularity has periods of varying length and therefore has to be
 * advanced by calendar arithmetic rather than by a fixed number of milliseconds.
 *
 * @param granularity - The date granularity level
 * @returns True for month, quarter, and year granularities
 */
export const isCalendarContinuousGranularity = (granularity: string): boolean =>
  CALENDAR_GRANULARITIES.has(granularity);

/**
 * Maps date granularity levels to their corresponding intervals in milliseconds
 *
 * @param granularity - The date granularity level
 * @returns Interval in milliseconds for the given granularity
 */
export const getInterval = (granularity: string): number => {
  switch (granularity) {
    case DateLevels.Years:
      return CONTINUOUS_INTERVAL_MS.years;
    case DateLevels.Quarters:
      return CONTINUOUS_INTERVAL_MS.quarters;
    case DateLevels.Months:
      return CONTINUOUS_INTERVAL_MS.months;
    case DateLevels.Weeks:
      return 604800000;
    case DateLevels.Days:
      return 86400000;
    case DateLevels.AggHours:
    case DateLevels.Hours:
      return 3600000;
    case DateLevels.AggMinutesRoundTo30:
    case DateLevels.MinutesRoundTo30:
      return 1800000;
    case DateLevels.AggMinutesRoundTo15:
    case DateLevels.MinutesRoundTo15:
      return 900000;
    case DateLevels.AggMinutesRoundTo1:
      return 60000;
  }
  console.warn('Unsupported level');
  return 0;
};

/**
 * Truncates a timestamp to the UTC start of the calendar period that contains it.
 *
 * @param timestamp - Timestamp in milliseconds
 * @param granularity - The date granularity level
 * @returns Timestamp of the first millisecond of the containing period
 */
const getPeriodStartUtc = (timestamp: number, granularity: string): number => {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  switch (granularity) {
    case DateLevels.Years:
      return Date.UTC(year, 0, 1);
    case DateLevels.Quarters:
      return Date.UTC(year, Math.floor(month / 3) * 3, 1);
    case DateLevels.Months:
    default:
      return Date.UTC(year, month, 1);
  }
};

/**
 * Advances a timestamp by exactly one period of the given granularity.
 *
 * Month, quarter, and year granularities step in UTC calendar arithmetic and keep the
 * time of day and the day of month. Days beyond the end of the target month are clamped
 * to its last day, so advancing January 31 by a month lands on February 28 rather than
 * spilling into March.
 *
 * All other granularities have a constant length and advance by their fixed interval.
 *
 * @param tickValue - Timestamp in milliseconds to advance from
 * @param granularity - The date granularity level
 * @returns Timestamp of the next period, in milliseconds
 */
export const getNextContinuousDate = (tickValue: number, granularity: string): number => {
  const date = new Date(tickValue);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const ms = date.getUTCMilliseconds();

  const atClampedDay = (targetYear: number, targetMonth: number): number => {
    const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    return Date.UTC(
      targetYear,
      targetMonth,
      Math.min(day, lastDayOfTargetMonth),
      hours,
      minutes,
      seconds,
      ms,
    );
  };

  switch (granularity) {
    case DateLevels.Years:
      return atClampedDay(year + 1, month);
    case DateLevels.Quarters:
      return atClampedDay(year, month + 3);
    case DateLevels.Months:
      return atClampedDay(year, month + 1);
    default:
      return tickValue + getInterval(granularity);
  }
};

/**
 * Builds the list of tick positions covering a range, one per calendar period.
 *
 * Both bounds are normalized to the start of their containing period, so the ticks share
 * the timestamps of the plotted data points instead of drifting away from them as a fixed
 * millisecond interval would.
 *
 * @param min - Timestamp of the earliest data point, in milliseconds
 * @param max - Timestamp of the latest data point, in milliseconds
 * @param granularity - The date granularity level
 * @returns Tick timestamps in ascending order, or undefined when the granularity has
 * fixed-length periods or the bounds are not finite
 */
export const getCalendarTickPositions = (
  min: number,
  max: number,
  granularity: string,
): number[] | undefined => {
  if (
    !isCalendarContinuousGranularity(granularity) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return undefined;
  }

  let cursor = getPeriodStartUtc(min, granularity);
  const endPeriod = getPeriodStartUtc(max, granularity);
  const ticks: number[] = [];
  const maxTicks = 10000;

  while (cursor <= endPeriod && ticks.length < maxTicks) {
    ticks.push(cursor);
    const next = getNextContinuousDate(cursor, granularity);
    if (next <= cursor) {
      break;
    }
    cursor = next;
  }

  return ticks.length > 0 ? ticks : undefined;
};

/**
 * Creates a date formatter function for chart axis labels
 *
 * @param category - The styled column containing date formatting information
 * @param dateFormatter - Optional external date formatter function
 * @returns A function that formats timestamps as strings
 */
export const getDateFormatter = (
  category: StyledColumn,
  dateFormatter?: (date: Date, format: string) => string,
) => {
  const granularity = getDataOptionGranularity(category);
  const format = category?.dateFormat || getDefaultDateFormat(granularity);
  if (!dateFormatter || !format) return (time: number) => `${time}`;

  return function (time: number) {
    return dateFormatter(new Date(time), format);
  };
};

/**
 * Builds X-axis settings for datetime axes with continuous data
 *
 * @param axis - Primary axis configuration
 * @param category - The styled column for date formatting
 * @param values - Array of numeric timestamp values
 * @param dateFormatter - Optional date formatter function
 * @returns Array of axis settings for datetime X-axis
 */
export const getXAxisDatetimeSettings = (
  axis: Axis,
  category: StyledColumn,
  values: number[],
  dateFormatter?: (date: Date, format: string) => string,
): AxisSettings[] => {
  const granularity = getDataOptionGranularity(category);
  const calcMinInterval = (
    acc: { minInterval: number; lastValue: number | undefined },
    value: number,
  ) => {
    if (!acc.lastValue) {
      return { ...acc, lastValue: value };
    }
    const minInterval = Math.min(value - acc.lastValue, acc.minInterval);
    return { minInterval, lastValue: value };
  };

  const min = values[0];
  const max = values[values.length - 1];
  let interval = granularity
    ? getInterval(granularity)
    : values.reduce<{ minInterval: number; lastValue: number | undefined }>(calcMinInterval, {
        minInterval: (max - min) / (values.length - 1),
        lastValue: undefined,
      }).minInterval;
  // Normalize month-like gaps to the nominal continuous-month interval.
  if (interval < 30 * MS_PER_DAY && interval > 25 * MS_PER_DAY) {
    interval = CONTINUOUS_INTERVAL_MS.months;
  }

  if (values.length > 1 && (isNaN(interval) || interval === 0))
    throw new TranslatableError('errors.tickIntervalCalculationFailed');

  let formatter;
  const format = category?.dateFormat || getDefaultDateFormat(granularity);
  if (dateFormatter && format) {
    formatter = function (this: any) {
      const that: { value: number } = this as { value: number };
      return dateFormatter(new Date(that.value), format);
    };
  }
  const dateTimeLabelFormats = {
    millisecond: '%A, %b %e, %H:%M:%S.%L',
    second: '%A, %b %e, %H:%M:%S',
    minute: '%A, %b %e, %H:%M',
    hour: '%A, %b %e, %H:%M',
    day: '%A, %b %e, %Y',
    week: 'Week from %A, %b %e, %Y',
    month: '%B %Y',
    year: '%Y',
  };

  const tickPositions =
    granularity && Number.isFinite(min) && Number.isFinite(max)
      ? getCalendarTickPositions(min, max, granularity)
      : undefined;

  return [
    merge(xAxisDefaults, {
      type: 'datetime',
      title: {
        enabled: axis.enabled && axis.titleEnabled,
        text: axis.title,
      },
      dateTimeLabelFormats,
      gridLineDashStyle: 'Dot',
      gridLineWidth: axis.enabled && axis.gridLine ? 1 : 0, // 0 to disable the grid line
      gridLineColor: lineColorDefault,
      tickWidth: 0,
      lineColor: lineColorDefault,
      lineWidth: 1,
      labels: {
        ...(formatter && { formatter }),
        overflow: 'none',
        enabled: axis.enabled && axis.labels,
        autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
        style: fontStyleDefault,
      },
      min: min,
      max: max,
      // tickInterval still drives the minimum range and gap detection, while tickPositions,
      // when present, determines where labels are actually placed.
      tickInterval: interval,
      minTickInterval: interval,
      ...(tickPositions && { tickPositions }),
      tickmarkPlacement: 'on',
      startOnTick: true,
      endOnTick: true,
      startOfWeek: 4,
      showFirstLabel: true,
      showLastLabel: true,
      minRange: interval,
      isDate: true,
    }),
  ];
};
