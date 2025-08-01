/* eslint-disable max-params */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { TranslatableError } from '../../translation/translatable-error.js';
import { createAttribute, DimensionalAttribute } from '../attributes.js';
import { DimensionalElement } from '../base.js';
import { create } from '../factory.js';
import {
  Attribute,
  BaseMeasure,
  CalculatedMeasure,
  Measure,
  MeasureContext,
  MeasureTemplate,
} from '../interfaces.js';
import {
  AggregationTypes,
  AnyObject,
  JaqlDataSource,
  JSONObject,
  MetadataTypes,
  Sort,
} from '../types.js';
import * as m from './factory.js';

/**
 * @internal
 */
export abstract class AbstractMeasure extends DimensionalElement {
  /**
   * @internal
   */
  readonly __serializable: string = 'AbstractMeasure';

  protected _sort: Sort = Sort.None;

  protected _format: string | undefined = '#,#.00';

  constructor(
    name: string,
    type: string,
    format?: string,
    desc?: string,
    sort?: Sort,
    dataSource?: JaqlDataSource,
    composeCode?: string,
  ) {
    super(name, type, desc, dataSource, composeCode);

    this._format = format;
    this._sort = sort || Sort.None;
  }

  /**
   * gets the element's ID
   */
  abstract get id(): string;

  /**
   * Gets the sort definition of this instance
   *
   * @returns The Sort definition of this instance
   */
  getSort(): Sort {
    return this._sort;
  }

  /**
   * The string formatting of this instance
   *
   * @returns string formatting
   */
  getFormat(): string | undefined {
    return this._format;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();

    if (this.getFormat() !== undefined) {
      result.format = this.getFormat();
    }

    if (this.getSort() !== undefined) {
      result.sort = this.getSort();
    }

    return result;
  }

  /**
   * Gets a sorted {@link Measure} with the given definition
   *
   * @param sort - Sort definition
   * @returns An instance representing the sorted  {@link Measure} of this instance
   */
  abstract sort(sort: Sort): Measure;

  /**
   * Gets a formatted {@link Measure} with the given definition
   *
   * @param format - Format string
   * @returns An instance representing the formatted {@link Measure} of this instance
   */
  abstract format(format: string): Measure;
}

/**
 * Stands for a Base measure - Aggregation over an Attribute
 *
 * @internal
 */
export class DimensionalBaseMeasure extends AbstractMeasure implements BaseMeasure {
  /**
   * @internal
   */
  readonly __serializable: string = 'DimensionalBaseMeasure';

  static aggregationFromJAQL(agg: string): string {
    switch (agg) {
      case 'sum':
        return AggregationTypes.Sum;

      case 'avg':
        return AggregationTypes.Average;

      case 'min':
        return AggregationTypes.Min;

      case 'max':
        return AggregationTypes.Max;

      case 'countduplicates':
        return AggregationTypes.Count;

      case 'median':
        return AggregationTypes.Median;

      case 'count':
        return AggregationTypes.CountDistinct;

      case 'var':
        return AggregationTypes.Variance;

      case 'stdev':
        return AggregationTypes.StandardDeviation;
    }

    return AggregationTypes.Sum;
  }

  static aggregationToJAQL(agg: string): string {
    switch (agg) {
      case AggregationTypes.Sum:
        return 'sum';

      case AggregationTypes.Average:
        return 'avg';

      case AggregationTypes.Min:
        return 'min';

      case AggregationTypes.Max:
        return 'max';

      case AggregationTypes.Count:
        return 'countduplicates';

      case AggregationTypes.CountDistinct:
        return 'count';

      case AggregationTypes.Median:
        return 'median';

      case AggregationTypes.Variance:
        return 'var';

      case AggregationTypes.StandardDeviation:
        return 'stdev';
    }

    return AggregationTypes.Sum;
  }

  constructor(
    name: string,
    attribute: Attribute,
    agg: string,
    format?: string,
    desc?: string,
    sort?: Sort,
    dataSource?: JaqlDataSource,
    composeCode?: string,
  ) {
    super(name, MetadataTypes.BaseMeasure, format, desc, sort, dataSource, composeCode);

    this.attribute = attribute;
    this.aggregation = agg;
  }

  /**
   * Aggregating attribute
   */
  readonly attribute: Attribute;

  /**
   * Aggregation type
   */
  readonly aggregation: string;

  /**
   * Gets a sorted {@link Measure} with the given definition
   *
   * @param sort - Sort definition
   * @returns An instance representing the sorted {@link Measure} of this instance
   */
  sort(sort: Sort): Measure {
    return new DimensionalBaseMeasure(
      this.name,
      this.attribute,
      this.aggregation,
      this._format,
      this.description,
      sort,
      this.dataSource,
      this.composeCode,
    );
  }

  /**
   * Gets a formatted {@link Measure} with the given definition
   *
   * Input string is in Numeral format - @see http://numeraljs.com/
   *
   * @param format - Format string
   * @returns An instance representing the formatted {@link Measure} of this instance
   */
  format(format: string): Measure {
    return new DimensionalBaseMeasure(
      this.name,
      this.attribute,
      this.aggregation,
      format,
      this.description,
      this._sort,
      this.dataSource,
      this.composeCode,
    );
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return `${this.attribute.expression}_${this.aggregation}`;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    result.aggregation = this.aggregation;
    result.attribute = this.attribute.serialize();

    return result;
  }

  jaql(nested?: boolean): any {
    const attributeJaql = this.attribute.jaql(true);
    const r = <any>{
      jaql: {
        ...attributeJaql,
        title: this.name,
        agg: DimensionalBaseMeasure.aggregationToJAQL(this.aggregation),
      },
    };

    if (this._format) {
      r.format = { number: this._format };
    }

    if (this._sort != Sort.None) {
      r.jaql.sort = this._sort == Sort.Ascending ? 'asc' : 'desc';
    }

    return nested === true ? r.jaql : r;
  }
}

/**
 * @internal
 */
export const isDimensionalBaseMeasure = (v: AnyObject): v is DimensionalBaseMeasure => {
  return Boolean(v && v.__serializable === 'DimensionalBaseMeasure');
};

/**
 * Stands for a Calculated Measure
 *
 * @see {https://sisense.dev/guides/querying/useJaql/#step-7-adding-a-formula}
 * @internal
 */
export class DimensionalCalculatedMeasure extends AbstractMeasure implements CalculatedMeasure {
  /**
   * @internal
   */
  readonly __serializable: string = 'DimensionalCalculatedMeasure';

  constructor(
    name: string,
    expression: string,
    context: MeasureContext,
    format?: string,
    desc?: string,
    sort?: Sort,
    dataSource?: JaqlDataSource,
    composeCode?: string,
  ) {
    super(name, MetadataTypes.CalculatedMeasure, format, desc, sort, dataSource, composeCode);

    this.expression = expression;
    this.context = context;
  }

  /**
   * Defines the Calculated measure's expression
   */
  expression: string;

  /**
   * Defines the Calculated measure's context
   */
  context: MeasureContext;

  /**
   * Gets a sorted {@link Measure} with the given definition
   *
   * @param sort - Sort definition
   * @returns An instance representing the sorted {@link Measure} of this instance
   */
  sort(sort: Sort): Measure {
    return new DimensionalCalculatedMeasure(
      this.name,
      this.expression,
      this.context,
      this._format,
      this.description,
      sort,
      this.dataSource,
      this.composeCode,
    );
  }

  /**
   * Gets a formatted {@link Measure} with the given definition
   *
   * Input string is in Numeral format - @see http://numeraljs.com/
   *
   * @param format - Format string
   * @returns An instance representing the formatted {@link Measure} of this instance
   */
  format(format: string): Measure {
    return new DimensionalCalculatedMeasure(
      this.name,
      this.expression,
      this.context,
      format,
      this.description,
      this._sort,
      this.dataSource,
      this.composeCode,
    );
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return this.expression;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    result.expression = this.expression;
    result.context = Object.fromEntries(
      Object.entries(this.context).map(([key, value]) => [
        key,
        value.serialize ? value.serialize() : value,
      ]),
    );

    return result;
  }

  jaql(nested?: boolean): any {
    const r = <any>{
      jaql: {
        title: this.name,
        formula: this.expression,
      },
    };

    const context = {};
    const keys = Object.getOwnPropertyNames(this.context);
    keys.forEach((k) => (context[k] = this.context[k].jaql(true)));

    r.jaql.context = context;

    if (this._format) {
      r.format = { number: this._format };
    }

    if (this._sort != Sort.None) {
      r.jaql.sort = this._sort == Sort.Ascending ? 'asc' : 'desc';
    }

    return nested === true ? r.jaql : r;
  }
}

/**
 * @internal
 */
export const isDimensionalCalculatedMeasure = (v: AnyObject): v is DimensionalCalculatedMeasure => {
  return Boolean(v && v.__serializable === 'DimensionalCalculatedMeasure');
};

/**
 * Stands for a Measure template - generator for different aggregation over Attribute
 *
 * @internal
 */
export class DimensionalMeasureTemplate extends AbstractMeasure implements MeasureTemplate {
  /**
   * @internal
   */
  readonly __serializable: string = 'DimensionalMeasureTemplate';

  constructor(
    name: string,
    attribute: Attribute,
    format?: string,
    desc?: string,
    sort?: Sort,
    dataSource?: JaqlDataSource,
    composeCode?: string,
  ) {
    super(name, MetadataTypes.MeasureTemplate, format, desc, sort, dataSource, composeCode);

    this.attribute = attribute;
  }

  /**
   * Aggregating attribute
   */
  readonly attribute: Attribute;

  /**
   * gets the element's ID
   */
  get id(): string {
    return `${this.attribute.expression}_*`;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();

    result.attribute = this.attribute.serialize();

    return result;
  }

  /**
   * Gets a sorted {@link MeasureTemplate} with the given definition
   *
   * @param sort - Sort definition
   * @returns An instance representing the sorted {@link MeasureTemplate} of this instance
   */
  sort(sort: Sort): MeasureTemplate {
    return new DimensionalMeasureTemplate(
      this.name,
      this.attribute,
      this._format,
      this.description,
      sort,
      this.dataSource,
      this.composeCode,
    );
  }

  /**
   * Gets a formatted {@link Measure} with the given definition
   *
   * @param format - Format string
   * @returns An instance representing the formatted {@link Measure} of this instance
   */
  format(format: string): Measure {
    return new DimensionalMeasureTemplate(
      this.name,
      this.attribute,
      format,
      this.description,
      this._sort,
      this.dataSource,
      this.composeCode,
    );
  }

  /**
   * Gets the JAQL representation of this instance
   *
   * @param nested - defines whether the JAQL is nested within parent JAQL statement or a root JAQL element
   */
  jaql(nested?: boolean): any {
    return this.sum(this._format).sort(this._sort).jaql(nested);
  }

  /**
   * Gets an {@link Measure} defined with sum aggregation
   *
   * @param format - optional format to apply on the resulting {@link Measure}
   */
  sum(format?: string): Measure {
    return m.sum(this.attribute, undefined, format).sort(this._sort);
  }

  /**
   * Gets an {@link Measure} defined with average aggregation
   *
   * @param format - optional format to apply on the resulting {@link Measure}
   */
  average(format?: string): Measure {
    return m.average(this.attribute, undefined, format).sort(this._sort);
  }

  /**
   * Gets an {@link Measure} defined with median aggregation
   *
   * @param format - optional format to apply on the resulting {@link Measure}
   */
  median(format?: string): Measure {
    return m.median(this.attribute, undefined, format).sort(this._sort);
  }

  /**
   * Gets an {@link Measure} defined with min aggregation
   *
   * @param format - optional format to apply on the resulting {@link Measure}
   */
  min(format?: string): Measure {
    return m.min(this.attribute, undefined, format).sort(this._sort);
  }

  /**
   * Gets an {@link Measure} defined with max aggregation
   *
   * @param format - optional format to apply on the resulting {@link Measure}
   */
  max(format?: string): Measure {
    return m.max(this.attribute, undefined, format).sort(this._sort);
  }

  /**
   * Gets an {@link Measure} defined with count aggregation
   *
   * @param format - optional format to apply on the resulting {@link Measure}
   */
  count(format?: string): Measure {
    return m.count(this.attribute, undefined, format).sort(this._sort);
  }

  /**
   * Gets an {@link Measure} defined with count distinct aggregation
   *
   * @param format - optional format to apply on the resulting {@link Measure}
   */
  countDistinct(format?: string): Measure {
    return m.countDistinct(this.attribute, undefined, format).sort(this._sort);
  }
}

/**
 * @internal
 */
export const isDimensionalMeasureTemplate = (v: AnyObject): v is DimensionalMeasureTemplate => {
  return Boolean(v && v.__serializable === 'DimensionalMeasureTemplate');
};

/**
 * @param json - The JSON object to create a measure from
 * @internal
 */
export function createMeasure(json: any): Measure | BaseMeasure {
  const name = json.name || json.title;
  const desc = json.desc || json.description;
  const format = json.format;
  const sort = json.sort ?? <Sort>json.sort;

  let att: Attribute | undefined = undefined;

  // legacy
  const exp = json.dim || json.expression;
  if (exp) {
    att = new DimensionalAttribute(exp, exp, undefined, desc);
  }

  // official SDK
  if (json.attribute) {
    att = createAttribute(json.attribute);
  }

  if (MetadataTypes.isCalculatedMeasure(json)) {
    if (json.context === undefined) {
      throw new TranslatableError('errors.measure.dimensionalCalculatedMeasure.noContext');
    }

    const context = {};

    Object.getOwnPropertyNames(json.context).forEach((pname) => {
      context[pname] = create(json.context[pname]);
    });

    return new DimensionalCalculatedMeasure(
      name,
      json.expression || json.formula,
      context,
      format,
      desc,
      sort,
    );
  } else if (MetadataTypes.isMeasureTemplate(json)) {
    if (att === undefined) {
      throw new TranslatableError('errors.measure.dimensionalBaseMeasure.noAttributeDimExpression');
    }

    return new DimensionalMeasureTemplate(name, att, format, desc, sort);
  } else if (MetadataTypes.isBaseMeasure(json)) {
    if (att === undefined) {
      throw new TranslatableError('errors.measure.dimensionalBaseMeasure.noAttributeDimExpression');
    }

    const agg = json.agg || json.aggregation;
    if (!agg) {
      throw new TranslatableError('errors.measure.dimensionalBaseMeasure.noAggAggregation');
    }

    return new DimensionalBaseMeasure(name, att, agg, format, desc, sort);
  }

  throw new TranslatableError('errors.measure.unsupportedType');
}
