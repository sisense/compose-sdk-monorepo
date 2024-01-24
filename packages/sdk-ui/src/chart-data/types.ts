import { Color, NumberFormatConfig } from '../types';
import {
  AreamapChartType,
  IndicatorChartType,
} from '../chart-options-processor/translations/types';
import { ComparableData, Value } from '../chart-data-processor/table-processor';
import { Coordinates } from '../charts/map-charts/scattermap/types';

export type CategoricalXValues = {
  key: string;
  xValues: string[];
  rawValues?: (string | number)[];
  compareValues?: Value[];
};

export type SeriesValueData = {
  value: number;
  blur?: boolean;
  color?: string;
  rawValue?: string | number;
  xValue?: (string | number)[];
  xDisplayValue?: string[];
  xCompareValue?: (string | number)[];
  parent?: string;
};
export type CategoricalSeriesValues = {
  name: string;
  title?: string;
  data: SeriesValueData[];
};

export type BoxplotSeriesValueData = {
  low: number;
  median: number;
  high: number;
  q1: number;
  q3: number;
  outliers: number[];
  blur?: boolean;
};

export type BoxplotSeriesValues = {
  name: string;
  title?: string;
  data: BoxplotSeriesValueData[];
};

export type BoxplotOutliersSeriesValueData = {
  x: number;
  y: number;
  blur?: boolean;
};

export type BoxplotOutliersSeriesValues = {
  name: string;
  title?: string;
  data: BoxplotOutliersSeriesValueData[];
};

export type Column = {
  name: string;
  type: string;
  enabled: boolean;
  numberFormatConfig?: NumberFormatConfig;
};

export type CartesianChartData = {
  type: 'cartesian';
  xAxisCount: number;
  xValues: CategoricalXValues[];
  series: CategoricalSeriesValues[];
};

export type CategoricalChartData = {
  type: 'categorical';
  xAxisCount: number;
  xValues: CategoricalXValues[];
  series: CategoricalSeriesValues[];
};

export interface ScatterDataRow {
  xAxis: ComparableData;
  yAxis: ComparableData;
  breakByPoint?: ComparableData;
  breakByColor?: ComparableData;
  size?: ComparableData;
}

export type ScatterDataTable = ScatterDataRow[];

export type ScatterCategories = string[] | undefined;

export type ScatterCategoryMap = Map<string, number>;
export interface ScatterAxisCategoriesMap {
  xCategoriesMap: ScatterCategoryMap;
  yCategoriesMap: ScatterCategoryMap;
}

export type ScatterChartData = {
  type: 'scatter';
  scatterDataTable: ScatterDataTable;
  xCategories: ScatterCategories;
  yCategories: ScatterCategories;
};

export type ScattermapChartLocation = {
  name: string;
  value: number;
  colorValue?: number;
  details?: number | string[];
  blur: boolean;
  coordinates?: Coordinates;
};

export type ScattermapChartData = {
  type: 'scattermap';
  locations: ScattermapChartLocation[];
};

/**
 * Fact final data that will be passed to chart-component to render
 *
 * @internal
 */
export type IndicatorChartData = {
  type: IndicatorChartType;
  value?: number;
  secondary?: number;
  min?: number;
  max?: number;
};
/**
 * Raw GeoDataElement from data
 *
 * @internal
 */
export type RawGeoDataElement = {
  geoName: string;
  originalValue: number;
  formattedOriginalValue: string;
};

/**
 * GeoDataElement with color property, calculated from `originalValue`
 *
 * @internal
 */
export type GeoDataElement = RawGeoDataElement & {
  color?: Color;
};

/**
 * Fact final data that will be passed to Areamap-component to render
 *
 * @internal
 */
export type AreamapData = {
  type: AreamapChartType;
  geoData: GeoDataElement[];
};

/**
 * Fact final data that will be passed to chart-component to render
 *
 * @internal
 */
export type BoxplotChartData = {
  type: 'boxplot';
  xValues: CategoricalXValues[];
  series: [BoxplotSeriesValues, BoxplotOutliersSeriesValues?];
};

/**
 * Fact final data that will be passed to chart-component to render
 *
 * @internal
 */

export type ChartData =
  | CartesianChartData
  | CategoricalChartData
  | ScatterChartData
  | IndicatorChartData
  | BoxplotChartData
  | AreamapData
  | ScattermapChartData;
