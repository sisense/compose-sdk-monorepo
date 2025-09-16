import { TextStyle } from './types';
import { DateLevels } from '@sisense/sdk-data';
import { CategoricalXValues } from '../../chart-data/types';

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
};

export type StackLabel = {
  style: TextStyle;
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
