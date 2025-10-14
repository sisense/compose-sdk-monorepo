import { CalendarDayOfWeek } from '@/chart/restructured-charts/highchart-based-charts/calendar-heatmap-chart/utils';

import {
  CalendarHeatmapViewType,
  Convolution,
  LegendOptions,
  LineOptions,
  ScattermapMarkers,
  SeriesLabels,
  SunburstStyleOptions,
  TotalLabels,
  TreemapStyleOptions,
} from '../../types';
import { Axis } from './axis-section';
import { FunnelDirection, FunnelLabels, FunnelSize, FunnelType } from './funnel-plot-options';
import { Marker } from './marker-section';
import { PieLabels, PieType } from './pie-plot-options';
import { ScatterMarkerSize } from './scatter-plot-options';
import { LineType, StackType } from './translations-to-highcharts';
import { DesignPerSeries, TextStyle } from './types';

type DataLimits = {
  seriesCapacity: number;
  categoriesCapacity: number;
};

export type BaseDesignOptionsType = {
  legend?: LegendOptions;
  seriesLabels?: SeriesLabels;
  lineType: LineType;
  /**
   * @deprecated
   * Use line.width instead
   */
  lineWidth: number;
  marker: Marker;
  xAxis: Axis;
  yAxis: Axis;
  x2Axis?: Axis;
  y2Axis?: Axis;
  autoZoom: {
    enabled: boolean;
    scrollerLocation?: {
      min: number;
      max: number;
    };
  };
  dataLimits: DataLimits;
};

export type CartesianChartDesignOptions = BaseDesignOptionsType & DesignPerSeries;
export type StackableChartDesignOptions = CartesianChartDesignOptions & {
  line?: LineOptions;
  stackType: StackType;
  totalLabels?: TotalLabels;
  itemPadding?: number;
  groupPadding?: number;
  borderRadius?: number | string;
};

export type LineChartDesignOptions = CartesianChartDesignOptions & {
  /** Step type for step line charts: left, center, or right */
  step?: 'left' | 'center' | 'right';
  line?: LineOptions;
};

export type AreaChartDesignOptions = StackableChartDesignOptions;

export type BarChartDesignOptions = StackableChartDesignOptions;

export type ColumnChartDesignOptions = StackableChartDesignOptions;

// todo: remove BaseDesignOptionsType after refactor of `ChartDesignOptions` usage
export type CalendarHeatmapChartDesignOptions = BaseDesignOptionsType & {
  width?: number;
  height?: number;
  viewType: CalendarHeatmapViewType;
  cellSize?: number;
  startOfWeek: CalendarDayOfWeek;
  cellLabels: {
    enabled: boolean;
    style?: TextStyle;
  };
  dayLabels: {
    enabled: boolean;
    style?: TextStyle;
  };
  monthLabels: {
    enabled: boolean;
    style?: TextStyle;
  };
  weekends: {
    enabled: boolean;
    days: CalendarDayOfWeek[];
    cellColor?: string;
    hideValues: boolean;
  };
  pagination: {
    enabled: boolean;
    style?: TextStyle;
    startMonth?: Date;
  };
};

export type PolarType = 'line' | 'area' | 'column';
export type PolarChartDesignOptions = CartesianChartDesignOptions & {
  polarType: PolarType;
  totalLabels?: TotalLabels;
};

export function isPolarChartDesignOptions(
  options: CartesianChartDesignOptions,
): options is PolarChartDesignOptions {
  return 'polarType' in options;
}

export type PieChartDesignOptions = BaseDesignOptionsType & {
  pieType?: PieType;
  pieLabels?: PieLabels;
  convolution?: Convolution;
};

export type FunnelChartDesignOptions = BaseDesignOptionsType & {
  funnelSize?: FunnelSize;
  funnelType?: FunnelType;
  funnelDirection?: FunnelDirection;
  funnelLabels?: FunnelLabels;
};

export type TreemapChartDesignOptions = BaseDesignOptionsType & TreemapStyleOptions;

export type SunburstChartDesignOptions = BaseDesignOptionsType & SunburstStyleOptions;

export type ScatterChartDesignOptions = BaseDesignOptionsType & {
  markerSize?: ScatterMarkerSize;
};

/**
 * Configuration for Table color options
 */
export type TableColorOptions = {
  /**
   * Boolean flag whether to fill with color
   */
  enabled: boolean;
  /**
   * Color used for background fill
   */
  backgroundColor?: string;
  /**
   * Color used for text
   */
  textColor?: string;
};

/**
 * Configuration for Table design options
 *
 */
export type TableDesignOptions = {
  /**
   * Vertical padding around whole table
   * Default value is 20
   *
   */
  paddingVertical?: number;
  /**
   * Horizontal padding around whole table
   * Default value is 20
   *
   */
  paddingHorizontal?: number;
  /**
   * Header options
   */
  header?: {
    /**
     * Color of header
     */
    color?: TableColorOptions;
  };
  /**
   * Columns options
   */
  columns?: {
    /**
     * Alternating color for columns
     */
    alternatingColor?: TableColorOptions;
    /**
     * Modes of columns width
     * 'auto' - all columns will have the same width and fit the table width (no horizontal scroll)
     * 'content' - columns width will be based on content (default option)
     */
    width?: 'auto' | 'content';
  };
  /**
   * Rows options
   */
  rows?: {
    /**
     * Alternating color for rows
     */
    alternatingColor?: TableColorOptions;
  };
};

export type IndicatorStyleType = 'numeric' | 'gauge';
export type NumericIndicatorSubType = 'numericSimple' | 'numericBar';
export type IndicatorSkin = 'vertical' | 'horizontal' | 1 | 2;

/** Configuration options that define components of an indicator chart. */
export type IndicatorComponents = {
  /** The main title of the indicator chart */
  title?: {
    /** Whether the title should be shown */
    shouldBeShown: boolean;
    /** The text of the title */
    text?: string;
  };
  /** The secondary title of the indicator chart to be shown when `secondary` is specified in {@link IndicatorChartDataOptions} */
  secondaryTitle?: {
    /** The text of the secondary title */
    text?: string;
  };
  /** The ticks displayed on the indicator chart */
  ticks?: {
    /** Whether the ticks should be shown */
    shouldBeShown: boolean;
  };
  /** The value labels of the indicator chart */
  labels?: {
    /** Whether the labels should be shown */
    shouldBeShown: boolean;
  };
};

/**
 * Design options for an indicator chart.
 */
export type IndicatorChartDesignOptions<
  IndicatorType extends IndicatorStyleType = IndicatorStyleType,
> = BaseDesignOptionsType & {
  indicatorComponents: IndicatorComponents;
  forceTickerView: boolean;
} & (IndicatorType extends 'gauge' ? GaugeSpecificDesignOptions : NumericSpecificDesignOptions);

export type GaugeSpecificDesignOptions = {
  indicatorType: 'gauge';
  skin: 1 | 2;
  tickerBarHeight?: number;
};

export type NumericSpecificDesignOptions<
  NumericSubtype extends NumericIndicatorSubType = NumericIndicatorSubType,
> = {
  indicatorType: 'numeric';
  numericSubtype: NumericSubtype;
  skin: NumericSubtype extends 'numericSimple' ? 'vertical' | 'horizontal' : never;
};

export type BoxplotType = 'full' | 'hollow';
export type BoxplotChartDesignOptions = BaseDesignOptionsType & {
  boxplotType: BoxplotType;
};

// todo: remove `BaseDesignOptionsType` after refactor of `ChartDesignOptions` usage
export type ScattermapChartDesignOptions = BaseDesignOptionsType & {
  markers: Required<ScattermapMarkers>;
};

export type AreaRangeChartDesignOptions = BaseDesignOptionsType & {
  /** Configuration that defines line style */
  line?: LineOptions;
};
