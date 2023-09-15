import { NumberFormatConfig } from '../types';
import { IndicatorChartType } from '../chart-options-processor/translations/types';
import { ComparableData, Value } from '../chart-data-processor/table-processor';

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
};
export type CategoricalSeriesValues = {
  name: string;
  title?: string;
  data: SeriesValueData[];
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

export type ChartData =
  | CartesianChartData
  | CategoricalChartData
  | ScatterChartData
  | IndicatorChartData;
