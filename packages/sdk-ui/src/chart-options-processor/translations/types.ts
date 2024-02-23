import { ChartType } from '../../types';
import {
  LineChartDesignOptions,
  AreaChartDesignOptions,
  BarChartDesignOptions,
  ColumnChartDesignOptions,
  PieChartDesignOptions,
  FunnelChartDesignOptions,
  IndicatorChartDesignOptions,
  PolarChartDesignOptions,
  ScatterChartDesignOptions,
  TreemapChartDesignOptions,
  BoxplotChartDesignOptions,
  AreamapChartDesignOptions,
  ScattermapChartDesignOptions,
} from './design-options';

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
export type TableType = (typeof TABLE_TYPES)[number];

const INDICATOR_CHART_TYPES = ['indicator'] as const;
/** Indicator chart types @expandType */
export type IndicatorChartType = (typeof INDICATOR_CHART_TYPES)[number];

const BOXPLOT_CHART_TYPES = ['boxplot'] as const;
/** Boxplot chart types  @expandType */
export type BoxplotChartType = (typeof BOXPLOT_CHART_TYPES)[number];

const AREAMAP_CHART_TYPES = ['areamap'] as const;
/** Areamap chart types @expandType */
export type AreamapChartType = (typeof AREAMAP_CHART_TYPES)[number];

const IMAGE_CHART_TYPES = ['image'] as const;
export type ImageChartType = (typeof IMAGE_CHART_TYPES)[number];

export const SCATTERMAP_CHART_TYPES = ['scattermap'] as const;
/** Scattermap chart types  @expandType */
export type ScattermapChartType = (typeof SCATTERMAP_CHART_TYPES)[number];

// ChartDataType is the category of data structure for a group of charts,
// e.g. the ChartDataType of both "line" and "bar" charts is "cartesian",
// but a bubble/scatter chart would be a different data type.
export type ChartDataType =
  | 'cartesian'
  | 'categorical'
  | 'scatter'
  | 'table'
  | 'indicator'
  | 'areamap';

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
    : SpecificChartType extends 'boxplot'
    ? BoxplotChartDesignOptions
    : SpecificChartType extends 'areamap'
    ? AreamapChartDesignOptions
    : SpecificChartType extends 'scattermap'
    ? ScattermapChartDesignOptions
    : never;

/** A unique identifier for a series to be found in {@link ChartDataOptionsInternal} */
type SeriesId = string;

/**
 * Design options for a chart.
 * This includes global design options and specific design options per series.
 */
export type ChartDesignOptions<SpecificChartType extends ChartType = ChartType> = {
  globalDesign: DesignOptions<SpecificChartType>;
  designPerSeries: Record<SeriesId, SeriesDesignOptions>;
};

/**
 * Design options, limited to the only series relevant options.
 * @internal
 */
export type SeriesDesignOptions = Pick<DesignOptions, 'lineWidth' | 'marker'>;

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

/*
export const isImage = (chartType: ChartType): chartType is ImageChartType => {
  return IMAGE_CHART_TYPES.find((value) => value === chartType) !== undefined;
};
*/
