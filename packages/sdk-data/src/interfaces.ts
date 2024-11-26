import type { MeasureContext } from './dimensional-model/interfaces.js';

/**
 * Data cell, which is a storage unit in a {@link Data | user-provided data set}
 * or {@link QueryResultData | query result data set}.
 */
export interface Cell {
  /** Cell data value */
  data: any;
  /** Display text */
  text?: string;
  /**
   * Boolean flag representing three states that can be visualized in a chart:
   * - `true`: the data value is in blur state
   * - `false`: the data value is in highlight state
   * - if not specified, the data value is neither in highlight nor blur state
   */
  blur?: boolean;
  /** Color associated with the data value when visualized in a chart */
  color?: string;
}

/**
 * Represents a data-cell in a query result
 *
 * @internal
 */
export interface DataCell {
  /**
   * Gets the cell's data in its native type {@link (number|string|Date|boolean)}
   */
  data: any;

  /**
   * Gets the string representation of the cell
   */
  text: string;

  /**
   * Used to differentiate cell data that is highlighted/blurred by a filter.
   *
   * Means different things depending on if it is specified in the returned dataset.
   *
   * The absence of `selected` across all cells means that all data are neutral (neither highlighted nor blurred).
   * The presence of `selected` in at least one cell means that some cells are highlighted
   * and some are blurred.
   * The presence of `selected` in all cells means that all data are highlighted.
   */
  selected?: boolean;
}

/**
 * Column (or field) in a data set.
 * When associated with a dimensional model, a column is equivalent to an {@link Attribute}.
 */
export interface Column {
  /**
   * Identifier. Required when associated with a model
   *
   * @internal
   */
  id?: string; // required when associated with a model
  /** Column name */
  name: string;
  /** Column type */
  type: string;
  /**
   * Column description
   *
   * @internal
   */
  description?: string;
}

/**
 * Aggregate function applied to a {@link Column}.
 * When associated with a dimensional model, a Measure Column is equivalent to a {@link Measure}.
 */
export interface MeasureColumn {
  /**
   * Identifier. Required when associated with a model.
   *
   * @internal
   */
  id?: string;
  /** Column name */
  name: string;
  /**
   * Aggregate function -- for example, `sum`, `count`.
   * If not specified, default value, `sum`, will be used.
   */
  aggregation?: string;

  /**
   * Optional title for the column after aggregation.
   * If not specified, the column `name` will be used.
   */
  title?: string;
  /**
   * Aggregate function description
   *
   * @internal
   */
  description?: string;
}

/**
 * Calculated Aggregate function applied to a {@link Column}(s).
 * When associated with a dimensional model, a Calculated Measure Column is
 * equivalent to a {@link CalculatedMeasure}.
 */
export interface CalculatedMeasureColumn {
  /**
   * Identifier. Required when associated with a model.
   *
   * @internal
   */
  id?: string;
  /** Column name */
  name: string;
  /** Measure type */
  type: string;
  /** Measure context */
  context: MeasureContext;
  /** Expression representing the element in a {@link https://sisense.dev/guides/querying/useJaql/ | JAQL query}. */
  expression: string;
  /**
   * Aggregate function description
   *
   * @internal
   */
  description?: string;
  /**
   * Optional title for the column after aggregation.
   * If not specified, the column `name` will be used.
   */
  title?: string;
}

/**
 * Info of data source
 */
export type DataSourceInfo = {
  /**
   * @internal
   **/
  id?: string;
  /**
   * @internal
   **/
  address?: string;
  title: string;
  type: 'live' | 'elasticube';
};

/**
 * Data source for queries to run against
 */
export type DataSource = string | DataSourceInfo;

/**
 * Data set, which is made up of an array of {@link Column | columns}
 * and a two-dimensional array of data {@link Cell | cells}.
 *
 * This structure can be used for user-provided data in {@link @sisense/sdk-ui!ChartProps | Chart components}.
 */
export interface Data {
  /** Array of {@link Column | columns} */
  columns: Column[];
  /** Two-dimensional array of data cells, each of which is either a string, number, or type {@link Cell} */
  rows: (string | number | Cell)[][];
}

/**
 * Query result data set, which is made of an array of {@link Column | columns}
 * and a two-dimensional array of data {@link Cell | cells}.
 */
export interface QueryResultData {
  /** Array of {@link Column | columns} */
  columns: Column[];
  /** Two-dimensional array of data {@link Cell | cells} */
  rows: Cell[][];
}

/**
 * Tree node representing data in a pivot table
 */
export type TreeNode = {
  /**
   * Raw data
   */
  value?: string;
  /**
   * Raw data
   *
   * @internal
   */
  content?: string;
  // style object
  // style?: InputStyles;
  /**
   * Matched index for condition formatting
   *
   * @internal
   */
  cf?: number;
  /**
   * List of children of this node
   */
  children?: Array<TreeNode>;
  /**
   * Data list for rows nodes
   */
  data?: Array<any>;
  /**
   * Index in data list for columns nodes
   */
  index?: number;
  /**
   * Current node's index divergence
   *
   * @internal
   */
  indexDivergence?: number;
  /**
   * Initial child count in raw data from server
   *
   * @internal
   */
  size?: number;
  /**
   * Boolean flag if node is some part of real node
   *
   * @internal
   */
  isPart?: boolean;
  /**
   * Max number of children (measures) nodes to insert
   *
   * @internal
   */
  maxChilds?: number;
  /**
   * Node deep level
   *
   * @internal
   */
  level?: number;
  /**
   * Node min deep level, for columns nodes with values at the and
   *
   * @internal
   */
  minLevel?: number;

  /**
   * Internal cache, to make sure that node was already mapped
   *
   * @internal
   */
  isMapped?: boolean;

  /**
   * Internal cache, for child count
   *
   * @internal
   */
  childCount?: number;
  /**
   * Internal cache, for child deep
   *
   * @internal
   */
  childDeep?: number;
  /**
   * Internal data store
   *
   * @internal
   */
  store?: { [key: string]: any };
};

/**
 * Grid of tree nodes
 */
export type PivotGrid = Array<Array<TreeNode | string>>;
/**
 * Pivot query result data set, which includes both a flat table of {@link QueryResultData} and grids of tree structures.
 */
export interface PivotQueryResultData {
  /**
   * Flat table structure
   *
   * @category Table
   */
  table: QueryResultData;
  /**
   * Grids of tree structures
   *
   * @category Tree Structures
   */
  grids?: {
    corner: PivotGrid;
    rows: PivotGrid;
    columns: PivotGrid;
    values: PivotGrid;
  };
}

/**
 * Empty pivot query result data set
 *
 * @internal
 */
export const EMPTY_PIVOT_QUERY_RESULT_DATA: PivotQueryResultData = {
  table: { columns: [], rows: [] },
};

/**
 * Runs type guard check for DataSource.
 *
 * @param arg
 * @internal
 */
export function isDataSource(arg: DataSource | Data | undefined): arg is DataSource | undefined {
  return arg === undefined || typeof arg === 'string' || ('title' in arg && 'type' in arg);
}

/**
 * Trend formula options.
 */
export type TrendFormulaOptions = {
  /**
   * Trend analysis model type to be used for the operation.
   *
   * @defaultValue "linear"
   */
  modelType?: 'linear' | 'logarithmic' | 'advancedSmoothing' | 'localEstimates';
  /**
   * Boolean flag that enables the function to automatically identify and ignore
   * anomalous values in the series. This can be particularly useful when you want
   * to maintain the integrity of your analysis by avoiding potential outliers.
   *
   * @defaultValue false
   */
  ignoreAnomalies?: boolean;
};

/**
 * Forecast formula options.
 */
export type ForecastFormulaOptions = {
  /**
   * Number of data points to be predicted.
   * The accepted value range is between 1-1,000
   *
   * @defaultValue 3
   */
  forecastHorizon?: number;
  /**
   * Forecasting model type. The 'auto' option automatically
   * fits the best combination of models.
   *
   * @defaultValue "auto"
   */
  modelType?: 'auto' | 'autoArima' | 'holtWinters' | 'prophet';
  /**
   * Start date of the time series data that the forecasting model will
   * be trained on. This parameter can be used to discard the beginning of
   * the series. Specify a ISO 8601 date string or Date object.
   */
  startDate?: string | Date;
  /**
   * End date of the time series data that the forecasting model will be
   * trained on. This parameter can be used to discard the end of the series.
   * Specify a ISO 8601 date string or Date object.
   */
  endDate?: string | Date;
  /**
   * Confidence interval showing the probabilistic upper and lower limits of the
   * forecasted series according to the uncertainty level. The valid range is (0.8 <= X < 1).
   *
   * @defaultValue 0.8
   */
  confidenceInterval?: number;
  /**
   * Expected lower limit to improve the forecast accuracy when reaching
   * the limit. Note that values in the confidence interval can exceed
   * this limit.
   */
  lowerBound?: number;
  /**
   * Expected upper limit to improve the forecast accuracy when reaching
   * the limit. Note that values in the confidence interval can exceed
   * this limit.
   */
  upperBound?: number;
  /**
   * Boolean flag to round the predicted result to an integer if set to true.
   * Otherwise, the predicted result is left as a float
   *
   * @defaultValue false
   */
  roundToInt?: boolean;
};
