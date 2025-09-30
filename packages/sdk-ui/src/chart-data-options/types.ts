import {
  ConditionalDataColorOptions,
  DataColorOptions,
  UniformDataColorOptions,
} from '../chart-data/data-coloring';
import type {
  NumberFormatConfig,
  SeriesChartType,
  ValueToColorMap,
  MultiColumnValueToColorMap,
  LineWidth,
  Markers,
  SortDirection,
  PivotRowsSort,
} from '../types';
import {
  Column,
  MeasureColumn,
  CalculatedMeasureColumn,
  PivotGrandTotals,
  TotalsCalculation,
  ForecastFormulaOptions,
  TrendFormulaOptions,
} from '@sisense/sdk-data';

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
   *
   * Note that 'YYYY' and 'DD' have been disabled since they often get confused with 'yyyy' and 'dd'
   * and can produce unexpected results.
   */
  dateFormat?: string;
  /** Boolean flag to toggle continuous timeline on this date column. */
  continuous?: boolean;
  /**
   * Date granularity that works with continuous timeline.
   *
   * Values from {@link @sisense/sdk-data!DateLevels | `DateLevels`}.
   *
   */
  granularity?: string;
  /**
   * Toggle flag for this category/column in the chart.
   *
   * @internal
   */
  enabled?: boolean;
  /**
   * Sorting configuration that represents either {@link SortDirection} or {@link PivotRowsSort} for the pivot table
   */
  sortType?: SortDirection | PivotRowsSort;
  isColored?: boolean;
  /**
   * Boolean flag whether to render category/column value as HTML in the Table component.
   */
  isHtml?: boolean;
  /**
   * Boolean flag whether to include subtotals for this dimension in the pivot table.
   */
  includeSubTotals?: boolean;
  /**
   * Geographic location level for Scattermap chart.
   */
  geoLevel?: ScattermapLocationLevel;
  /**
   * Column width. Used in Pivot table.
   *
   * @internal
   */
  width?: number;
  /** {@inheritDoc DataColorOptions} */
  color?: DataColorOptions;
  /**
   * Name of the column.
   */
  name?: string;
}

/**
 * Wrapped {@link @sisense/sdk-data!Column | Column} with styles controlling how the column is visualized in a chart.
 *
 * @example
 * An example of using `StyledColumn` to change the date format of the months displayed on the x-axis.
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
 *       measureFactory.sum(DM.Commerce.Revenue),
 *       {
 *         column: measureFactory.sum(DM.Commerce.Quantity),
 *         showOnRightAxis: true,
 *         chartType: 'column',
 *       },
 *     ],
 *     breakBy: [],
 *   }}
 * />
 * ```
 *
 * <img src="media://chart-mixed-series-example-1.png" width="800px" />
 *
 * Also, see {@link StyledMeasureColumn}.
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
   * @internal
   */
  enabled?: boolean;
  /** Boolean flag whether null values are treated as zeros in the chart */
  treatNullDataAsZeros?: boolean;
  /** Boolean flag whether to connect a graph line across null points or render a gap */
  connectNulls?: boolean;
  /**
   * Calculation for the totals of this measure in the pivot table.
   */
  totalsCalculation?: TotalsCalculation;
  /**
   * Boolean flag whether to display data bars for this measure in the pivot table.
   */
  dataBars?: boolean;
  /**
   * Color options for data bars for this measure in the pivot table
   */
  dataBarsColor?: string | UniformDataColorOptions | ConditionalDataColorOptions;
  /**
   * Options to add forecast to this measure
   *
   * @internal
   */
  forecast?: ForecastFormulaOptions;
  /**
   * Options to add trend to this measure
   *
   * @internal
   */
  trend?: TrendFormulaOptions;
  /**
   * Column width. Used in Pivot table.
   *
   * @internal
   */
  width?: number;
  /**
   * Name of the measure.
   */
  name?: string;
};

/**
 * Specific style options to be applied to specific series in Chart.
 *
 * @internal
 */
export type SeriesStyle = {
  /**
   * Specific style options to be applied to specific series in Chart.
   * Supported only for cartesian and polar charts.
   */
  seriesStyleOptions?: SeriesStyleOptions;
};

/**
 * Specific style options to be applied to specific series in Chart.
 * Supported only for cartesian and polar charts.
 */
export type SeriesStyleOptions = {
  /**
   * @inheritdoc
   */
  lineWidth?: LineWidth;
  /**
   * @inheritdoc
   */
  markers?: Markers;
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
 *       measureFactory.sum(DM.Commerce.Revenue),
 *       {
 *         column: measureFactory.sum(DM.Commerce.Quantity),
 *         showOnRightAxis: true,
 *         chartType: 'column',
 *       },
 *     ],
 *     breakBy: [],
 *   }}
 * />
 * ```
 *
 * <img src="media://chart-mixed-series-example-1.png" width="800px" />
 *
 * See also {@link StyledColumn}.
 */
export interface StyledMeasureColumn extends ValueStyle, SeriesStyle {
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
   *
   * For funnel charts, only the first 50 categories will be used.
   */
  category: (Column | StyledColumn)[];
  /**
   * Optional mapping of each of the series to colors.
   * ({@link MultiColumnValueToColorMap} used only for the Sunburst Chart component)
   */
  seriesToColorMap?: ValueToColorMap | MultiColumnValueToColorMap;
}

/**
 * Configuration for how to query aggregate data and assign data
 * to a {@link IndicatorChartType | Indicator chart}.
 */
export interface IndicatorChartDataOptions {
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
 * Configuration for how to query aggregate data and assign data
 * to geographic features of an Areamap chart.
 */
export interface AreamapChartDataOptions {
  /** Column or attribute representing the countries (or states) on the map. */
  geo: [Column | StyledColumn];
  /** Measure column (or measure) encoded by the color of the countries (or states) on the map. */
  color?: [MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn];
}

/**
 * Configuration for how to query aggregate data and assign data
 * to a calendar-heatmap chart.
 */
export interface CalendarHeatmapChartDataOptions {
  /** Date column representing dates on the calendar heatmap. */
  date: Column | StyledColumn;
  /** Measure column (or measure) assigned to the calendar cells. */
  value: MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn;
}

/**
 * Configuration for how to query data and assign data to Table.
 */
export interface TableDataOptions {
  /**
   * Columns (or attributes) whose values represent data columns in table
   */
  columns: (
    | Column
    | StyledColumn
    | MeasureColumn
    | CalculatedMeasureColumn
    | StyledMeasureColumn
  )[];
}

/**
 * Configuration for how to query data and assign data to tabular charts.
 */
export type TabularChartDataOptions = TableDataOptions;

/**
 * Configuration for how to query data and assign data to PivotTable.
 *
 */
export interface PivotTableDataOptions {
  /**
   * Dimensions for the rows of the pivot table
   *
   * @category Data Options
   */
  rows?: (Column | StyledColumn)[];

  /**
   * Dimensions for the columns of the pivot table
   *
   * @category Data Options
   */
  columns?: (Column | StyledColumn)[];

  /**
   * Measures for the values of the pivot table
   *
   * @category Data Options
   */
  values?: (MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn)[];

  /**
   * Options for grand totals
   *
   * @category Data Options
   */
  grandTotals?: PivotGrandTotals;
}

/**
 * Geographic location level for Scattermap chart.
 * This type can have one of the following values:
 * - 'auto': Automatically determines the appropriate location level.
 * - 'country': Represents the country level in the geographical hierarchy.
 * - 'state': Represents the state or province level in the geographical hierarchy.
 * - 'city': Represents the city level in the geographical hierarchy.
 */
export type ScattermapLocationLevel = 'auto' | 'country' | 'state' | 'city';

/**
 * Configuration for how to query aggregate data and assign data
 * to axes of a Scattermap chart.
 */
export interface ScattermapChartDataOptions {
  /**
   * Columns (or attributes) whose values represent locations on the map.
   * Support field(s) that contain geographic data (Country, City, State/Province, etc)
   * To visualize latitude and longitude data, you have to add one field containing latitude data, and another field containing longitude data, in this order.
   */
  geo: (Column | StyledColumn)[];
  /**
   * Measure column (or measure) representing the size of the points on the map.
   */
  size?: MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn;
  /**
   * Measure column (or measure) representing the color of the points on the map.
   */
  colorBy?: MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn;
  /**
   * Column or measure column representing the additional details for the points on the map.
   */
  details?: Column | StyledColumn | MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn;
}

/**
 * Represents the type of box whisker data algorithm, which can be either `iqr`, `extremums`, or `standardDeviation`.
 */
export type BoxWhiskerType = 'iqr' | 'extremums' | 'standardDeviation';

/**
 * Configuration for how to query aggregate data and assign data
 * to axes of a Boxplot chart.
 *
 * The Boxplot chart can receive a singular numeric column, which is utilized internally to calculate multiple metrics
 * such as `whisker max`, `whisker min`, `box max`, `box median`, and `box min`.
 */
export type BoxplotChartDataOptions = {
  /**
   * Columns (or attributes) whose values represent categories in the chart.
   */
  category: [(Column | StyledColumn)?];
  /**
   * Columns (or attributes) whose values represent the target numeric value column for computing boxplot metrics according to the selected `boxType`
   */
  value: [Column | StyledColumn];
  /**
   * The type of box whisker data algorithm to be used.
   */
  boxType: BoxWhiskerType;
  /**
   * Toggle flag whether outliers should be enabled in the boxplot chart.
   */
  outliersEnabled?: boolean;
};

/**
 * Configuration for how to query aggregate data and assign data
 * to axes of a Boxplot chart.
 *
 * The Boxplot chart can receive multiple numeric columns, which represent all the metrics
 * such as `whisker max`, `whisker min`, `box max`, `box median`, and `box min`.
 */
export type BoxplotChartCustomDataOptions = {
  /**
   * Columns (or attributes) whose values represent categories in the chart.
   */
  category: [(Column | StyledColumn)?];
  /**
   * Measure columns (or measures) representing the target numeric values used for computing boxplot metrics.
   */
  value: (Column | StyledColumn | MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn)[];
  /**
   * Optional measure columns (or measures) representing the boxplot outliers value.
   */
  outliers?: [Column | StyledColumn];
  /**
   * The title for the numeric value column in the chart.
   */
  valueTitle: string;
};

export interface AreaRangeMeasureColumn extends ValueStyle, SeriesStyle {
  title: string;
  chartType?: 'arearange';
  lowerBound: MeasureColumn | CalculatedMeasureColumn;
  upperBound: MeasureColumn | CalculatedMeasureColumn;
}

/**
 * Configuration for how to query aggregate data and assign data
 * to axes of a Range chart.
 */
export interface RangeChartDataOptions {
  /**
   * Columns (or attributes) whose values are placed on the X-axis.
   *
   * Typically, the X-axis represents descriptive data.
   */
  category: (Column | StyledColumn)[];
  /**
   * An array of measure columns used to represent the target numeric values for computing the metrics
   * in an area range chart.
   *
   * Each measure column defines the range of values by specifying a lower and an upper bound,
   * providing the necessary data to visualize the area range on the chart.
   */
  value: (CalculatedMeasureColumn | StyledMeasureColumn | AreaRangeMeasureColumn)[];
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
 * Configuration for querying aggregate data and assigning data to chart encodings.
 *
 * There are separate configurations for {@link CartesianChartDataOptions | Cartesian},
 * {@link CategoricalChartDataOptions | Categorical},
 * {@link ScatterChartDataOptions | Scatter},
 * {@link IndicatorChartDataOptions | Indicator},
 * {@link TableDataOptions | Table},
 * {@link BoxplotChartDataOptions | Boxplot},
 * {@link AreamapChartDataOptions | Areamap}, and
 * {@link ScattermapChartDataOptions | Scattermap} charts.
 */
export type ChartDataOptions = RegularChartDataOptions | TabularChartDataOptions;

/**
 * Configuration for how to query aggregate data and assigning data to chart encodings of regular charts.
 */
export type RegularChartDataOptions =
  | CartesianChartDataOptions
  | CategoricalChartDataOptions
  | ScatterChartDataOptions
  | IndicatorChartDataOptions
  | BoxplotChartDataOptions
  | BoxplotChartCustomDataOptions
  | AreamapChartDataOptions
  | ScattermapChartDataOptions
  | RangeChartDataOptions
  | CalendarHeatmapChartDataOptions;

/** @internal */
export interface CartesianChartDataOptionsInternal {
  x: StyledColumn[];
  y: StyledMeasureColumn[];
  breakBy: StyledColumn[];
  seriesToColorMap?: ValueToColorMap;
}

/** @internal */
export interface CategoricalChartDataOptionsInternal {
  y: StyledMeasureColumn[];
  breakBy: StyledColumn[];
  seriesToColorMap?: ValueToColorMap | MultiColumnValueToColorMap;
}

/** @internal */
export interface ScatterChartDataOptionsInternal {
  x?: StyledColumn | StyledMeasureColumn;
  y?: StyledColumn | StyledMeasureColumn;
  breakByPoint?: StyledColumn;
  breakByColor?: StyledColumn | StyledMeasureColumn;
  size?: StyledMeasureColumn;
  seriesToColorMap?: ValueToColorMap;
}

/** @internal */
export interface ScattermapChartDataOptionsInternal {
  locations: StyledColumn[];
  size?: StyledMeasureColumn;
  colorBy?: StyledMeasureColumn;
  details?: StyledColumn | StyledMeasureColumn;
  locationLevel: ScattermapLocationLevel;
}

/** @internal */
export type RangeChartDataOptionsInternal = {
  x: StyledColumn[];
  y: StyledMeasureColumn[];
  breakBy: StyledColumn[];
  seriesToColorMap?: ValueToColorMap | MultiColumnValueToColorMap;
  rangeValues: StyledMeasureColumn[][];
  seriesValues: StyledMeasureColumn[];
};

/** @internal */
export type TableDataOptionsInternal = {
  columns: (StyledColumn | StyledMeasureColumn)[];
};

/**
 * @internal
 */
export interface PivotTableDataOptionsInternal {
  /**
   * Dimensions for the rows of the pivot table
   *
   * @category Data Options
   */
  rows?: StyledColumn[];

  /**
   * Dimensions for the columns of the pivot table
   *
   * @category Data Options
   */
  columns?: StyledColumn[];

  /**
   * Measures for the values of the pivot table
   *
   * @category Data Options
   */
  values?: StyledMeasureColumn[];

  /**
   * Options for grand totals
   *
   * @category Data Options
   */
  grandTotals?: PivotGrandTotals;
}

/** @internal */
export type ChartDataOptionsInternal =
  | CartesianChartDataOptionsInternal
  | CategoricalChartDataOptionsInternal
  | ScatterChartDataOptionsInternal
  | IndicatorChartDataOptionsInternal
  | BoxplotChartDataOptionsInternal
  | AreamapChartDataOptionsInternal
  | ScattermapChartDataOptionsInternal
  | RangeChartDataOptionsInternal
  | CalendarHeatmapChartDataOptionsInternal;

/** @internal */
export type IndicatorChartDataOptionsInternal = {
  value?: StyledMeasureColumn[];
  secondary?: StyledMeasureColumn[];
  min?: StyledMeasureColumn[];
  max?: StyledMeasureColumn[];
};

/** @internal */
export interface BoxplotChartDataOptionsInternal {
  category?: StyledColumn;
  boxMin: StyledMeasureColumn;
  boxMedian: StyledMeasureColumn;
  boxMax: StyledMeasureColumn;
  whiskerMin: StyledMeasureColumn;
  whiskerMax: StyledMeasureColumn;
  outliersCount: StyledMeasureColumn;
  outliers?: StyledColumn;
  valueTitle: string;
}

/** @internal */
export type AreamapChartDataOptionsInternal = {
  geo: StyledColumn;
  color?: StyledMeasureColumn;
};

/** @internal */
export type CalendarHeatmapChartDataOptionsInternal = {
  date: StyledColumn;
  value: StyledMeasureColumn;
};
