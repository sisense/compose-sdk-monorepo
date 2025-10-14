import { DateLevels } from '@sisense/sdk-data';
import merge from 'deepmerge';

import { getDataOptionGranularity } from '@/chart-data-options/utils';
import { TranslatableError } from '@/translation/translatable-error';

import { StyledColumn } from '../../../../chart-data-options/types';
import { fontStyleDefault, lineColorDefault, xAxisDefaults } from '../../../defaults/cartesian';
import { Axis, AxisSettings, getDefaultDateFormat } from '../../../translations/axis-section';

/**
 * Maps date granularity levels to their corresponding intervals in milliseconds
 *
 * @param granularity - The date granularity level
 * @returns Interval in milliseconds for the given granularity
 */
export const getInterval = (granularity: string): number => {
  switch (granularity) {
    case DateLevels.Years:
      return 31536000000;
    case DateLevels.Quarters:
      return 7884000000;
    case DateLevels.Months:
      return 2592000000;
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
  //TODO look into handling leap years and other exceptions
  if (interval < 30 * 86400000 && interval > 25 * 86400000) {
    interval = 2592000000;
  }

  if (values.length > 1 && (isNaN(interval) || interval === 0))
    throw new TranslatableError('errors.ticIntervalCalculationFailed');

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
      tickInterval: interval,
      minTickInterval: interval,
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
