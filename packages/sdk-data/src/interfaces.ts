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
  /** Boolean flag whether the data value should be blurred when visualized in a chart */
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
   * The absence of `selected` across all cells means that all data is highlighted.
   * The presence of `selected` in at least one cell means that some cells are highlighted
   * and some are blurred.
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
  /** Expression representing the element in a {@link https://sisense.dev/guides/query/jaql/ | JAQL query}. */
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
 * Data source for queries to run against
 */
export type DataSource = string;

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
 * Runs type guard check for DataSource.
 *
 * @param arg
 * @internal
 */
export function isDataSource(arg: DataSource | Data): arg is DataSource {
  return arg === undefined || typeof arg === 'string';
}
