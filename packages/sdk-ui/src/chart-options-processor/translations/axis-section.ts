/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  xAxisDefaults,
  yAxisDefaults,
  fontStyleDefault,
  lineColorDefault,
  stackTotalFontStyleDefault,
} from '../defaults/cartesian';
import merge from 'deepmerge';
import { Stacking, Style } from '../chart-options-service';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from './number-format-config';
import { DateLevels, isNumber } from '@sisense/sdk-data';
import {
  ChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
  StyledColumn,
} from '../../chart-data-options/types';
import { ChartType, CompleteNumberFormatConfig, CompleteThemeSettings } from '../../types';
import { isPolar } from './types';
import { CategoricalXValues } from '../../chart-data/types';
import { AxisClipped } from './translations-to-highcharts';
import { getDataOptionGranularity } from '@/chart-data-options/utils';
import { TranslatableError } from '@/translation/translatable-error';

export type Axis = {
  enabled?: boolean;
  titleEnabled?: boolean;
  title?: string | null;
  gridLine?: boolean;
  labels?: boolean;
  type?: 'linear' | 'logarithmic';
  min?: number | null;
  max?: number | null;
  tickInterval?: number | null;
};

export type AxisMinMax = { min: number; max: number };

export type AxisOrientation = 'horizontal' | 'vertical';

export interface AxisLabelsFormatterContextObject {
  value: string | number;
  axis: {
    categories: (string | number)[];
  };
}

export type AxisSettings = {
  type?: 'linear' | 'logarithmic';
  title?: {
    text?: string | null;
    enabled?: boolean;
    margin?: number;
    style?: Style;
  };
  gridLineDashStyle?: 'Dot';
  gridLineWidth?: number;
  gridLineColor?: string;
  tickWidth?: number;
  lineColor?: string;
  lineWidth?: number;
  labels?: {
    overflow?: 'none' | 'justify';
    enabled?: boolean;
    autoRotation?: number[];
    style?: Style;
    rotation?: number;
    formatter?: (this: AxisLabelsFormatterContextObject) => string;
  };
  min?: number | null;
  max?: number | null;
  minPadding?: number;
  maxPadding?: number;
  tickInterval?: number | null;
  categories?: string[];
  opposite?: boolean;
  plotBands?: AxisPlotBand[];
  plotLines?: AxisPlotLine[];
  tickmarkPlacement?: string;
  minorGridLineWidth?: number;
  minorTickWidth?: number;
  startOnTick?: boolean;
  endOnTick?: boolean;
  tickColor?: string;
  tickLength?: number;
  minorTickColor?: string;
  minorTickLength?: number;
  minorGridLineColor?: string;
  minorGridLineDashStyle?: string;
  stackLabels?: StackLabel;
  showLastLabel?: boolean;
  visible?: boolean;
};

export type StackLabel = {
  style: Style;
  crop: boolean;
  allowOverlap: boolean;
  enabled: boolean;
  rotation: number;
  labelrank: number;
  x?: number;
  y?: number;
};

export type PlotBand = { text: string; from: number; to: number };

export type AxisPlotLine = {
  color: string;
  dashStyle: string;
  width: number;
  value: number;
};

export type AxisPlotBand = {
  from: number;
  to: number;
  color?: string;
  label?: {
    text: string;
    x: number;
    y: number;
    style?: Style;
  };
};

export const getCategoricalCompareValue = (value: CategoricalXValues): number => {
  // there is only one axis and rawValue is a number
  if (value.compareValues) {
    return value.compareValues[0] as number;
  }
  return NaN;
};

const getInterval = (granularity: string) => {
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

export const getDefaultDateFormat = (granularity?: string) => {
  if (granularity === undefined) return undefined;

  switch (granularity) {
    case DateLevels.Years:
      return 'yyyy';
    case DateLevels.Quarters:
      return 'yyyy Q';
    case DateLevels.Months:
      return 'MM/yyyy';
    case DateLevels.Weeks:
      return 'ww yyyy';
    case DateLevels.Days:
      return 'M/d/yy';
    case DateLevels.AggHours:
      return 'HH';
    case DateLevels.Hours:
      return 'M/d/yy HH';
    case DateLevels.AggMinutesRoundTo30:
      return 'HH:mm';
    case DateLevels.MinutesRoundTo30:
      return 'HH:mm';
    case DateLevels.AggMinutesRoundTo15:
      return 'HH:mm';
    case DateLevels.MinutesRoundTo15:
      return 'HH:mm';
    case DateLevels.AggMinutesRoundTo1:
      return 'HH:mm';
    case DateLevels.Minutes:
      return 'HH:mm';
    case DateLevels.Seconds:
      return 'HH:mm:ss';
  }
  console.warn('Unsupported level');
  return 'M/d/yy HH';
};

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

export const getXAxisSettings = (
  axis: Axis,
  axis2: Axis | undefined,
  categories: string[],
  plotBands: PlotBand[],
  xAxisOrientation: AxisOrientation,
  dataOptions: ChartDataOptionsInternal,
  chartType: ChartType,
): AxisSettings[] => {
  const plotBandsSettings = (plotBands || []).map((p) => ({
    isPlotBand: true,
    from: p.from,
    to: p.to,
    label: {
      text: p.text,
      y: -5,
      style: {
        ...fontStyleDefault,
        width: '70px',
        textOverflow: 'ellipsis',
      },
      ...(xAxisOrientation === 'vertical' && {
        align: 'right',
        x: 5,
        textAlign: 'left',
        y: 0,
      }),
    },
  }));
  const plotLinesArray: AxisPlotLine[] = (plotBands || [])
    .filter((p) => p.from > 0)
    .map((p) => ({
      color: '#C0D0E0',
      dashStyle: 'shortDot',
      width: 1,
      value: p.from,
    }));
  const cartesianDataOptions = dataOptions as CartesianChartDataOptionsInternal;
  const x1 = cartesianDataOptions.x[cartesianDataOptions.x.length - 1];
  const isPolarChart = isPolar(chartType);

  let array: AxisSettings[] = [
    merge(xAxisDefaults, {
      type: axis.type,
      title: {
        enabled: axis.enabled && axis.titleEnabled,
        text: axis.title,
        // Places the polar chart axis title at the top
        ...(isPolarChart && {
          textAlign: 'center',
          align: 'high',
          y: -25,
        }),
      },
      gridLineDashStyle: 'Dot',
      gridLineWidth: axis.enabled && axis.gridLine ? 1 : 0, // 0 to disable the grid line
      gridLineColor: lineColorDefault,
      tickWidth: 0,
      lineColor: lineColorDefault,
      lineWidth: 1,
      labels: {
        enabled: axis.enabled && axis.labels,
        style: fontStyleDefault,
        ...(isPolarChart && { rotation: 0 }),
        formatter: function () {
          const that: { value: string } = this as unknown as { value: string };
          if (!x1 || !isNumber(x1?.column.type) || isNaN(parseFloat(that.value))) {
            return that.value;
          }
          return applyFormatPlainText(
            getCompleteNumberFormatConfig(x1?.numberFormatConfig),
            parseFloat(that.value),
          );
        },
      },
      min: axis.min,
      max: axis.max,
      tickInterval: axis.tickInterval,
      categories,
      plotBands: plotBandsSettings,
      plotLines: plotLinesArray,
      tickmarkPlacement: 'on',
    }),
  ];
  if (axis2) {
    // X2 doesn't have gridLine, labels, min, max and tickInterval
    array = array.concat(
      merge(xAxisDefaults, {
        title: {
          enabled: axis2.enabled && axis2.titleEnabled,
          text: axis2.title,
        },
        categories,
        opposite: true,
        gridLineWidth: 0,
        tickWidth: 0,
        lineWidth: 0,
      }),
    );
  }
  return array;
};

export const getYAxisSettings = (
  axis: Axis,
  axis2: Axis | undefined,
  axisMinMax: AxisMinMax,
  axis2MinMax: AxisMinMax | undefined,
  showTotal: boolean,
  totalLabelRotation: number,
  dataOptions: ChartDataOptionsInternal,
  stacking: Stacking | undefined,
  themeSettings?: CompleteThemeSettings,
): [AxisSettings[], AxisClipped[]] => {
  const cartesianChartDataOptions: CartesianChartDataOptionsInternal =
    dataOptions as CartesianChartDataOptionsInternal;
  const y1NumberFormatConfig = getCompleteNumberFormatConfig(
    cartesianChartDataOptions.y.find(({ showOnRightAxis }) => !showOnRightAxis)?.numberFormatConfig,
  );
  const y2NumberFormatConfig = getCompleteNumberFormatConfig(
    cartesianChartDataOptions.y.find(({ showOnRightAxis }) => showOnRightAxis)?.numberFormatConfig,
  );
  const axisClipped = [
    { minClipped: !!(axis.enabled && axis.min), maxClipped: !!(axis.enabled && axis.max) },
  ];

  function getLabelsFormatter(
    numberFormatConfig: CompleteNumberFormatConfig,
    stacking?: Stacking,
    isTotal = false,
  ) {
    return function (this: { value: number; total: number }) {
      const formattedValue = applyFormatPlainText(
        numberFormatConfig,
        isTotal ? this.total : this.value,
      );
      return stacking === 'percent' ? `${formattedValue}%` : formattedValue;
    };
  }

  const array: AxisSettings[] = [
    merge(yAxisDefaults, {
      type: axis.type,
      title: { enabled: axis.enabled && axis.titleEnabled, text: axis.title },
      gridLineDashStyle: 'Dot',
      gridLineWidth: axis.enabled && axis.gridLine ? 1 : 0, // 0 to disable the grid line
      gridLineColor: lineColorDefault,
      tickWidth: 0,
      lineColor: lineColorDefault,
      lineWidth: 1,
      labels: {
        enabled: axis.enabled && axis.labels,
        style: fontStyleDefault,
        formatter: getLabelsFormatter(y1NumberFormatConfig, stacking),
      },
      startOnTick: axis.enabled && axis.min ? false : true,
      ...(axis.min && { minPadding: 0 }),
      ...(axis.max && { maxPadding: 0 }),
      min: axis.enabled ? axis.min ?? axisMinMax.min : null,
      max: axis.enabled ? axis.max ?? axisMinMax.max : null,
      tickInterval: axis.enabled ? axis.tickInterval : null,
      stackLabels: {
        enabled: showTotal,
        formatter: getLabelsFormatter(y1NumberFormatConfig, 'normal', true),
        style: {
          ...stackTotalFontStyleDefault,
          ...(themeSettings ? { color: themeSettings.typography.primaryTextColor } : null),
        },
        rotation: totalLabelRotation ?? 0,
      },
    }),
  ];

  if (axis2MinMax) {
    axisClipped.push({
      minClipped: !!(axis2?.enabled && axis2.min),
      maxClipped: !!(axis2?.enabled && axis2.max),
    });

    const axis2MinMaxOptions = {
      startOnTick: axis2?.enabled && axis2.min ? false : true,
      min: axis2?.enabled ? axis2.min || axis2MinMax.min : null,
      max: axis2?.enabled ? axis2.max || axis2MinMax.max : null,
    };

    const axis2OtherOptions = axis2?.enabled
      ? {
          opposite: true,
          gridLineWidth: 0,
          title: {
            enabled: axis2.enabled && axis2.titleEnabled,
            text: axis2.title,
          },
          labels: {
            enabled: axis2.enabled && axis2.labels,
            style: fontStyleDefault,
            formatter: getLabelsFormatter(y2NumberFormatConfig, stacking),
          },
          tickInterval: axis2.enabled ? axis2.tickInterval : null,
          stackLabels: {
            enabled: showTotal,
            formatter: getLabelsFormatter(y2NumberFormatConfig, 'normal', true),
            style: {
              ...stackTotalFontStyleDefault,
              ...(themeSettings ? { color: themeSettings.typography.primaryTextColor } : null),
            },
            rotation: totalLabelRotation ?? 0,
          },
        }
      : ({ visible: false } as AxisSettings);

    array.push(
      merge(yAxisDefaults, {
        ...axis2MinMaxOptions,
        ...axis2OtherOptions,
      } as AxisSettings),
    );
  }
  return [array, axisClipped];
};
