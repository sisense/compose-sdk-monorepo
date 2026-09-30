/* eslint-disable max-params */

/* eslint-disable no-underscore-dangle */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { TranslatableError } from '../../translation/translatable-error.js';
import {
  createAttribute,
  DimensionalAttribute,
  DimensionalLevelAttribute,
} from '../attributes/attributes.js';
import { DimensionalElement, resolveElementNames } from '../base.js';
import { isDimensionalDateDimension } from '../dimensions/dimensions.js';
import { create } from '../factory.js';
import {
  Attribute,
  BaseMeasure,
  CalculatedMeasure,
  isLevelAttribute,
  Measure,
  MeasureContext,
  MeasureTemplate,
} from '../interfaces.js';
import { isDatetime } from '../simple-column-types.js';
import {
  AggregationType,
  AggregationTypes,
  AnyObject,
  DateLevels,
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
    title?: string,
  ) {
    super(name, type, desc, dataSource, composeCode, title);

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

  static aggregationFromJAQL(agg: string): AggregationType {
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

      case 'stdevp':
        return AggregationTypes.StandardDeviationPop;

      case 'varp':
        return AggregationTypes.VariancePop;

      case 'mode':
        return AggregationTypes.Mode;
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

      case AggregationTypes.StandardDeviationPop:
        return 'stdevp';

      case AggregationTypes.VariancePop:
        return 'varp';

      case AggregationTypes.Mode:
        return 'mode';
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
    title?: string,
  ) {
    super(name, MetadataTypes.BaseMeasure, format, desc, sort, dataSource, composeCode, title);

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
      this.title,
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
      this.title,
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
        // uses `name` (not `title`) so query-time identity aliasing (e.g. sdk-ui's
        // per-measure `$measureN_` uniqueness prefix) round-trips through the JAQL response
        title: this.name,
        agg: DimensionalBaseMeasure.aggregationToJAQL(this.aggregation),
      },
    };

    const levelName = r.jaql.dateTimeLevel || r.jaql.level;
    if (levelName && hasDateMeasureLevel(this)) {
      r.format = { mask: { [levelName]: this._format || getDefaultDateMeasureFormat(this) } };
    } else if (this._format) {
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
 * Aggregations that keep the datatype of the aggregated attribute. Every other aggregation
 * returns a number, even over a datetime attribute.
 */
const DATATYPE_PRESERVING_AGGREGATIONS: readonly string[] = [
  AggregationTypes.Min,
  AggregationTypes.Max,
];

/** The whole formula is one `MIN` or `MAX` over one bracketed token, for example `MAX([D])`. */
const SINGLE_MIN_MAX_FORMULA = /^\s*(min|max)\s*\(\s*(\[[^\]]*\])\s*\)\s*$/i;

/** The formula opens with `MIN(` or `MAX(`, whatever else it carries after that. */
const LEADING_MIN_MAX = /^\s*(min|max)\s*\(/i;

/**
 * Resolves an element to the datetime attribute it stands for, or `undefined` when it is not one.
 *
 * Both measure shapes resolve through here, so they cannot disagree about a bare date dimension.
 *
 * @param element - An aggregated attribute or a formula context operand.
 * @returns The datetime attribute, or `undefined`.
 */
const asDateAttribute = (element: AnyObject | undefined): Attribute | undefined => {
  if (!element) {
    return undefined;
  }
  // A bare date dimension is queried at its default level, which is what carries the granularity.
  const resolved = (
    isDimensionalDateDimension(element) ? element[element.defaultLevel] : element
  ) as Attribute | undefined;

  return resolved && isDatetime(resolved.type) ? resolved : undefined;
};

/**
 * Checks whether an attribute is a date PART rather than a date.
 *
 * Week-of-year groups by the ordinal 1 to 53 and is sent as `dateTimePart`, so it answers a number.
 * Every real granularity translates to a `level` or a `dateTimeLevel`.
 *
 * @param attribute - The attribute to check.
 * @returns `true` when the attribute extracts a part instead of truncating to a granularity.
 */
const isDatePartAttribute = (attribute: Attribute): boolean => {
  if (!isLevelAttribute(attribute)) {
    return false;
  }
  const { level, dateTimeLevel } = attribute.translateGranularityToJaql();

  return level === undefined && dateTimeLevel === undefined;
};

/**
 * Returns the datetime attribute a `min`/`max` aggregation reads: the aggregation shape, what
 * the SDK builds.
 *
 * @param measure - The measure to read the aggregated attribute from
 * @returns The aggregated datetime attribute, or `undefined`
 */
const getAggregatedDateAttribute = (measure: AnyObject): Attribute | undefined => {
  if (
    !isDimensionalBaseMeasure(measure) ||
    !DATATYPE_PRESERVING_AGGREGATIONS.includes(measure.aggregation)
  ) {
    return undefined;
  }

  return asDateAttribute(measure.attribute);
};

/**
 * Checks whether a value is a {@link DimensionalCalculatedMeasure}, by its serializable tag.
 *
 * @param v - The value to check.
 * @returns `true` when `v` is tagged `DimensionalCalculatedMeasure`, otherwise `false`.
 * @internal
 */
export const isDimensionalCalculatedMeasure = (v: AnyObject): v is DimensionalCalculatedMeasure => {
  return Boolean(v && v.__serializable === 'DimensionalCalculatedMeasure');
};

/**
 * Returns the datetime attribute a formula answers with: the formula shape, what Fusion builds.
 *
 * A formula has no attribute, so the date operand comes from its context. Two ways in: the
 * datatype Fusion stamps at save time, and failing that a formula that is nothing but one
 * `MIN`/`MAX` over one token. The second stays strict on purpose, because a wider match would
 * treat formulas as dates whose result is not the operand's type.
 *
 * @param measure - The measure to read the context operand from.
 * @returns The datetime operand, or `undefined`.
 */
const getFormulaDateAttribute = (measure: AnyObject): Attribute | undefined => {
  if (!isDimensionalCalculatedMeasure(measure)) {
    return undefined;
  }
  const asDateOperand = (operand: AnyObject | undefined) =>
    asDateAttribute(operand) ?? getDateMeasureAttribute(operand ?? {});

  if (measure.datatype && isDatetime(measure.datatype)) {
    const dates = Object.values(measure.context ?? {})
      .map(asDateOperand)
      .filter((attribute): attribute is Attribute => attribute !== undefined);

    // with two date operands nothing says which one the result is, so return neither
    return dates.length === 1 ? dates[0] : undefined;
  }

  const [, , token] = SINGLE_MIN_MAX_FORMULA.exec(measure.expression ?? '') ?? [];

  return token ? asDateOperand(measure.context?.[token]) : undefined;
};

/**
 * Returns the datetime attribute that a date measure answers with.
 *
 * @param measure - The measure to read the attribute from.
 * @returns The datetime attribute, or `undefined` when the measure is not a date measure.
 * @internal
 */
export function getDateMeasureAttribute(measure: AnyObject): Attribute | undefined {
  return getAggregatedDateAttribute(measure) ?? getFormulaDateAttribute(measure);
}

/**
 * Checks whether the given measure answers with a date: a `min`/`max` aggregation over a datetime
 * attribute, or a formula the server stamped datetime, or a formula that is a bare `MIN`/`MAX` over
 * a datetime operand.
 *
 * A date PART is excluded: `max` of week-of-year answers an ordinal, and typing that as a date
 * would send it through the date mask and print a day in 1970.
 *
 * @param measure - The measure to check
 * @returns `true` when the measure answers with a date
 * @internal
 */
export const isDateMeasure = (measure: AnyObject): boolean => {
  const attribute = getDateMeasureAttribute(measure);

  return attribute !== undefined && !isDatePartAttribute(attribute);
};

/**
 * Checks whether a date measure carries a granularity level, which is what a date mask is keyed by.
 *
 * A date PART such as week-of-year answers an ordinal and carries `dateTimePart` instead, and a
 * datetime attribute with no level carries neither, so both are false. `jaql()`, the CSV export
 * mapper and the Excel export mapper all call this, so they cannot disagree.
 *
 * @param measure - The measure to check
 * @returns `true` when the measure is a date measure whose jaql carries a level
 * @internal
 */
export const hasDateMeasureLevel = (measure: AnyObject): boolean => {
  const attribute = getDateMeasureAttribute(measure);

  return attribute !== undefined && isLevelAttribute(attribute) && !isDatePartAttribute(attribute);
};

/**
 * Returns the `min` or `max` a date measure answers with, whichever shape it is written in.
 *
 * A pivot subtotal over dates only makes sense as the measure's own min or max, and the two shapes
 * keep it in different places: an aggregation on the measure, a function name in the formula. One
 * place decides it, so the payload and the pivot hook cannot disagree.
 *
 * @param measure - The measure to read the min or max from.
 * @returns `'min'`, `'max'`, or `undefined` when the measure is not a date measure or its formula
 * does not name one.
 * @internal
 */
export const getDateMeasureAggregation = (measure: AnyObject): string | undefined => {
  if (!isDateMeasure(measure)) {
    return undefined;
  }
  if (isDimensionalBaseMeasure(measure)) {
    return measure.aggregation;
  }
  const [, name] = SINGLE_MIN_MAX_FORMULA.exec(measure.expression ?? '') ?? [];
  // a stamped formula can carry more than the bare call, for example the filter operand in
  // `max([Date], [DateFilter])`, so the leading function name is read when the strict shape misses
  const [, leading] = LEADING_MIN_MAX.exec(measure.expression ?? '') ?? [];
  if (name ?? leading) {
    return (name ?? leading)?.toLowerCase();
  }

  /* A wrapper such as `pastyear([MaxDate])` names no aggregation of its own, so the answer is the
     one its single date operand carries. Without this a pivot subtotal over such a measure is sent
     as `undefined` and the warning that would report it is gated on the same value. */
  const aggregations = Object.values(measure.context ?? {})
    .map((operand) => getDateMeasureAggregation(operand as AnyObject))
    .filter((aggregation): aggregation is string => aggregation !== undefined);

  // two date operands say nothing about which the result is, the same rule the attribute follows
  return aggregations.length === 1 ? aggregations[0] : undefined;
};

/**
 * Returns what a date formula must carry beside its formula: the datatype, and the granularity of
 * its date operand when it has one. A formula has no `dim`, so without these nothing says its
 * answer is a date.
 *
 * @param measure - The measure to read the date operand from.
 * @returns The jaql fragment, or `undefined` when the measure does not answer with a date.
 */
const dateFormulaJaql = (measure: AnyObject): AnyObject | undefined => {
  const attribute = getDateMeasureAttribute(measure);
  if (!attribute || isDatePartAttribute(attribute)) {
    return undefined;
  }

  // a date column with no level still answers with a date, the same as its `max` does
  return isLevelAttribute(attribute)
    ? { datatype: 'datetime', ...attribute.translateGranularityToJaql() }
    : { datatype: 'datetime' };
};

/**
 * Returns the date format a date measure is displayed with when nothing else sets one.
 *
 * A date measure is displayed with the same format as a date column of the same granularity,
 * so that two columns of one widget can never disagree on how a date looks.
 *
 * @param measure - The date measure to resolve the format for
 * @returns A date format, never an empty one
 * @internal
 */
export const getDefaultDateMeasureFormat = (measure: AnyObject): string => {
  const daysFormat = DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.Days);
  const attribute = getDateMeasureAttribute(measure);

  if (!attribute || !isLevelAttribute(attribute)) {
    return daysFormat;
  }
  const levelFormat = DimensionalLevelAttribute.getDefaultFormatForGranularity(
    attribute.granularity,
  );
  // every level a date dimension builds already carries its granularity default, so only a format
  // that differs from that default can have come from the caller
  const callerFormat = attribute.getFormat() === levelFormat ? undefined : attribute.getFormat();

  if (callerFormat) {
    return callerFormat;
  }
  // A sub-day level's own format is time-of-day only (`HH:mm`), which does not read as a date.
  // Show the day instead, so every date measure is displayed as a date.
  if (DateLevels.timeOnly.includes(attribute.granularity)) {
    return daysFormat;
  }

  return levelFormat || daysFormat;
};

/**
 * Stands for a Calculated Measure
 *
 * @see {https://developer.sisense.com/guides/querying/useJaql/#step-7-adding-a-formula}
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
    title?: string,
    datatype?: string,
  ) {
    super(
      name,
      MetadataTypes.CalculatedMeasure,
      format,
      desc,
      sort,
      dataSource,
      composeCode,
      title,
    );

    this.expression = expression;
    this.context = context;
    this.datatype = datatype;
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
   * The datatype the saved jaql carried, when there was one. A formula has no attribute to read a
   * type from, so when present this says the result is a date. A bare `MIN`/`MAX` formula is read
   * as one even without it.
   */
  readonly datatype?: string;

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
      this.title,
      this.datatype,
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
      this.title,
      this.datatype,
    );
  }

  /**
   * Returns a copy carrying the given datatype. The ingest path must go through
   * `measureFactory.customFormula` to get `composeCode`, so it cannot call this constructor
   * directly. This copies the measure with the datatype added.
   *
   * @param datatype - The datatype the saved jaql carried.
   * @returns A new instance identical to this one but carrying the datatype.
   */
  withDatatype(datatype: string): DimensionalCalculatedMeasure {
    return new DimensionalCalculatedMeasure(
      this.name,
      this.expression,
      this.context,
      this._format,
      this.description,
      this._sort,
      this.dataSource,
      this.composeCode,
      this.title,
      datatype,
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
    /* A formula that is not a bare MIN or MAX has nothing to re-derive the stamp from, so dropping
       it here turns a date measure back into a number on the next round trip. */
    if (this.datatype !== undefined) {
      result.datatype = this.datatype;
    }

    return result;
  }

  jaql(nested?: boolean): any {
    const r = <any>{
      jaql: {
        // uses `name` (not `title`) so query-time identity aliasing (e.g. sdk-ui's
        // per-measure `$measureN_` uniqueness prefix) round-trips through the JAQL response
        title: this.name,
        formula: this.expression,
      },
    };

    const context: Record<string, any> = {};
    const keys = Object.getOwnPropertyNames(this.context);
    keys.forEach((k) => {
      const v = this.context[k];
      context[k] = v && typeof v.jaql === 'function' ? v.jaql(true) : v;
    });

    r.jaql.context = context;

    const dateJaql = dateFormulaJaql(this);
    if (dateJaql) {
      Object.assign(r.jaql, dateJaql);
    }

    const levelName = r.jaql.dateTimeLevel || r.jaql.level;
    if (dateJaql && levelName) {
      r.format = { mask: { [levelName]: this._format || getDefaultDateMeasureFormat(this) } };
    } else if (this._format) {
      r.format = { number: this._format };
    }

    if (this._sort != Sort.None) {
      r.jaql.sort = this._sort == Sort.Ascending ? 'asc' : 'desc';
    }

    return nested === true ? r.jaql : r;
  }
}

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
    title?: string,
  ) {
    super(name, MetadataTypes.MeasureTemplate, format, desc, sort, dataSource, composeCode, title);

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
      this.title,
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
      this.title,
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
  const { name, title } = resolveElementNames(json);
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
      throw new TranslatableError('errors.measure.dimensionalCalculatedMeasure.noContext', {
        measureName: name,
      });
    }

    const context: Record<string, any> = {};

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
      undefined,
      undefined,
      title,
      json.datatype,
    );
  } else if (MetadataTypes.isMeasureTemplate(json)) {
    if (att === undefined) {
      throw new TranslatableError(
        'errors.measure.dimensionalBaseMeasure.noAttributeDimExpression',
        { measureName: name },
      );
    }

    return new DimensionalMeasureTemplate(
      name,
      att,
      format,
      desc,
      sort,
      undefined,
      undefined,
      title,
    );
  } else if (MetadataTypes.isBaseMeasure(json)) {
    if (att === undefined) {
      throw new TranslatableError(
        'errors.measure.dimensionalBaseMeasure.noAttributeDimExpression',
        { measureName: name },
      );
    }

    const agg = json.agg || json.aggregation;
    if (!agg) {
      throw new TranslatableError('errors.measure.dimensionalBaseMeasure.noAggAggregation', {
        measureName: name,
      });
    }

    return new DimensionalBaseMeasure(
      name,
      att,
      agg,
      format,
      desc,
      sort,
      undefined,
      undefined,
      title,
    );
  }

  throw new TranslatableError('errors.measure.unsupportedType', { measureName: name });
}
