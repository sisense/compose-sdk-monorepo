import { ComparableData, Value } from '@/chart-data-processor/table-processor';
import { IndicatorChartType } from '@/chart-options-processor/translations/types';
import { AreamapData } from '@/chart/restructured-charts/areamap-chart/types';
import { CalendarHeatmapChartData } from '@/chart/restructured-charts/highchart-based-charts/calendar-heatmap-chart/data';
import { Coordinates } from '@/charts/map-charts/scattermap/types';
import { NumberFormatConfig } from '@/types';

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
  seriesOther?: CartesianChartData;
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
  rawName: string[];
  value: number;
  colorValue?: number;
  details?: number | string[];
  blur?: boolean;
  coordinates?: Coordinates;
};

export type ScattermapChartData = {
  type: 'scattermap';
  locations: ScattermapChartLocation[];
};

type AreaRangeSeriesValue = [number, number, number];
export type AreaRangeSeriesValues = {
  name: string;
  title?: string;
  data: AreaRangeSeriesValue[];
};

export type RangeChartData = {
  type: 'range';
  xValues: CategoricalXValues[];
  xAxisCount: number;
  series: CategoricalSeriesValues[];
  seriesOther: CartesianChartData;
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
  | ScattermapChartData
  | RangeChartData
  | CalendarHeatmapChartData;
