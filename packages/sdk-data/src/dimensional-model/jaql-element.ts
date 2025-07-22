import {
  createAttributeHelper,
  createCalculatedMeasureHelper,
  createMeasureHelper,
  getSortType,
} from '../utils.js';
import { DimensionalLevelAttribute } from './attributes.js';
import { DimensionalElement } from './base.js';
import { SortDirection } from './interfaces.js';
import {
  AnyObject,
  BaseJaql,
  DataType,
  FormulaJaql,
  JaqlSortDirection,
  JSONObject,
  MetadataItem,
  MetadataItemJaql,
  MetadataTypes,
} from './types.js';

/**
 * This implementation wraps metadata for a JAQL query. The metadata could be
 * for a dimension, measure, or filter. We do little to no interpretation of
 * the JAQL as it is designed to be "passed through" to the query execution
 * step.
 *
 * This will typically be used for JAQL metadata that is coming from a Sisense
 * instance and is assumed to be correct (e.g. dashboard widget, NLQ
 * suggestion).
 *
 * @param item - the metadata item in a JAQL query
 * @param type - the data type of the dimension
 * @internal
 */
export class JaqlElement extends DimensionalElement {
  /**
   * @internal
   */
  readonly __serializable: string = 'JaqlElement';

  private readonly metadataItem: MetadataItem;

  expression: string;

  skipValidation: boolean;

  // aggregation or formula is needed to differentiate between internal Category and Value
  // see isCategory() and isValue()
  // TODO refactor to create Attribute or Measure from MetadataItem
  aggregation?: string;

  formula?: string;

  sortType?: SortDirection;

  constructor(item: MetadataItem, type: string) {
    super(item.jaql.title ?? '', type);
    this.expression = (item.jaql.dim || item.jaql.formula) as string;
    this.metadataItem = item;

    if (item.jaql.agg) {
      this.aggregation = item.jaql.agg;
    } else {
      delete this.aggregation;
    }

    if (item.jaql.formula) {
      this.formula = item.jaql.formula;
    } else {
      delete this.formula;
    }

    if (item.jaql.sort) {
      this.sortType = getSortType(item.jaql.sort as JaqlSortDirection);
    } else {
      delete this.sortType;
    }

    this.skipValidation = true;
  }

  get id(): string {
    return this.expression;
  }

  jaql(nested?: true): MetadataItemJaql;
  jaql(nested?: false | undefined): MetadataItem;
  jaql(nested?: boolean): MetadataItemJaql | MetadataItem {
    return nested === true ? this.metadataItem.jaql : this.metadataItem;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();

    result.metadataItem = this.metadataItem as JSONObject;
    result.type = this.type;

    return result;
  }
}

const toMetadataType: Record<DataType, string> = {
  text: MetadataTypes.TextAttribute,
  numeric: MetadataTypes.NumericAttribute,
  datetime: MetadataTypes.DateLevel,
} as const;

/**
 * @internal
 */
export const isJaqlElement = (v: AnyObject): v is JaqlElement => {
  return v && v.__serializable === 'JaqlElement';
};

/**
 * Create a JaqlElement from a MetadataItem
 *
 * @param item - the metadata item in a JAQL query
 * @returns a JaqlElement
 * @internal
 */
export function createJaqlElement(item: MetadataItem): JaqlElement {
  // TODO: measures with a "formula" may not have a datatype. force this to be numeric because aggregations
  // will always be of type number. check if there is a more correct way to do this
  return new JaqlElement(item, toMetadataType[(item.jaql as BaseJaql).datatype] ?? 'numeric');
}

/**
 * Create a DimensionalElement from a MetadataItem
 *
 * @param item - the metadata item in a JAQL query
 * @returns a DimensionalElement
 * @internal
 */
export function createDimensionalElementFromMetadataItem(item: MetadataItem) {
  const { jaql } = item;

  // calculated measure
  if (jaql.formula) {
    return createCalculatedMeasureHelper(jaql as FormulaJaql);
  }

  const granularity = DimensionalLevelAttribute.translateJaqlToGranularity(jaql);

  // measure
  if ('agg' in jaql && jaql.dim && jaql.datatype) {
    return createMeasureHelper({
      expression: jaql.dim,
      dataType: jaql.datatype,
      agg: jaql.agg || '',
      granularity: granularity,
      format: undefined,
      sort: jaql.sort,
      title: jaql.title,
      dataSource: jaql.datasource,
    });
  }

  // attribute
  if (jaql.dim && jaql.datatype) {
    return createAttributeHelper({
      expression: jaql.dim,
      dataType: jaql.datatype,
      granularity: granularity,
      sort: jaql.sort,
      title: jaql.title,
      panel: item.panel,
      dataSource: jaql.datasource,
    });
  }

  // fall back to createJaqlElement
  return createJaqlElement(item);
}
