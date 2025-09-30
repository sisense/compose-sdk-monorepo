import { AreamapChartDesignOptions } from '@/chart/restructured-charts/areamap-chart/types';
import { ChartType } from '../../types';
import {
  LineChartDesignOptions,
  AreaChartDesignOptions,
  BarChartDesignOptions,
  ColumnChartDesignOptions,
  CalendarHeatmapChartDesignOptions,
  PieChartDesignOptions,
  FunnelChartDesignOptions,
  IndicatorChartDesignOptions,
  PolarChartDesignOptions,
  ScatterChartDesignOptions,
  TreemapChartDesignOptions,
  BoxplotChartDesignOptions,
  ScattermapChartDesignOptions,
  AreaRangeChartDesignOptions,
  BaseDesignOptionsType,
} from './design-options';

/**
 * Style configuration for text elements in charts and UI components.
 * Defines the visual appearance and behavior of text rendering.
 */
export type TextStyle = {
  /**
   * Font family name for the text.
   * Examples: 'Arial', 'Helvetica', 'Times New Roman', 'sans-serif'
   */
  fontFamily?: string;
  /**
   * Font size in CSS units (px, em, rem, pt, etc.).
   * Examples: '12px', '1.2em', '16pt'
   */
  fontSize?: string;
  /**
   * Font weight for text rendering.
   * Examples: 'normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'
   */
  fontWeight?: string;
  /**
   * Font style for text rendering.
   * Examples: 'normal', 'italic', 'oblique'
   */
  fontStyle?: string;
  /**
   * Text color in any valid CSS color format.
   * Examples: '#FF0000', 'rgb(255, 0, 0)', 'red', 'rgba(255, 0, 0, 0.5)'
   */
  color?: string;
  /**
   * Text outline/stroke configuration.
   * Defines the outline color and width for text rendering.
   * Examples: '1px solid black', '2px #333'
   */
  textOutline?: string;
  /**
   * CSS pointer-events property for text interaction.
   * Controls how the text responds to mouse events.
   * Examples: 'auto', 'none', 'visible', 'visibleFill', 'visibleStroke'
   */
  pointerEvents?: string;
  /**
   * Text overflow handling behavior.
   * Controls how text is displayed when it exceeds its container.
   * Examples: 'clip', 'ellipsis', 'visible', 'hidden'
   */
  textOverflow?: string;
};

export const POLAR_CHART_TYPES = ['polar'] as const;
export type PolarChartType = (typeof POLAR_CHART_TYPES)[number];

export const CARTESIAN_CHART_TYPES = [
  'line',
  'area',
  'bar',
  'column',
  ...POLAR_CHART_TYPES,
] as const;
/** Cartesian family of chart types @expandType */
export type CartesianChartType = (typeof CARTESIAN_CHART_TYPES)[number];

export const CATEGORICAL_CHART_TYPES = ['pie', 'funnel', 'treemap', 'sunburst'] as const;
/** Categorical family of chart types  @expandType */
export type CategoricalChartType = (typeof CATEGORICAL_CHART_TYPES)[number];

export const SCATTER_CHART_TYPES = ['scatter'] as const;
/** Scatter chart types  @expandType */
export type ScatterChartType = (typeof SCATTER_CHART_TYPES)[number];

export const TABLE_TYPES = ['table'] as const;
/** Table chart types @expandType */
export type TableChartType = (typeof TABLE_TYPES)[number];

/** Table chart types @expandType */
export type TableType = TableChartType;

const INDICATOR_CHART_TYPES = ['indicator'] as const;
/** Indicator chart types @expandType */
export type IndicatorChartType = (typeof INDICATOR_CHART_TYPES)[number];

export const BOXPLOT_CHART_TYPES = ['boxplot'] as const;
/** Boxplot chart types  @expandType */
export type BoxplotChartType = (typeof BOXPLOT_CHART_TYPES)[number];

export const AREAMAP_CHART_TYPES = ['areamap'] as const;
/** Areamap chart types @expandType */
export type AreamapChartType = (typeof AREAMAP_CHART_TYPES)[number];

const IMAGE_CHART_TYPES = ['image'] as const;
export type ImageChartType = (typeof IMAGE_CHART_TYPES)[number];

export const SCATTERMAP_CHART_TYPES = ['scattermap'] as const;
/** Scattermap chart types  @expandType */
export type ScattermapChartType = (typeof SCATTERMAP_CHART_TYPES)[number];

export const CALENDAR_HEATMAP_CHART_TYPES = ['calendar-heatmap'] as const;
/**
 * Calendar heatmap chart types
 *
 * @expandType
 */
export type CalendarHeatmapChartType = (typeof CALENDAR_HEATMAP_CHART_TYPES)[number];

export const RANGE_CHART_TYPES = ['arearange'] as const;
/** AreaRange chart types  @expandType */
export type RangeChartType = (typeof RANGE_CHART_TYPES)[number];

// ChartDataType is the category of data structure for a group of charts,
// e.g. the ChartDataType of both "line" and "bar" charts is "cartesian",
// but a bubble/scatter chart would be a different data type.
export type ChartDataType =
  | 'cartesian'
  | 'categorical'
  | 'scatter'
  | 'table'
  | 'indicator'
  | 'areamap'
  | 'arearange';

/**
 * Design options for a specific chart type
 */
export type DesignOptions<SpecificChartType extends ChartType = ChartType> =
  SpecificChartType extends 'line'
    ? LineChartDesignOptions
    : SpecificChartType extends 'area'
    ? AreaChartDesignOptions
    : SpecificChartType extends 'bar'
    ? BarChartDesignOptions
    : SpecificChartType extends 'column'
    ? ColumnChartDesignOptions
    : SpecificChartType extends 'pie'
    ? PieChartDesignOptions
    : SpecificChartType extends 'funnel'
    ? FunnelChartDesignOptions
    : SpecificChartType extends 'polar'
    ? PolarChartDesignOptions
    : SpecificChartType extends 'indicator'
    ? IndicatorChartDesignOptions
    : SpecificChartType extends 'scatter'
    ? ScatterChartDesignOptions
    : SpecificChartType extends 'treemap'
    ? TreemapChartDesignOptions
    : SpecificChartType extends 'sunburst'
    ? TreemapChartDesignOptions
    : SpecificChartType extends 'boxplot'
    ? BoxplotChartDesignOptions
    : SpecificChartType extends 'areamap'
    ? AreamapChartDesignOptions
    : SpecificChartType extends 'scattermap'
    ? ScattermapChartDesignOptions
    : SpecificChartType extends 'calendar-heatmap'
    ? CalendarHeatmapChartDesignOptions
    : SpecificChartType extends 'arearange'
    ? AreaRangeChartDesignOptions
    : never;

/** A unique identifier for a series to be found in {@link ChartDataOptionsInternal} */
type SeriesId = string;

/**
 * Design options for a chart.
 * This includes global design options and specific design options per series.
 */
export type ChartDesignOptions<SpecificChartType extends ChartType = ChartType> =
  DesignOptions<SpecificChartType>;

/**
 * Design options, limited to the only series relevant options.
 *
 * @internal
 */
export type SeriesDesignOptions = Pick<BaseDesignOptionsType, 'marker'> &
  Pick<LineChartDesignOptions, 'line'>;
export type DesignPerSeries = { designPerSeries: Record<SeriesId, SeriesDesignOptions> };

export const isCartesian = (chartType: ChartType): chartType is CartesianChartType => {
  // Use .find instead of .includes for a more flexible type signature
  return CARTESIAN_CHART_TYPES.find((value) => value === chartType) !== undefined;
};

export const isCategorical = (chartType: ChartType): chartType is CategoricalChartType => {
  // Use .find instead of .includes for a more flexible type signature
  return CATEGORICAL_CHART_TYPES.find((value) => value === chartType) !== undefined;
};

export const isScatter = (chartType: ChartType): chartType is ScatterChartType => {
  // Use .find instead of .includes for a more flexible type signature
  return SCATTER_CHART_TYPES.find((value) => value === chartType) !== undefined;
};

export const isScattermap = (chartType: ChartType): chartType is ScattermapChartType => {
  // Use .find instead of .includes for a more flexible type signature
  return SCATTERMAP_CHART_TYPES.find((value) => value === chartType) !== undefined;
};

export const isIndicator = (chartType: ChartType): chartType is 'indicator' => {
  return INDICATOR_CHART_TYPES.find((value) => value === chartType) !== undefined;
};

export const isPolar = (chartType: ChartType): chartType is PolarChartType => {
  return POLAR_CHART_TYPES.find((value) => value === chartType) !== undefined;
};

export const isTable = (chartType: ChartType | TableType): chartType is TableType => {
  return TABLE_TYPES.find((value) => value === chartType) !== undefined;
};

export const isBoxplot = (chartType: ChartType): chartType is BoxplotChartType => {
  return BOXPLOT_CHART_TYPES.find((value) => value === chartType) !== undefined;
};

export const isAreamap = (chartType: ChartType): chartType is AreamapChartType => {
  return AREAMAP_CHART_TYPES.find((value) => value === chartType) !== undefined;
};

export const isRange = (chartType: ChartType): chartType is RangeChartType => {
  return RANGE_CHART_TYPES.find((value) => value === chartType) !== undefined;
};

export const isCalendarHeatmap = (chartType: ChartType): chartType is CalendarHeatmapChartType => {
  return CALENDAR_HEATMAP_CHART_TYPES.find((value) => value === chartType) !== undefined;
};

export const ALL_CHART_TYPES = [
  ...CARTESIAN_CHART_TYPES,
  ...CATEGORICAL_CHART_TYPES,
  ...SCATTER_CHART_TYPES,
  ...TABLE_TYPES,
  ...INDICATOR_CHART_TYPES,
  ...BOXPLOT_CHART_TYPES,
  ...AREAMAP_CHART_TYPES,
  ...IMAGE_CHART_TYPES,
  ...SCATTERMAP_CHART_TYPES,
  ...CALENDAR_HEATMAP_CHART_TYPES,
  ...RANGE_CHART_TYPES,
] as const;

export type DynamicChartType = (typeof ALL_CHART_TYPES)[number];

/*
export const isImage = (chartType: ChartType): chartType is ImageChartType => {
  return IMAGE_CHART_TYPES.find((value) => value === chartType) !== undefined;
};
*/
