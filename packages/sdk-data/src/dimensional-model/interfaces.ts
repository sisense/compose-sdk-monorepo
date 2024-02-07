import {
  //DateLevels,
  Sort,
} from './types.js';

/**
 * @internal
 */
export interface DataModel {
  readonly name: string;
  readonly metadata: Element[];
  [propName: string]: any;
}

/**
 * Common interface for elements of
 * [dimensional modeling](https://docs.sisense.com/main/SisenseLinux/data-model-building-practices.htm?tocpath=Modeling%20Data%7C_____4).
 *
 * @internal
 */
export interface Element {
  /**
   * Element name
   */
  name: string;

  /**
   * Element type
   */
  readonly type: string;

  /**
   * Element description
   *
   * @internal
   */
  readonly description: string;

  /**
   * Element ID
   *
   * @internal
   */
  readonly id: string;

  /**
   * Gets a serializable representation of the element.
   *
   * @internal
   */
  serializable(): any;

  /**
   * Overrides JSON.stringify() behavior.
   *
   * @internal
   */
  toJSON(): any;

  /**
   * Gets the JAQL representation of this instance.
   *
   * @param nested - defines whether the JAQL is nested within parent JAQL statement or a root JAQL element
   * @internal
   */
  jaql(nested?: boolean): any;

  /**
   * Skip any validation of this instance.
   *
   * @internal
   */
  skipValidation?: boolean;
}

/**
 * Base interface for measure, which is typically numeric aggregation over {@link Attribute}(s).
 * See {@link measureFactory} for how to create measures.
 *
 */
export interface Measure extends Element {
  /**
   * Gets the sort definition of this measure.
   */
  getSort(): Sort;

  /**
   * Sorts the measure by the given `sort` definition.
   *
   * @param sort - Sort definition
   * @returns A sorted instance of measure
   */
  sort(sort: Sort): Measure;

  /**
   * Gets the formatting string of this measure.
   *
   * @returns Formatting string
   */
  getFormat(): string | undefined;

  /**
   * Formats the measure according to the given `format` definition.
   *
   * @param format - Format string
   * @returns A formatted instance of this measure
   */
  format(format: string): Measure;
}

/**
 * Common interface of a Base measure, which is aggregation over {@link Attribute}.
 *
 */
export interface BaseMeasure extends Measure {
  /**
   * Aggregated attribute
   */
  readonly attribute: Attribute;

  /**
   * Aggregation type
   */
  readonly aggregation: string;
}

/**
 * Common interface of a Measure template, which is a generator for different aggregation over {@link Attribute}.
 *
 * @internal
 */
export interface MeasureTemplate extends Measure {
  /**
   * Aggregated attribute
   */
  readonly attribute: Attribute;

  /**
   * Gets a sorted instance with the given definition.
   *
   * @param sort - Sort definition
   * @returns A sorted instance of this measure template
   */
  sort(sort: Sort): MeasureTemplate;

  /**
   * Gets a {@link Measure} defined with sum aggregation.
   *
   * @returns A {@link Measure} defined with sum aggregation
   */
  sum(): Measure;

  /**
   * Gets a {@link Measure} defined with average aggregation.
   *
   * @returns A {@link Measure} defined with average aggregation
   */
  average(): Measure;

  /**
   * Gets a {@link Measure} defined with median aggregation.
   *
   * @returns A {@link Measure} defined with median aggregation
   */
  median(): Measure;

  /**
   * Gets a {@link Measure} defined with min aggregation.
   *
   * @returns A {@link Measure} defined with min aggregation
   */
  min(): Measure;

  /**
   * Gets a {@link Measure} defined with max aggregation.
   *
   * @returns A {@link Measure} defined with max aggregation
   */
  max(): Measure;

  /**
   * Gets a {@link Measure} defined with count aggregation.
   *
   * @returns A {@link Measure} defined with count aggregation
   */
  count(): Measure;

  /**
   * Gets a {@link Measure} defined with a count distinct aggregation.
   *
   * @returns A {@link Measure} defined with a count distinct aggregation
   */
  countDistinct(): Measure;
}

/**
 * Context of a calculated measure.
 */
export interface MeasureContext {
  [propName: string]: any;
}

/**
 * Interface for a Calculated Measure, extending {@link Measure}.
 *
 * @see {@link https://sisense.dev/guides/querying/useJaql/#step-7-adding-a-formula | Using the JAQL to Add A Formula}
 */
export interface CalculatedMeasure extends Measure {
  /**
   * Expression of the calculated measure
   */
  expression: string;

  /**
   * Context of the calculated measure
   */
  context: MeasureContext;
}

/**
 * Common interface of a Dimension, which serves as a container for {@link Attribute}(s)
 * and other {@link DateDimension}(s).
 */
export interface Dimension extends Element, Attribute {
  /**
   * Child dimensions
   *
   * @internal
   */
  dimensions: Dimension[];

  /**
   * Child attributes
   *
   * @internal
   */
  attributes: Attribute[];

  /** @internal */
  [propName: string]: any;
}

/**
 * Date Dimension extending {@link Dimension}.
 *
 * See [here](https://docs.sisense.com/main/SisenseLinux/date-and-time-fields.htm)
 * for more details on Date and Time Resolution for ElastiCubes and for Live Models.
 */
export interface DateDimension extends Dimension {
  /**
   * Years level
   */
  readonly Years: LevelAttribute;

  /**
   * Quarters level
   */
  readonly Quarters: LevelAttribute;

  /**
   * Months level
   */
  readonly Months: LevelAttribute;

  /**
   * Weeks level
   */
  readonly Weeks: LevelAttribute;

  /**
   * Days level
   */
  readonly Days: LevelAttribute;

  /**
   * Hours level (for Live Models)
   */
  readonly Hours: LevelAttribute;

  /**
   * Minutes (round to 30) level (for Live Models)
   */
  readonly MinutesRoundTo30: LevelAttribute;

  /**
   * Minutes (round to 15) level (for Live Models)
   */
  readonly MinutesRoundTo15: LevelAttribute;

  /**
   * Aggregated Hours level (for Live Models)
   */
  readonly AggHours: LevelAttribute;

  /**
   * Aggregated Minutes (round to 30) level
   */
  readonly AggMinutesRoundTo30: LevelAttribute;

  /**
   * Aggregated Minutes (round to 15) level
   */
  readonly AggMinutesRoundTo15: LevelAttribute;

  /**
   * Aggregated Minutes (every minute) level
   */
  readonly AggMinutesRoundTo1: LevelAttribute;
}

/**
 * Common interface of an Attribute as defined in
 * [Dimensional Modeling](https://docs.sisense.com/main/SisenseLinux/data-model-building-practices.htm?tocpath=Modeling%20Data%7C_____4).
 * It is an extension of a {@link Column} in a generic {@link Data | Data Set}.
 */
export interface Attribute extends Element {
  /**
   * Expression representing the element in a {@link https://sisense.dev/guides/querying/useJaql/ | JAQL query}.
   * It is typically populated automatically in the data model generated by the data model generator.
   */
  readonly expression: string;

  /**
   * Gets the sort definition.
   *
   * @returns The Sort definition
   */
  getSort(): Sort;

  /**
   * Sorts the attribute by the given definition
   *
   * @param sort - Sort definition
   * @returns An sorted instance of the attribute
   */
  sort(sort: Sort): Attribute;
}

/**
 * Date Level Attribute associated with a granularity - for example, Years, Quarters, Months, Days.
 */
export interface LevelAttribute extends Attribute {
  /**
   * Granularity of the level. See supported granularity values at {@link DateLevels}.
   */
  readonly granularity: string;

  /**
   * String formatting of this instance.
   *
   * @returns string formatting
   */
  getFormat(): string | undefined;

  /**
   * Gets a formatted instance with the given definition.
   *
   * @param format - Format string
   * @returns A formatted instance of this level attribute
   */
  format(format: string): LevelAttribute;

  /**
   * Obtains the JAQL representation of the level that depends on the granularity
   *
   * @returns The JAQL representation of the level
   * @internal
   */
  translateGranularityToJaql(): {
    level?: string;
    dateTimeLevel?: string;
    bucket?: string;
  };
}

/**
 * Base interface for filter. See {@link filterFactory} for how to create filters.
 */
export interface Filter extends Element {
  /**
   * Global filter identifier
   */
  readonly guid: string;

  /**
   * Attribute this filter instance is filtering
   */
  readonly attribute: Attribute;

  /**
   * Boolean flag whether the filter is a scope filter
   */
  isScope: boolean;

  /**
   * Gets JAQL representing this Filter instance
   *
   * @internal
   */
  filterJaql(): any;
}

export interface CustomFormulaContext {
  [key: string]: Attribute | Measure;
}

/**
 * Wrapped attribute with additional options for pivot table
 */
export interface PivotAttribute {
  attribute: Attribute;
  includeSubTotals?: boolean;
}

/**
 * Runs type guard check for PivotAttribute.
 *
 * @param arg - object to check
 * @internal
 */
export function isPivotAttribute(arg: Attribute | PivotAttribute): arg is PivotAttribute {
  return 'attribute' in arg;
}

export type TotalsCalculation = 'sum' | 'max' | 'min' | 'avg' | 'median';

/**
 * Wrapped measure with additional options for pivot table
 */
export interface PivotMeasure {
  measure: Measure;
  totalsCalculation: TotalsCalculation;
  // TODO add dataBars
}

/**
 * Runs type guard check for PivotMeasure.
 *
 * @param arg - object to check
 * @internal
 */
export function isPivotMeasure(arg: Measure | PivotMeasure): arg is PivotMeasure {
  return 'measure' in arg;
}

/**
 * Data options for grand totals of a pivot table
 */
export type PivotGrandTotals = { title?: string; rows?: boolean; columns?: boolean };

/**
 * @internal
 */
export const DEFAULT_PIVOT_GRAND_TOTALS: PivotGrandTotals = {
  title: 'Grand Total',
  rows: false,
  columns: false,
};

/** A node or a subtree of a {@link FilterRelations} tree */
export type FilterRelationsNode = Filter | Filter[] | FilterRelations;

/**
 * A node or a subtree of a {@link FilterRelationsModel} tree
 *
 * @internal
 */
export type FilterRelationsModelNode =
  | FilterRelationsModelIdNode
  | FilterRelationsModelBracketNode
  | FilterRelationsModel;

/**
 * A node or a subtree of a {@link FilterRelationsJaql} tree
 *
 * @internal
 */
export type FilterRelationsJaqlNode = FilterRelationsJaqlIdNode | FilterRelationsJaql;

/**
 * Representation of filter logical relations (AND/OR)
 *
 * Unlike {@link FilterRelationsModel} or {@link FilterRelationsJaql},
 * this interface contains filter objects, not just id nodes
 */
export interface FilterRelations {
  left: FilterRelationsNode;
  right: FilterRelationsNode;
  operator: 'AND' | 'OR';
}

/**
 * Incoming filter logical relations (AND/OR) when fetched from the instance
 *
 * @internal
 */
export interface FilterRelationsModel {
  left: FilterRelationsModelNode;
  right: FilterRelationsModelNode;
  operator: 'AND' | 'OR';
}

/**
 * Outgoing filter logical relations (AND/OR) when added to a query
 *
 * @internal
 */
export interface FilterRelationsJaql {
  left: FilterRelationsJaqlNode;
  right: FilterRelationsJaqlNode;
  operator: 'AND' | 'OR';
}

/** A node of a {@link FilterRelationsJaql} tree that represents a filter */
export type FilterRelationsJaqlIdNode = { instanceid: string };
/** A node of a {@link FilterRelationsModel} tree that represents a filter */
export type FilterRelationsModelIdNode = { instanceId: string };
/**
 * A node of a {@link FilterRelationsModel} tree that represents a bracket expression
 *
 * @internal
 */
export type FilterRelationsModelBracketNode = { value: FilterRelationsModelNode };
