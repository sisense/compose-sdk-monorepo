import { DataSource } from '../interfaces.js';
import { DateLevel, FilterJaql, JaqlDataSource, JSONObject, Sort } from './types.js';

/**
 * @internal
 */
export interface DataModel {
  readonly name: string;
  readonly dataSource: DataSource;
  readonly metadata: Element[];
  [propName: string]: any;
}

/**
 * Common interface for elements of a dimensional model.
 *
 * @internal
 */
export interface Element {
  /**
   * Element name
   */
  name: string;

  /**
   * Element title
   *
   * @internal
   */
  title: string;

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
   * Data Source
   *
   * @internal
   */
  readonly dataSource?: JaqlDataSource;

  /**
   * @internal
   */
  readonly __serializable: string;

  /**
   * Gets a serializable representation of the element.
   *
   * @internal
   */
  serialize(): JSONObject;

  /**
   * Overrides JSON.stringify() behavior.
   *
   * @internal
   */
  toJSON(): JSONObject;

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

  /**
   * Optional CSDK code to initialize this element
   *
   * @internal
   */
  composeCode?: string;
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
 * @see {@link https://developer.sisense.com/guides/querying/useJaql/#step-7-adding-a-formula | Using the JAQL to Add A Formula}
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
   * Minutes level (for Live Models)
   */
  readonly Minutes: LevelAttribute;

  /**
   * Seconds level (for Live Models)
   */
  readonly Seconds: LevelAttribute;

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
 * Common interface of an attribute as in a dimensional model.
 *
 * An attribute is an extension of a {@link Column} in a generic {@link Data | data set}.
 */
export interface Attribute extends Element {
  /**
   * Expression representing the element in a {@link https://developer.sisense.com/guides/querying/useJaql/ | JAQL query}.
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
   * @returns A sorted instance of the attribute
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

  /**
   * Gets a {@link LevelAttribute} with the given granularity
   *
   * @param granularity - Date granularity
   * @returns New instance representing {@link LevelAttribute} with provided granularity
   * @internal
   */
  setGranularity(granularity: DateLevel): LevelAttribute;
}

/**
 * Runs type guard check for LevelAttribute.
 *
 * @param arg - object to check
 * @internal
 */
export function isLevelAttribute(arg: Attribute | LevelAttribute): arg is LevelAttribute {
  return 'granularity' in arg;
}

/**
 * Base filter configuration
 */
export interface BaseFilterConfig {
  /**
   * Optional filter identifier
   *
   * If not provided, a unique identifier will be generated.
   *
   * @category Base Configurations
   */
  readonly guid?: string;

  /**
   * Original filter JAQL
   *
   * @category Base Configurations
   * @internal
   */
  originalFilterJaql?: FilterJaql;

  /**
   * Boolean flag whether the filter is disabled
   *
   * If not specified, the default value is `false`.
   *
   * @category Base Configurations
   */
  disabled?: boolean;

  /**
   * Boolean flag whether the filter is locked
   *
   * If not specified, the default value is `false`.
   *
   * @category Base Configurations
   */
  locked?: boolean;
}

/**
 * Complete configuration for base filter
 *
 * All properties are required except for originalFilterJaql
 *
 * @internal
 */
export type CompleteBaseFilterConfig = Required<Omit<BaseFilterConfig, 'originalFilterJaql'>> & {
  originalFilterJaql?: FilterJaql;
};

/**
 * Configurations for members filter
 */
export interface MembersFilterConfig extends BaseFilterConfig {
  /**
   * Boolean flag whether selected members are excluded or included in the filter
   *
   * If not specified, the default value is false.
   *
   * @category Extended Configurations
   */
  excludeMembers?: boolean;

  /**
   * Boolean flag whether selection of multiple members is enabled
   *
   * If not specified, the default value is `true`.
   *
   * @category Extended Configurations
   */
  enableMultiSelection?: boolean;

  /**
   * Optional list of members to be shown as deactivated in the `MemberFilterTile` component.
   *
   * This list should not contain members that are already included in the filter.
   *
   * @category Extended Configurations
   */
  deactivatedMembers?: string[];

  /**
   * Optional filter to be applied in the background
   */
  backgroundFilter?: Filter;
}

/**
 * Complete configuration for members filter
 *
 * All properties are required except for originalFilterJaql and backgroundFilter
 *
 * @internal
 */
export type CompleteMembersFilterConfig = Required<
  Omit<MembersFilterConfig, 'originalFilterJaql' | 'backgroundFilter'>
> & {
  originalFilterJaql?: FilterJaql;
  backgroundFilter?: Filter;
};

/**
 * @internal
 */
export type FilterConfig = CompleteBaseFilterConfig | CompleteMembersFilterConfig;

/**
 * Base interface for filter. See {@link filterFactory} for how to create filters.
 */
export interface Filter extends Element {
  /**
   * Attribute this filter instance is filtering
   *
   * @internal
   */
  readonly attribute: Attribute;

  /**
   * Filter type
   */
  readonly filterType: string;

  /**
   * Boolean flag whether the filter is a scope filter
   * which is on a dimension that isn’t used in the query
   *
   * @internal
   */
  isScope: boolean;

  /**
   * Filter config
   *
   * @internal
   */
  config: FilterConfig;

  /**
   * Gets JAQL representing this Filter instance
   *
   * @internal
   */
  filterJaql(): any;
}

/**
 * Context for a custom formula, as defined by `measureFactory.customFormula()`
 */
export interface CustomFormulaContext {
  [key: string]: Attribute | Measure | Filter;
}

/**
 * Wrapped attribute with additional options for pivot table
 */
export interface PivotAttribute {
  attribute: Attribute;
  includeSubTotals?: boolean;
  sort?: PivotRowsSort;
  /**
   * Custom name to override the default attribute name in pivot table headers.
   * If provided, this will be used as the display title in the pivot table.
   */
  name?: string;
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
  totalsCalculation?: TotalsCalculation;
  /**
   * @internal
   */
  dataBars?: boolean;
  /**
   * @internal
   */
  shouldRequestMinMax?: boolean;
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
export type PivotGrandTotals = {
  rows?: boolean;
  columns?: boolean;
};

/**
 * @internal
 */
export const DEFAULT_PIVOT_GRAND_TOTALS: PivotGrandTotals = {
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
  | FilterRelationsModelCascadeNode
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
 * @privateRemarks
 * Unlike {@link FilterRelationsModel} or {@link FilterRelationsJaql},
 * this interface contains filter objects, not just id nodes
 */
export interface FilterRelations {
  left: FilterRelationsNode;
  right: FilterRelationsNode;
  operator: 'AND' | 'OR';
  /**
   * Compose code for the filter relations
   *
   * @internal
   */
  composeCode?: string;
}

/**
 * Model of filter logical relations (AND/OR) from Fusion dashboard
 *
 * @internal
 */
export interface FilterRelationsModel {
  type: 'LogicalExpression';
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

/**
 * A node of a {@link FilterRelationsJaql} tree that represents a filter
 *
 * @internal
 */
export type FilterRelationsJaqlIdNode = { instanceid: string };
/**
 * A node of a {@link FilterRelationsModel} tree that represents a filter
 *
 * @internal
 */
export type FilterRelationsModelIdNode = { type: 'Identifier'; instanceId: string };
/**
 * A node of a {@link FilterRelationsModel} tree that represents a bracket expression
 *
 * @internal
 */
export type FilterRelationsModelBracketNode = {
  type: 'ParenthesizedLogicalExpression';
  value: FilterRelationsModelNode;
};
/**
 * A node of a {@link FilterRelationsModel} tree that represents a cascading filter
 *
 * @internal
 */
export type FilterRelationsModelCascadeNode = {
  type: 'CascadingIdentifier';
  levels: FilterRelationsModelIdNode[];
};

/**
 * Sorting direction, either in Ascending order, Descending order, or None
 */
export type SortDirection = 'sortAsc' | 'sortDesc' | 'sortNone';

/**
 * @internal
 */
export function isSortDirection(sortDirection: unknown): sortDirection is SortDirection {
  const SORT_DIRECTIONS: readonly SortDirection[] = ['sortAsc', 'sortDesc', 'sortNone'] as const;
  return (
    typeof sortDirection === 'string' && SORT_DIRECTIONS.includes(sortDirection as SortDirection)
  );
}

/**
 * Sorting configuration for pivot "rows".
 *
 * This configuration allows sorting pivot "rows" either by their data or by data in a specific "values" column.
 *
 * @example
 * Examples of sorting configurations for various scenarios:
 *
 * (1) Row sorted in ascending order by its data:
 * ```ts
 * { direction: 'sortAsc' }
 * ```
 *
 * (2) Row sorted in descending order by data in the first "values" column (index 0):
 * ```ts
 * {
 *    direction: 'sortDesc',
 *    by: {
 *      valuesIndex: 0,
 *    }
 * }
 * ```
 *
 * (3) Row sorted in ascending order by data in the second "values" column (index 1) under the "columns" values of "Female" (for Gender) and "0-18" (for AgeRange):
 * ```ts
 * {
 *    direction: 'sortAsc',
 *    by: {
 *      valuesIndex: 1,
 *      columnsMembersPath: ['Female', '0-18']
 *    }
 * }
 * ```
 */
export type PivotRowsSort = {
  /** {@inheritDoc SortDirection} */
  direction: SortDirection;
  /** Sorting target configuration, allowing sorting "rows" by the data in a specific "values" column */
  by?: {
    /** Index of the target "values" item (measure) */
    valuesIndex?: number;
    /** Path to the target column if selected "columns" items (dimensions) are involved */
    columnsMembersPath?: (string | number)[];
  };
};
