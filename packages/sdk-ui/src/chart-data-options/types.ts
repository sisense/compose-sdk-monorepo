import type { DataColorOptions } from '../chart-data/series-data-color-service';
import type { NumberFormatConfig, SeriesChartType, SortDirection, ValueToColorMap } from '../types';
import { Column, MeasureColumn, CalculatedMeasureColumn } from '@sisense/sdk-data';

/**
 * Styles for a category/column when visualized in a chart
 *
 * @internal
 */
export interface CategoryStyle {
  /** {@inheritDoc NumberFormatConfig} */
  numberFormatConfig?: NumberFormatConfig;
  /**
   * Date format.
   *
   * See [ECMAScript Date Time String Format](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format)
   */
  dateFormat?: string;
  /** Boolean flag to toggle continuous timeline on this date column. */
  continuous?: boolean;
  /**
   * Date granularity that works with continuous timeline.
   *
   * Values from {@link @sisense/sdk-data!DateLevels}.
   *
   */
  granularity?: string;
  /**
   * Toggle flag for this category/column in the chart.
   *
   * @privateRemarks
   * We still need to decide on the behavior of this flag. Marked as internal for now.
   * @internal
   */
  enabled?: boolean;
  /** {@inheritDoc SortDirection} */
  sortType?: SortDirection;
}

/**
 * Wrapped {@link @sisense/sdk-data!Column} with styles controlling how the column is visualized in a chart.
 *
 * @example
 * Example of using `StyledColumn` to change the date format of the months displayed on the x-axis.
 *
 *
 * ```tsx
 * <Chart
 *   dataSet={DM.DataSource}
 *   chartType={'line'}
 *   dataOptions={{
 *     category: [
 *       {
 *         column: DM.Commerce.Date.Months,
 *         dateFormat: 'yy-MM',
 *       },
 *     ],
 *     value: [
 *       measures.sum(DM.Commerce.Revenue),
 *       {
 *         column: measures.sum(DM.Commerce.Quantity),
 *         showOnRightAxis: true,
 *         chartType: 'column',
 *       },
 *     ],
 *     breakBy: [],
 *   }}
 * />
 * ```
 * ###
 * <img src="media://chart-mixed-series-example-1.png" width="800px" />
 *
 * See also {@link StyledMeasureColumn}.
 */
export interface StyledColumn extends CategoryStyle {
  /** Wrapped Column */
  column: Column;
}

/**
 * Styles for a value/measure when it is visualized in a chart.
 *
 * @internal
 */
export type ValueStyle = {
  /** {@inheritDoc SortDirection} */
  sortType?: SortDirection;
  /**
   * Boolean flag whether to show this value/measure
   * on the right axis (`true`) or on the left axis (`false`).
   */
  showOnRightAxis?: boolean;
  /** {@inheritDoc NumberFormatConfig} */
  numberFormatConfig?: NumberFormatConfig;
  /** {@inheritDoc SeriesChartType} */
  chartType?: SeriesChartType;
  /** {@inheritDoc DataColorOptions} */
  color?: DataColorOptions;
  /**
   * Toggle flag for this value/measure in the chart.
   *
   * @privateRemarks
   * We still need to decide on the behavior of this flag. Marked as internal for now.
   * @internal
   */
  enabled?: boolean;
  /** Boolean flag whether null values are treated as zeros in the chart */
  treatNullDataAsZeros?: boolean;
};

/**
 * Wrapped {@link @sisense/sdk-data!MeasureColumn | Measure Column} with styles
 * controlling how the measure is visualized in a chart.
 *
 * @example
 * Example of using `StyledMeasureColumn` to mix a column series of `Total Revenue` to a line chart.
 *
 * Note that the chart doesn't display a second Y-axis on the right but that can be customized by
 * style options.
 *
 * ```tsx
 * <Chart
 *   dataSet={DM.DataSource}
 *   chartType={'line'}
 *   dataOptions={{
 *     category: [
 *       {
 *         column: DM.Commerce.Date.Months,
 *         dateFormat: 'yy-MM',
 *       },
 *     ],
 *     value: [
 *       measures.sum(DM.Commerce.Revenue),
 *       {
 *         column: measures.sum(DM.Commerce.Quantity),
 *         showOnRightAxis: true,
 *         chartType: 'column',
 *       },
 *     ],
 *     breakBy: [],
 *   }}
 * />
 * ```
 * ###
 * <img src="media://chart-mixed-series-example-1.png" width="800px" />
 *
 * See also {@link StyledColumn}.
 */
export interface StyledMeasureColumn extends ValueStyle {
  /** Wrapped MeasureColumn or CalculatedMeasureColumn */
  column: MeasureColumn | CalculatedMeasureColumn;
}

/**
 * @internal
 */
export type AnyColumn =
  | Column
  | StyledColumn
  | MeasureColumn
  | StyledMeasureColumn
  | CalculatedMeasureColumn;

/**
 * Configuration for how to query aggregate data and assign data
 * to axes of a {@link CartesianChartType | Cartesian chart}.
 *
 * These charts can include multiple values on both the X and Y-axis,
 * as well as a break-down by categories displayed on the Y-axis.
 */
export interface CartesianChartDataOptions {
  /**
   * Columns (or attributes) whose values are placed on the X-axis.
   *
   * Typically, the X-axis represents descriptive data.
   */
  category: (Column | StyledColumn)[];
  /**
   * Measure columns (or measures) whose values are scaled to the Y-axis of the chart.
   *
   * Each measure is represented as a series in the chart.
   *
   */
  value: (MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn)[];
  /**
   * Columns (or attributes) by which to break (group) the data represented in the chart.
   *
   * Each group is represented by a different visual encoding - for example, color of bars in a bar chart,
   * and is automatically added to the chart's legend.
   */
  breakBy: (Column | StyledColumn)[];
  /**
   * Optional mapping of each of the series to colors.
   */
  seriesToColorMap?: ValueToColorMap;
}

/**
 * Configuration for how to query aggregate data and assign data
 * to a {@link CategoricalChartType | Categorical chart}.
 */
export interface CategoricalChartDataOptions {
  /**
   * Measure columns (or measures) whose values are scaled to visual elements of the chart.
   * For example, the size of the pie slices of a pie chart.
   *
   * Values are typically used to represent numeric data.
   */
  value: (MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn)[];
  /**
   * Columns (or attributes) whose values represent categories in the chart.
   */
  category: (Column | StyledColumn)[];
  /**
   * Optional mapping of each of the series to colors.
   */
  seriesToColorMap?: ValueToColorMap;
}

/**
 * Configuration for how to query aggregate data and assign data
 * to a {@link IndicatorChartType | Indicator chart}.
 */
export interface IndicatorDataOptions {
  /** Measure columns (or measures) whose values are used for main value of indicator. */
  value?: (MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn)[];
  /** Measure columns (or measures) whose values are used for secondary value of indicator. */
  secondary?: (MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn)[];
  /** Measure columns (or measures) whose values are used for min value of indicator. */
  min?: (MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn)[];
  /** Measure columns (or measures) whose values are used for max value of indicator. */
  max?: (MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn)[];
}

/**
 * Configuration for how to query aggregate data and assign data
 * to axes of a {@link ScatterChartType | Scatter chart}.
 *
 * These charts can include data points scattered on X-Y plane further broken down by categories
 * and encoded by bubble sizes.
 */
export interface ScatterChartDataOptions {
  /**
   * A column or measure column whose values are placed on the X-axis.
   *
   * Typically, the X-axis of a Scatter Chart is used to represent numeric data.
   * Alternatively, Descriptive data is also supported. At most one column is allowed.
   */
  x?: Column | StyledColumn | MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn;
  /**
   * A column or measure column whose values are placed on the Y-axis.
   *
   * Typically, the Y-axis of a Scatter Chart is used to represent numeric data.
   * Alternatively, Descriptive data is also supported. At most one column is allowed.
   */
  y?: Column | StyledColumn | MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn;
  /**
   * A column to be scattered across the chart as circles;
   * one point (circle) appears on the chart for each member of this column.
   * These columns must be descriptive data (not numeric data).
   *
   * You can only add a break-by point if either the X-axis or the Y-axis was defined to represent numeric data.
   */
  breakByPoint?: Column | StyledColumn;

  /**
   * Select a column by which to break (group) the columns in the chart.
   * This must be a descriptive column. If you select descriptive data,
   * then the points in the chart are grouped into the members of the column.
   * Each member is represented by a different color.
   *
   * OR
   *
   * Select a column by which to color the columns in the chart.
   * This must be a numeric column. If you select numeric data,
   * then the point color is a gradient where the highest value is
   * the darkest color and the lowest value is the lightest color.
   *
   */
  breakByColor?:
    | Column
    | StyledColumn
    | MeasureColumn
    | CalculatedMeasureColumn
    | StyledMeasureColumn;

  /**
   * Column that determines the size of the circle. It must be numeric data.
   *
   */
  size?: MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn;

  /**
   * Optional mapping of each of the series created by {@link breakByColor} to colors.
   */
  seriesToColorMap?: ValueToColorMap;
}

/**
 * Checks if the given argument is a measure column.
 *
 * @param arg
 * @internal
 */
export function isMeasureColumn(
  arg: AnyColumn,
): arg is MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn {
  const column = 'column' in arg ? arg.column : arg;
  if ('context' in column || 'aggregation' in column) return true;
  return !('type' in column);
}

/**
 * Configuration for how to query data and assign data to {@link Table}
 *
 */
export type TableDataOptions = {
  /**
   * Columns (or attributes) whose values represent data columns in table
   *
   */
  columns: (
    | Column
    | StyledColumn
    | MeasureColumn
    | CalculatedMeasureColumn
    | StyledMeasureColumn
  )[];
};

/**
 * Configuration for how to query aggregate data and assign data to chart encodings.
 *
 * There are separate configurations for {@link CartesianChartDataOptions | Cartesian},
 * {@link CategoricalChartDataOptions | Categorical},
 * {@link ScatterChartDataOptions | Scatter}, and {@link IndicatorDataOptions | Indicator} charts.
 */
export type ChartDataOptions =
  | CartesianChartDataOptions
  | CategoricalChartDataOptions
  | ScatterChartDataOptions
  | IndicatorDataOptions;

/** @internal */
export interface Category extends CategoryStyle {
  name: string;
  type: string;
  title?: string;
}

/** @internal */
export const isValue = (arg: Category | Value): arg is Value => {
  return 'aggregation' in arg || 'context' in arg;
};

/** @internal */
export const isCategory = (arg: Category | Value): arg is Category => {
  return !isValue(arg);
};

/** @internal */
export interface Value extends ValueStyle {
  name: string;
  aggregation?: string;
  title: string;
}

/** @internal */
export interface CartesianChartDataOptionsInternal {
  x: Category[];
  y: Value[];
  breakBy: Category[];
  seriesToColorMap?: ValueToColorMap;
}

/** @internal */
export interface CategoricalChartDataOptionsInternal {
  y: Value[];
  breakBy: Category[];
  seriesToColorMap?: ValueToColorMap;
}

/** @internal */
export interface ScatterChartDataOptionsInternal {
  x?: Value | Category;
  y?: Value | Category;
  breakByPoint?: Category;
  breakByColor?: Category | Value;
  size?: Value;
  seriesToColorMap?: ValueToColorMap;
}

/** @internal */
export type TableDataOptionsInternal = {
  columns: (Category | Value)[];
};

/** @internal */
export type ChartDataOptionsInternal =
  | CartesianChartDataOptionsInternal
  | CategoricalChartDataOptionsInternal
  | ScatterChartDataOptionsInternal
  | IndicatorDataOptionsInternal;

/** @internal */
export type IndicatorDataOptionsInternal = {
  min?: Value[];
  max?: Value[];
  value?: Value[];
  secondary?: Value[];
};
