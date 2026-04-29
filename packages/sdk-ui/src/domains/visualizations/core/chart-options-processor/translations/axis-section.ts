import { DateLevels } from '@sisense/sdk-data';

import { HighchartsGradientColorObject } from '@/shared/utils/gradient';

import { CategoricalXValues } from '../../chart-data/types';
import { TextStyle } from './types';

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

/**
 * Subset of the Highcharts axis `afterSetExtremes` event payload used for navigator scroll persistence.
 */
export type NavigatorAxisSetExtremesEvent = {
  min: number;
  max: number;
  trigger?: string;
};

export type AxisSettings = {
  type?: 'linear' | 'logarithmic';
  title?: {
    text?: string | null;
    enabled?: boolean;
    margin?: number;
    style?: TextStyle;
  };
  gridLineDashStyle?: 'Dot';
  gridLineWidth?: number;
  gridLineColor?: string;
  tickWidth?: number;
  lineColor?: string;
  lineWidth?: number;
  offset?: number;
  labels?: {
    overflow?: 'none' | 'justify';
    enabled?: boolean;
    autoRotation?: number[];
    style?: TextStyle;
    rotation?: number;
    y?: number;
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
  accessibility?: {
    description?: string;
    rangeDescription?: string;
  };
  events?: {
    afterSetExtremes?: (e: NavigatorAxisSetExtremesEvent) => void;
  };
};

export type StackLabel = {
  style?: TextStyle;
  borderColor?: string | HighchartsGradientColorObject;
  borderRadius?: number;
  borderWidth?: number;
  backgroundColor?: string | HighchartsGradientColorObject;
  align?: 'center' | 'left' | 'right';
  textAlign?: 'center' | 'left' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  animation?: {
    defer?: number;
  };
  crop?: boolean;
  allowOverlap?: boolean;
  enabled?: boolean;
  rotation?: number;
  labelrank?: number;
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
    style?: TextStyle;
  };
};

export const getCategoricalCompareValue = (value: CategoricalXValues): number => {
  // there is only one axis and rawValue is a number
  if (value.compareValues) {
    return value.compareValues[0] as number;
  }
  return NaN;
};

/**
 * Merges a navigator scroll callback into the primary X-axis `afterSetExtremes` handler.
 * Preserves any existing `events` and prior `afterSetExtremes` implementation.
 *
 * @param axes - Axis settings (first entry is treated as the primary X-axis).
 * @param onScrollerChange - Invoked only when extremes change due to the navigator scroller.
 * @returns New axis settings array with the merged handler on the first axis.
 */
export const attachNavigatorScrollerToPrimaryXAxis = (
  axes: readonly AxisSettings[],
  onScrollerChange: (min: number, max: number) => void,
): AxisSettings[] => {
  if (axes.length === 0) {
    return [...axes];
  }
  const primary = axes[0];
  const previousAfterSetExtremes = primary.events?.afterSetExtremes;
  return [
    {
      ...primary,
      events: {
        ...primary.events,
        afterSetExtremes: (e: NavigatorAxisSetExtremesEvent) => {
          previousAfterSetExtremes?.(e);
          if (e.trigger === 'navigator' && typeof e.min === 'number' && typeof e.max === 'number') {
            onScrollerChange(Math.round(e.min), Math.round(e.max));
          }
        },
      },
    },
    ...axes.slice(1),
  ];
};

/**
 * Transformer that merges a navigator scroll callback into the primary X-axis `afterSetExtremes` handler.
 * No-ops when no callback is provided.
 *
 * @param onScrollerChange - Optional callback invoked when the navigator scroller changes extremes.
 * @returns Transformer function over an axis settings array.
 */
export const withScrollerEvent =
  (onScrollerChange?: (min: number, max: number) => void) =>
  (axes: readonly AxisSettings[]): AxisSettings[] =>
    onScrollerChange ? attachNavigatorScrollerToPrimaryXAxis(axes, onScrollerChange) : [...axes];

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
