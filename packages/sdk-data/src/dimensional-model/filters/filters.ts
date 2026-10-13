/* eslint-disable max-lines */
import hash from 'hash-it';
import merge from 'lodash-es/merge.js';
import omit from 'lodash-es/omit.js';

import { TranslatableError } from '../../translation/translatable-error.js';
import { DimensionalElement } from '../base.js';
import { create } from '../factory.js';
import {
  Attribute,
  BaseFilterConfig,
  BaseMeasure,
  CompleteBaseFilterConfig,
  CompleteMembersFilterConfig,
  Filter,
  LevelAttribute,
  Measure,
  MembersFilterConfig,
} from '../interfaces.js';
import {
  getDateMeasureAttribute,
  isDateMeasure,
  isDimensionalBaseMeasure,
  isDimensionalCalculatedMeasure,
} from '../measures/measures.js';
import { AnyObject, DateLevels, JSONObject, JSONValue, MetadataTypes } from '../types.js';
import {
  getDefaultBaseFilterConfig,
  getDefaultMembersFilterConfig,
} from './filter-config-utils.js';

/**
 * Different text operators that can be used with text filters
 *
 * @internal
 */
export const TextOperators = {
  Contains: 'contains',
  StartsWith: 'startsWith',
  EndsWith: 'endsWith',
  Equals: 'equals',
  DoesntEqual: 'doesntEqual',
  DoesntStartWith: 'doesntStartWith',
  DoesntContain: 'doesntContain',
  DoesntEndWith: 'doesntEndWith',
  Like: 'like',
} as const;

/**
 * Different numeric operators that can be used with numeric filters
 */
export const NumericOperators = {
  Equals: 'equals',
  DoesntEqual: 'doesntEqual',
  From: 'from',
  FromNotEqual: 'fromNotEqual',
  To: 'to',
  ToNotEqual: 'toNotEqual',
} as const;

/**
 * Different date operators that can be used with date filters
 *
 * @internal
 */
export const DateOperators = {
  From: 'from',
  FromNotEqual: 'fromNotEqual',
  To: 'to',
  ToNotEqual: 'toNotEqual',
  Last: 'last',
  Next: 'next',
  Anchor: 'Anchor',
} as const;

/**
 * Different logical operators that can be used with logical filters
 *
 * @internal
 */
export const LogicalOperators = {
  Union: 'or',
  Intersection: 'and',
  Exclude: 'exclude',
};

/**
 * Different ranking operators that can be used with ranking filter
 *
 * @internal
 */
export const RankingOperators = {
  Top: 'top',
  Bottom: 'bottom',
} as const;

/**
 * Different filter types
 *
 * @internal
 */
export const FilterTypes = {
  logicalAttribute: 'logicalAttribute',
  members: 'members',
  exclude: 'exclude',
  measure: 'measure',
  ranking: 'ranking',
  measureRanking: 'measure-ranking',
  dateMeasureMembers: 'date-measure-members',
  dateMeasureRelative: 'date-measure-relative',
  text: 'text',
  empty: 'empty',
  numeric: 'numeric',
  dateRange: 'dateRange',
  relativeDate: 'relativeDate',
  cascading: 'cascading',
  advanced: 'advanced',
} as const;

// CLASSES

/**
 * base implementation for filter classes
 *
 * @internal
 */
abstract class AbstractFilter extends DimensionalElement implements Filter {
  /**
   * @internal
   */
  readonly __serializable: string = 'AbstractFilter';

  /**
   * Attribute this filter instance is filtering
   */
  readonly attribute: Attribute;

  /**
   * Filter type
   */
  readonly filterType: string;

  /**
   * Filter configuration
   */
  config: CompleteBaseFilterConfig;

  constructor(att: Attribute, filterType: string, config?: BaseFilterConfig, composeCode?: string) {
    super('filter', MetadataTypes.Filter, undefined, undefined, composeCode);
    this.filterType = filterType;

    // need to set isScope
    // to make filter complete for comparison
    this.isScope = true;

    AbstractFilter.checkAttributeSupport(att);
    this.attribute = att;

    this.config = merge({}, getDefaultBaseFilterConfig(), config ?? {});
  }

  get name(): string {
    // to hexadecimal string
    return hash(this.jaql()).toString(16);
  }

  /**
   * Gets JAQL representing this Filter instance
   */
  abstract filterJaql(): any;

  /**
   * gets the element's ID
   */
  abstract get id(): string;

  /**
   * Defines whether the filter is a scope filters
   */
  isScope: boolean;

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();

    result.filterType = this.filterType;
    result.attribute = this.attribute.serialize();
    if (this.config) {
      result.config = this.config;
    }
    result.composeCode = this.composeCode;

    return result;
  }

  /**
   * Gets the JAQL representation of this instance
   *
   * @param nested - defines whether the JAQL is nested within parent JAQL statement or a root JAQL element
   */
  jaql(nested?: boolean): any {
    if (this.config.disabled) {
      return AbstractFilter.disabledJaql(nested);
    }

    const result = this.attribute.jaql(false);

    const level = this.attribute as LevelAttribute;
    if (level.getFormat && level.getFormat() !== undefined) {
      const granularityJaql = level.translateGranularityToJaql();
      result.format = {
        mask: {
          [granularityJaql.level as string]: level.getFormat(),
        },
      };
    }

    result.jaql.filter = this.filterJaql();

    // Preserve agg from original filter JAQL when the attribute doesn't carry it
    // (e.g., a members filter whose underlying field is an aggregated measure)
    if (!result.jaql.agg && this.config.originalFilterJaql?.agg) {
      result.jaql.agg = this.config.originalFilterJaql.agg;
    }

    // prioritize attribute dataSource for the use case of multi-source dashboard
    if (this.attribute.dataSource) {
      result.jaql.datasource = this.attribute.dataSource;
    }

    if (this.isScope) {
      result.panel = 'scope';
    }

    return nested === true ? result.jaql : result;
  }

  static checkAttributeSupport(attribute: Attribute) {
    const { granularity } = attribute as LevelAttribute;
    if (
      granularity === DateLevels.Hours ||
      granularity === DateLevels.MinutesRoundTo30 ||
      granularity === DateLevels.MinutesRoundTo15 ||
      granularity === DateLevels.Minutes ||
      granularity === DateLevels.Seconds
    ) {
      throw new TranslatableError('errors.filter.unsupportedDatetimeLevel');
    }
  }

  static disabledJaql(nested?: boolean): any {
    return nested ? { filter: {} } : { jaql: { filter: {} } };
  }
}

/**
 * @internal
 */
export class LogicalAttributeFilter extends AbstractFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'LogicalAttributeFilter';

  readonly filters: Filter[];

  readonly operator: string;

  constructor(
    filters: Filter[],
    operator: string,
    config?: BaseFilterConfig,
    composeCode?: string,
  ) {
    super(filters[0].attribute, FilterTypes.logicalAttribute, config, composeCode);

    this.operator = operator;
    this.filters = filters;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return `${this.operator}_${this.filters.map((f) => f.id).join()}`;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    result.operator = this.operator;
    result.filters = this.filters.map((f) => f.serialize());

    return result;
  }

  /**
   * Gets JAQL representing this Filter instance
   */
  filterJaql(): any {
    const result = <any>{};
    result[this.operator] = this.filters.map((f) => f.filterJaql());

    return result;
  }
}

/**
 * @internal
 */
export class MembersFilter extends AbstractFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'MembersFilter';

  readonly members: string[];

  config: CompleteMembersFilterConfig;

  constructor(
    attribute: Attribute,
    members?: string[],
    config?: MembersFilterConfig,
    composeCode?: string,
    filterType: string = FilterTypes.members,
  ) {
    super(attribute, filterType, undefined, composeCode);
    this.members = members ?? [];

    if (this.members.filter((m) => m === null || m === undefined).length > 0) {
      throw new TranslatableError('errors.filter.membersFilterNullMember', {
        attributeId: attribute.id,
      });
    }

    // merge default config and input config into a new object
    // to avoid mutation
    this.config = merge({}, getDefaultMembersFilterConfig(), config ?? {});
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return `${this.attribute.id}_${this.members.map((m) => m.toString()).join()}`;
  }

  get name(): string {
    // to hexadecimal string
    return hash([this.jaql(), omit(this.config, ['guid', 'originalFilterJaql'])]).toString(16);
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    if (this.config) {
      result.config = (
        this.config.backgroundFilter
          ? { ...this.config, backgroundFilter: this.config.backgroundFilter.serialize() }
          : this.config
      ) as JSONObject;
    }
    result.members = this.members;
    return result;
  }

  /**
   * Gets JAQL representing this Filter instance
   */
  filterJaql(): any {
    const membersFilterJaql = {
      members: this.members.map((m) => m.toString()),
    };

    const filterJaql = this.config.excludeMembers
      ? { exclude: membersFilterJaql }
      : membersFilterJaql;

    if (this.config.backgroundFilter) {
      return {
        and: [filterJaql, this.config.backgroundFilter.filterJaql()],
      };
    }

    return filterJaql;
  }
}

/**
 * @internal
 */
export class CascadingFilter extends AbstractFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'CascadingFilter';

  // level filters
  readonly _filters: Filter[];

  constructor(filters: Filter[], config?: BaseFilterConfig, composeCode?: string) {
    super(filters[0].attribute, FilterTypes.cascading, config, composeCode);
    this._filters = filters;
  }

  /**
   * Returns the level filters with the root config applied.
   */
  get filters(): Filter[] {
    const { disabled, locked } = this.config;

    return this._filters.map((filter) => {
      filter.config = { ...filter.config, disabled, locked };
      return filter;
    });
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return `${this.filterType}_${this._filters.map((f) => f.id).join()}`;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    result._filters = this.filters.map((f) => f.serialize());
    return result;
  }

  /**
   * Gets JAQL representing this Filter instance
   */
  filterJaql(): any {
    // return empty object as jaql is handled by jaql() method
    return {};
  }

  jaql(nested?: boolean): any {
    if (this.config.disabled) {
      return AbstractFilter.disabledJaql(nested);
    }

    // return jaql of all level filters treated as scope filters
    return this.filters.map((f) => {
      f.isScope = true;
      return f.jaql(nested);
    });
  }
}

/**
 * @internal
 */
export class ExcludeFilter extends AbstractFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'ExcludeFilter';

  readonly filter: Filter;

  readonly input?: Filter;

  constructor(filter: Filter, input?: Filter, config?: BaseFilterConfig, composeCode?: string) {
    super(filter.attribute, FilterTypes.exclude, config, composeCode);

    this.input = input;
    this.filter = filter;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    let result = `exclude_${this.filter.id}`;

    if (this.input) {
      result += '_from_' + this.input.id;
    }

    return result;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();

    result.filter = this.filter.serialize();

    if (this.input) {
      result.input = this.input.serialize();
    }

    return result;
  }

  /**
   * Gets JAQL representing this Filter instance
   */
  filterJaql(): any {
    const result = <any>{};

    const exclusion = this.filter.filterJaql();

    if (this.input) {
      result.filter = this.input.filterJaql();
      result.filter.filter = { exclude: exclusion };
    } else {
      result.exclude = exclusion;
    }

    return result;
  }
}

/**
 * @internal
 */
export class DoubleOperatorFilter<Type> extends AbstractFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'DoubleOperatorFilter';

  operatorA?: string;

  operatorB?: string;

  valueA?: Type;

  valueB?: Type;

  constructor(
    att: Attribute,
    filterType: string,
    operatorA?: string,
    valueA?: Type,
    operatorB?: string,
    valueB?: Type,
    config?: BaseFilterConfig,
    composeCode?: string,
  ) {
    super(att, filterType, config, composeCode);

    if (operatorA && valueA !== undefined) {
      this.valueA = valueA;
      this.operatorA = operatorA;
    }

    if (operatorB && valueB !== undefined) {
      this.operatorB = operatorB;
      this.valueB = valueB;
    }
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    let result = `${this.attribute.id}`;

    if (this.operatorA && this.valueA !== undefined) {
      result += `_${this.operatorA}:${this.valueA}`;
    }

    if (this.operatorB && this.valueB !== undefined) {
      result += `_${this.operatorB}:${this.valueB}`;
    }

    return result;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    if (this.operatorA) {
      result.operatorA = this.operatorA;
    }

    if (this.operatorB) {
      result.operatorB = this.operatorB;
    }

    if (this.valueA !== undefined) {
      result.valueA = this.valueA as JSONValue;
    }

    if (this.valueB !== undefined) {
      result.valueB = this.valueB as JSONValue;
    }

    return result;
  }

  /**
   * Gets JAQL representing this Filter instance
   */
  filterJaql(): any {
    const result = <any>{};

    if (this.operatorA && this.valueA !== undefined) {
      result[this.operatorA] = this.valueA;
    }

    if (this.operatorB && this.valueB !== undefined) {
      result[this.operatorB] = this.valueB;
    }

    return result;
  }
}

/**
 * Puts a measure's own jaql keys onto a filter item.
 *
 * Every filter that carries a measure copies the measure's jaql keys onto its item. Kept in one
 * place so the copies cannot drift.
 *
 * @param item - Filter item to write onto.
 * @param measure - Measure whose jaql keys are copied.
 * @internal
 */
function applyMeasureJaqlKeys(item: AnyObject, measure: Measure): void {
  if (!isDimensionalBaseMeasure(measure) && !isDimensionalCalculatedMeasure(measure)) {
    return;
  }

  Object.entries(measure.jaql().jaql).forEach(([key, value]) => {
    item.jaql[key] = value;
  });
}

/**
 * Puts the level a measure filter matches at back onto the item.
 *
 * The measure keys carry its own operand's level, `days` for a max over days, so the level the
 * caller asked for has to be written after them.
 *
 * @param item - Filter item to write onto.
 * @param level - Level the filter matches at, from the level attribute.
 * @param dateTimeLevel - Datetime level the filter matches at, when the granularity uses one.
 * @param bucket - Bucket the filter matches at, when the granularity uses one.
 * @internal
 */
function applyFilterLevel(
  item: AnyObject,
  level?: string,
  dateTimeLevel?: string,
  bucket?: string,
): void {
  // The measure's level, dateTimeLevel and bucket are dropped and the filter's written back: a
  // stored sub-day measure carries a bucket that would group at a granularity nobody asked for
  delete item.jaql.level;
  delete item.jaql.dateTimeLevel;
  delete item.jaql.bucket;

  if (level !== undefined) {
    item.jaql.level = level;
  }

  if (dateTimeLevel !== undefined) {
    item.jaql.dateTimeLevel = dateTimeLevel;
  }

  if (bucket !== undefined) {
    item.jaql.bucket = bucket;
  }
}

/**
 * @internal
 */
export class MeasureFilter extends DoubleOperatorFilter<number | string | Date> {
  /**
   * @internal
   */
  readonly __serializable: string = 'MeasureFilter';

  measure: Measure;

  constructor(
    att: Attribute,
    measure: Measure,
    operatorA?: string,
    valueA?: number | string | Date,
    operatorB?: string,
    valueB?: number | string | Date,
    config?: BaseFilterConfig,
    composeCode?: string,
  ) {
    super(att, FilterTypes.measure, operatorA, valueA, operatorB, valueB, config, composeCode);

    // use this.valueA, not the argument: DoubleOperatorFilter leaves it unset when the operator is missing
    if (this.valueA instanceof Date) {
      this.valueA = toLocalIsoDateTime(this.valueA);
    }

    if (this.valueB instanceof Date) {
      this.valueB = toLocalIsoDateTime(this.valueB);
    }

    this.measure = measure;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    let result = `${this.attribute.id}_${this.measure.id}`;

    if (this.operatorA && this.valueA !== undefined) {
      result += `_${this.operatorA}:${this.valueA}`;
    }

    if (this.operatorB && this.valueB !== undefined) {
      result += `_${this.operatorB}${this.valueB}`;
    }

    return result;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();

    result.measure = this.measure.serialize();

    return result;
  }

  jaql(nested?: boolean | undefined) {
    if (this.config.disabled) {
      return AbstractFilter.disabledJaql(nested);
    }

    const result = super.jaql(nested);

    applyMeasureJaqlKeys(result, this.measure);

    return result;
  }
}

/**
 * @internal
 */
export class RankingFilter extends AbstractFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'RankingFilter';

  count: number;

  operator: string;

  measure: Measure;

  constructor(
    att: Attribute,
    measure: Measure,
    operator: string,
    count: number,
    config?: BaseFilterConfig,
    composeCode?: string,
  ) {
    super(att, FilterTypes.ranking, config, composeCode);

    this.count = count;
    this.operator = operator;
    this.measure = measure;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return `${this.operator}_${this.count}_${this.attribute.id}_by_${this.measure.id}`;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();

    result.count = this.count;
    result.operator = this.operator;
    result.measure = this.measure.serialize();

    return result;
  }

  /**
   * Gets JAQL representing this Filter instance
   */
  filterJaql(): any {
    const result = <any>{};

    result[this.operator] = this.count;
    result.by = this.measure.jaql(true);

    return result;
  }
}

/**
 * @internal
 */
export class MeasureRankingFilter extends AbstractFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'MeasureRankingFilter';

  count: number;

  operator: string;

  measure: BaseMeasure;

  constructor(
    measure: BaseMeasure,
    operator: string,
    count: number,
    config?: BaseFilterConfig,
    composeCode?: string,
  ) {
    super(measure.attribute, FilterTypes.measureRanking, config, composeCode);

    this.count = count;
    this.operator = operator;
    this.measure = measure;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return `${this.operator}_${this.count}_measure_${this.measure.id}`;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    result.measure = this.measure.serialize();
    result.count = this.count;
    result.operator = this.operator;

    return result;
  }

  /**
   * Gets JAQL representing this Filter instance
   */
  filterJaql(): any {
    const result = <any>{};

    result[this.operator] = this.count;

    return result;
  }

  jaql(nested?: boolean | undefined) {
    if (this.config.disabled) {
      return AbstractFilter.disabledJaql(nested);
    }

    const result = super.jaql(nested);

    applyMeasureJaqlKeys(result, this.measure);

    // Add type: 'measure' for measure-based filters
    result.jaql.type = 'measure';

    return result;
  }
}

/**
 * @internal
 */
export class NumericFilter extends DoubleOperatorFilter<number> {
  /**
   * @internal
   */
  readonly __serializable: string = 'NumericFilter';

  constructor(
    att: Attribute,
    operatorA?: string,
    valueA?: number,
    operatorB?: string,
    valueB?: number,
    config?: BaseFilterConfig,
    composeCode?: string,
  ) {
    super(att, FilterTypes.numeric, operatorA, valueA, operatorB, valueB, config, composeCode);
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    return super.serialize();
  }
}

/**
 * @internal
 */
export class TextFilter extends DoubleOperatorFilter<string> {
  /**
   * @internal
   */
  readonly __serializable: string = 'TextFilter';

  constructor(
    att: Attribute,
    operator: string,
    value: string,
    config?: BaseFilterConfig,
    composeCode?: string,
  ) {
    super(att, FilterTypes.text, operator, value, undefined, undefined, config, composeCode);
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    return super.serialize();
  }
}

/**
 * Filter that isolates attribute values that are empty/null (or, when negated, not empty/null).
 *
 * Emits the JAQL the backend expects for emptiness checks:
 * - empty: `{ equals: '', isEmpty: true }`
 * - not empty: `{ doesntEqual: '', isEmpty: true }`
 *
 * @internal
 */
export class EmptyFilter extends AbstractFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'EmptyFilter';

  readonly not: boolean;

  constructor(att: Attribute, not = false, config?: BaseFilterConfig, composeCode?: string) {
    super(att, FilterTypes.empty, config, composeCode);
    this.not = not;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return `${this.attribute.id}_${this.not ? 'isNotEmpty' : 'isEmpty'}`;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    result.not = this.not;
    return result;
  }

  /**
   * Gets JAQL representing this Filter instance
   */
  filterJaql(): any {
    return this.not ? { doesntEqual: '', isEmpty: true } : { equals: '', isEmpty: true };
  }
}

/**
 * Strips clock and offset tail from an ISO-like bound at the first `T`, leaving the calendar prefix.
 *
 * @param bound - Serialized date or datetime string
 * @returns `bound` unchanged when there is no `T` separator
 * @internal
 */
function stripClockTimeFromIsoDateTime(bound: string): string {
  const tIndex = bound.indexOf('T');
  return tIndex === -1 ? bound : bound.slice(0, tIndex);
}

/**
 * Serializes a date as `yyyy-MM-ddTHH:mm:ss` from its local calendar fields.
 *
 * Exported, unlike its neighbour, so the upcoming member and relative-period filters on a date
 * measure emit the same wire format instead of writing a fourth serializer.
 *
 * @param value - Date to serialize
 * @returns Local date and clock time, with no timezone suffix
 * @throws TranslatableError when `value` is an invalid `Date`
 * @internal
 */
export function toLocalIsoDateTime(value: Date): string {
  // an invalid Date would format as `0NaN-NaN-NaN...` and reach the server; `toISOString` throws
  // here, and this serializer stands in for it
  if (Number.isNaN(value.getTime())) {
    throw new TranslatableError('errors.filter.invalidDateValue');
  }

  const pad = (part: number, width = 2) => `${part}`.padStart(width, '0');

  // not `toISOString`: its `Z` tells the server the value is UTC, which shifts the day
  return (
    `${pad(value.getFullYear(), 4)}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}` +
    `T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
  );
}

/**
 * Closed or open-ended range filter on a date {@link LevelAttribute}.
 *
 * @remarks
 * When the level is a **period** granularity (`Years`–`Days`, see `DateLevels.dateOnly`), **each
 * bound that is set** is aligned to a **calendar date**: `Date` values become ISO strings, then the
 * segment from the first `T` onward is removed. Omitted bounds are unchanged. Matches calendar-style
 * behavior in dashboard date filters.
 *
 * @internal
 */
export class DateRangeFilter extends DoubleOperatorFilter<Date | string> {
  /**
   * @internal
   */
  readonly __serializable: string = 'DateRangeFilter';

  constructor(
    levelAttribute: LevelAttribute,
    valueFrom?: Date | string,
    valueTo?: Date | string,
    config?: BaseFilterConfig,
    composeCode?: string,
    // Exclusive bounds (Before / After) pass `fromNotEqual` / `toNotEqual` here instead of the
    // default `from` / `to`, so the JAQL round-trips without shifting the calendar date.
    operatorFrom: string = DateOperators.From,
    operatorTo: string = DateOperators.To,
  ) {
    super(
      levelAttribute,
      FilterTypes.dateRange,
      operatorFrom,
      valueFrom,
      operatorTo,
      valueTo,
      config,
      composeCode,
    );

    if (typeof valueFrom === 'object') {
      this.valueA = valueFrom.toISOString();
    }

    if (typeof valueTo === 'object') {
      this.valueB = valueTo.toISOString();
    }

    if (DateLevels.dateOnly.includes(levelAttribute.granularity)) {
      if (valueFrom !== undefined && typeof this.valueA === 'string') {
        this.valueA = stripClockTimeFromIsoDateTime(this.valueA);
      }
      if (valueTo !== undefined && typeof this.valueB === 'string') {
        this.valueB = stripClockTimeFromIsoDateTime(this.valueB);
      }
    }
  }

  get level(): LevelAttribute {
    return <LevelAttribute>this.attribute;
  }

  get from(): string {
    return this.valueA as string;
  }

  get to(): string {
    return this.valueB as string;
  }

  /**
   * Gets JAQL representing this Filter instance
   *
   * @remarks
   * Exclusive bounds (`fromNotEqual` / `toNotEqual`) publish `isAdvanced: true` and
   * `custom: true` alongside — the backend requires this envelope to persist the clause,
   * same as Fusion's own custom-filter JAQL for the equivalent condition.
   */
  filterJaql(): any {
    const base = super.filterJaql();
    if (
      this.operatorA === DateOperators.FromNotEqual ||
      this.operatorB === DateOperators.ToNotEqual
    ) {
      return { ...base, isAdvanced: true, custom: true };
    }
    return base;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    return super.serialize();
  }
}

/**
 * @internal
 */
export class RelativeDateFilter extends AbstractFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'RelativeDateFilter';

  readonly offset: number;

  readonly count: number;

  readonly operator: typeof DateOperators.Last | typeof DateOperators.Next;

  readonly anchor?: Date | string;

  constructor(
    levelAttribute: LevelAttribute,
    offset: number,
    count: number,
    operator?: typeof DateOperators.Last | typeof DateOperators.Next,
    anchor?: Date | string,
    config?: BaseFilterConfig,
    composeCode?: string,
    filterType: string = FilterTypes.relativeDate,
  ) {
    super(levelAttribute, filterType, config, composeCode);

    if (!operator) {
      operator = DateOperators.Next;
    }

    this.anchor = anchor;
    this.operator = operator;
    this.offset = offset;
    this.count = count;
  }

  get level(): LevelAttribute {
    return <LevelAttribute>this.attribute;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    let result = `${this.level.id}_${this.operator}_${this.offset}_${this.count}`;

    if (this.anchor) {
      if (typeof this.anchor === 'string') {
        result += `_${this.anchor}`;
      } else if (typeof this.anchor === 'object') {
        result += `_${this.anchor.toISOString()}`;
      }
    }

    return result;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    result.offset = this.offset;
    result.count = this.count;
    result.operator = this.operator;

    if (this.anchor) {
      result.anchor = typeof this.anchor === 'string' ? this.anchor : this.anchor.toISOString();
    }

    return result;
  }

  /**
   * Gets JAQL representing this Filter instance
   *
   */
  filterJaql(): any {
    const result = <any>{};

    result[this.operator] = {
      offset: this.offset,
      count: this.count,
    };

    if (this.anchor) {
      if (typeof this.anchor === 'string') {
        result[this.operator].anchor = this.anchor;
      } else if (typeof this.anchor === 'object') {
        result[this.operator].anchor = this.anchor.toISOString();
      }
    }

    return result;
  }
}

/* A member is matched against what the measure answers with, a datetime, so a `Date` goes on the
   wire exactly as a measure filter bound does: local calendar, no `Z`, no day shift. */
function toMeasureMember(member: string | Date): string {
  return member instanceof Date ? toLocalIsoDateTime(member) : member;
}

/* A measure period is anchored on a calendar day, so the anchor is normalised before the base class
   stores it: `toISOString` would both add a time and shift the day into UTC. */
function toMeasureAnchor(anchor?: Date | string): string | undefined {
  if (anchor === undefined) {
    return undefined;
  }

  return anchor instanceof Date ? toLocalIsoDateTime(anchor).slice(0, 10) : anchor;
}

/**
 * Builds the item for `DateMeasureMembersFilter` and `DateMeasureRelativeFilter`: the measure keys
 * plus the filter's own level.
 *
 * @param item - Item the base filter produced.
 * @param measure - Measure this filter carries.
 * @returns The same item, carrying the measure keys and the filter's own level.
 * @internal
 */
function withMeasureOnFilterItem(item: AnyObject, measure: Measure): AnyObject {
  // `jaql(true)` returns the inner object with no `jaql` wrapper. Re-wrap it so the writes below
  // use one path, then hand back what the caller passed.
  const wrapper = item.jaql ? item : { jaql: item };
  const { level, dateTimeLevel, bucket } = wrapper.jaql;

  applyMeasureJaqlKeys(wrapper, measure);
  applyFilterLevel(wrapper, level, dateTimeLevel, bucket);

  return item;
}

/**
 * Refuses a measure that is not a date measure, and a level from a different dimension than the
 * measure's.
 *
 * @param measure - Measure this filter carries.
 * @param levelAttribute - Level the caller asked the filter to match at.
 * @throws TranslatableError `errors.filter.dateMeasure.notADateMeasure` when the measure is not a
 * date measure.
 * @throws TranslatableError `errors.filter.dateMeasure.levelDimensionMismatch` when the level
 * belongs to a different dimension than the measure.
 * @internal
 */
function guardMeasureFilterLevel(measure: Measure, levelAttribute: LevelAttribute): void {
  if (!isDateMeasure(measure)) {
    throw new TranslatableError('errors.filter.dateMeasure.notADateMeasure', {
      measure: measure.name,
      level: levelAttribute.granularity,
    });
  }

  const measureDimension = getDateMeasureAttribute(measure)?.expression;
  const levelDimension = levelAttribute.expression;

  // skipped, not refused, when either side is unresolvable, so a custom dimension cannot start
  // throwing; the measure side is unreachable today because isDateMeasure already resolved it
  if (!measureDimension || !levelDimension || measureDimension === levelDimension) {
    return;
  }

  throw new TranslatableError('errors.filter.dateMeasure.levelDimensionMismatch', {
    measure: measure.name,
    level: levelAttribute.granularity,
    levelDimension,
    measureDimension,
  });
}

/**
 * The shape `measureFilterJaql` needs, satisfied by `DateMeasureMembersFilter` and
 * `DateMeasureRelativeFilter`.
 */
type MeasureBearingFilter = { config: CompleteBaseFilterConfig; measure: Measure };

/**
 * Builds the jaql both measure filters answer with.
 *
 * @param filter - Filter being serialized.
 * @param baseItem - Returns the item the dimension class it extends would produce; a callback
 * because only the subclass can call its own `super`.
 * @param nested - Whether the item is nested inside another filter.
 * @returns The scope item, or the empty one when the filter is disabled.
 * @internal
 */
function measureFilterJaql(
  filter: MeasureBearingFilter,
  baseItem: () => AnyObject,
  nested?: boolean,
): AnyObject {
  return filter.config.disabled
    ? AbstractFilter.disabledJaql(nested)
    : withMeasureOnFilterItem(baseItem(), filter.measure);
}

/**
 * A members filter on the values a measure answers with, rather than on a dimension's own values.
 *
 * @internal
 */
export class DateMeasureMembersFilter extends MembersFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'DateMeasureMembersFilter';

  readonly measure: Measure;

  constructor(
    measure: Measure,
    levelAttribute: LevelAttribute,
    members?: (string | Date)[],
    config?: MembersFilterConfig,
    composeCode?: string,
    skipGuards = false,
  ) {
    super(
      levelAttribute,
      members?.map(toMeasureMember),
      config,
      composeCode,
      FilterTypes.dateMeasureMembers,
    );

    if (!skipGuards) {
      guardMeasureFilterLevel(measure, levelAttribute);
    }

    this.measure = measure;
  }

  /**
   * Level the members are matched at, which is not the measure's own operand level.
   *
   * @returns The level attribute the filter matches at.
   */
  get level(): LevelAttribute {
    return this.attribute as LevelAttribute;
  }

  /**
   * Gets the element's ID.
   *
   * @returns The id, prefixed with the measure so two filters on one level stay distinct.
   */
  get id(): string {
    return `${this.measure.id}_${super.id}`;
  }

  /**
   * Gets a serializable representation of the element.
   *
   * @returns The serialized filter, carrying the measure it holds.
   */
  serialize(): JSONObject {
    return { ...super.serialize(), measure: this.measure.serialize() };
  }

  /**
   * Gets JAQL representing this Filter instance.
   *
   * @param nested - Whether the item is nested inside another filter.
   * @returns The scope item this filter produces.
   */
  jaql(nested?: boolean | undefined) {
    return measureFilterJaql(this, () => super.jaql(nested), nested);
  }
}

/**
 * A relative period filter on the values a measure answers with, rather than on a dimension's own
 * values.
 *
 * @internal
 */
export class DateMeasureRelativeFilter extends RelativeDateFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'DateMeasureRelativeFilter';

  readonly measure: Measure;

  constructor(
    measure: Measure,
    levelAttribute: LevelAttribute,
    offset: number,
    count: number,
    operator?: typeof DateOperators.Last | typeof DateOperators.Next,
    anchor?: Date | string,
    config?: BaseFilterConfig,
    composeCode?: string,
    skipGuards = false,
  ) {
    super(
      levelAttribute,
      offset,
      count,
      operator,
      toMeasureAnchor(anchor),
      config,
      composeCode,
      FilterTypes.dateMeasureRelative,
    );

    if (!skipGuards) {
      guardMeasureFilterLevel(measure, levelAttribute);
    }

    this.measure = measure;
  }

  /**
   * Gets the element's ID.
   *
   * @returns The id, prefixed with the measure so two filters on one level stay distinct.
   */
  get id(): string {
    return `${this.measure.id}_${super.id}`;
  }

  /**
   * Gets a serializable representation of the element.
   *
   * @returns The serialized filter, carrying the measure it holds.
   */
  serialize(): JSONObject {
    return { ...super.serialize(), measure: this.measure.serialize() };
  }

  /**
   * Gets JAQL representing this Filter instance.
   *
   * @param nested - Whether the item is nested inside another filter.
   * @returns The scope item this filter produces.
   */
  jaql(nested?: boolean | undefined) {
    return measureFilterJaql(this, () => super.jaql(nested), nested);
  }
}

/**
 * @internal
 */
export class CustomFilter extends AbstractFilter {
  /**
   * @internal
   */
  readonly __serializable: string = 'CustomFilter';

  readonly jaqlExpression: any;

  constructor(att: Attribute, jaql: any, config?: BaseFilterConfig, composeCode?: string) {
    super(att, FilterTypes.advanced, config, composeCode);
    // remove filterType from jaql as it is not needed
    delete jaql.filterType;
    this.jaqlExpression = jaql;
  }

  /**
   * Gets the element's ID.
   *
   * @returns The id of this filter.
   */
  get id(): string {
    return `custom_${this.attribute.id}_${this.config.guid}`;
  }

  /**
   * Gets JAQL representing this Filter instance
   *
   */
  filterJaql(): any {
    return this.jaqlExpression;
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    result.jaqlExpression = this.jaqlExpression;

    return result;
  }
}

/**
 * Checks if a filter is a CustomFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */
export function isCustomFilter(filter: Filter & AnyObject): filter is CustomFilter {
  return filter && filter.__serializable === 'CustomFilter';
}

/**
 * Checks if a filter is a MembersFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */
export function isMembersFilter(filter: Filter & AnyObject): filter is MembersFilter {
  return filter && filter.__serializable === 'MembersFilter';
}

/**
 * Checks if a filter is a NumericFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */
export function isNumericFilter(filter: Filter & AnyObject): filter is NumericFilter {
  return filter && filter.__serializable === 'NumericFilter';
}

/**
 * Checks if a filter is a DateMeasureMembersFilter.
 *
 * @param filter - The filter to check.
 * @returns Whether the filter is a DateMeasureMembersFilter.
 * @internal
 */
export function isDateMeasureMembersFilter(
  filter: Filter & AnyObject,
): filter is DateMeasureMembersFilter {
  return filter && filter.__serializable === 'DateMeasureMembersFilter';
}

/**
 * Checks if a filter is a DateMeasureRelativeFilter.
 *
 * @param filter - The filter to check.
 * @returns Whether the filter is a DateMeasureRelativeFilter.
 * @internal
 */
export function isDateMeasureRelativeFilter(
  filter: Filter & AnyObject,
): filter is DateMeasureRelativeFilter {
  return filter && filter.__serializable === 'DateMeasureRelativeFilter';
}

/**
 * Checks if a filter is a TextFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */
export function isRankingFilter(filter: Filter & AnyObject): filter is RankingFilter {
  return filter && filter.__serializable === 'RankingFilter';
}

/**
 * Checks if a filter is a MeasureRankingFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */
export function isMeasureRankingFilter(filter: Filter & AnyObject): filter is MeasureRankingFilter {
  return filter && filter.__serializable === 'MeasureRankingFilter';
}

/**
 * Checks if a filter is a MeasureFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */
export function isMeasureFilter(filter: Filter & AnyObject): filter is MeasureFilter {
  return filter && filter.__serializable === 'MeasureFilter';
}

/**
 * Checks if a filter is a ExcludeFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */

export function isExcludeFilter(filter: Filter & AnyObject): filter is ExcludeFilter {
  return filter && filter.__serializable === 'ExcludeFilter';
}

/**
 * Checks if a filter is a LogicalAttributeFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */

export function isLogicalAttributeFilter(
  filter: Filter & AnyObject,
): filter is LogicalAttributeFilter {
  return filter && filter.__serializable === 'LogicalAttributeFilter';
}

/**
 * Checks if a filter is a CascadingFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */

export function isCascadingFilter(filter: Filter & AnyObject): filter is CascadingFilter {
  return filter && filter.__serializable === 'CascadingFilter';
}

/**
 * Checks if a filter is a RelativeDateFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */

export function isRelativeDateFilter(filter: Filter & AnyObject): filter is RelativeDateFilter {
  return filter && filter.__serializable === 'RelativeDateFilter';
}

/**
 * Checks if a filter is a TextFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */

export function isTextFilter(filter: Filter & AnyObject): filter is TextFilter {
  return filter && filter.__serializable === 'TextFilter';
}

/**
 * Checks if a filter is a DateRangeFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */
export function isDateRangeFilter(filter: Filter & AnyObject): filter is DateRangeFilter {
  return filter && filter.__serializable === 'DateRangeFilter';
}

/* A saved config keeps its backgroundFilter as plain JSON, and `jaql()` calls `filterJaql()` on it,
   so it has to be a Filter again before the rebuilt filter is ever used. `createFilter` reads no
   config for a members filter, so the saved one is laid back on, or an exclude would turn include.
   That saved config is JSON too, so a background filter of its own is rebuilt the same way. */
function withRebuiltBackgroundFilter(config: AnyObject | undefined): AnyObject | undefined {
  if (!config?.backgroundFilter) {
    return config;
  }

  const saved = config.backgroundFilter;
  const backgroundFilter = createFilter(saved);
  if (saved.config) {
    backgroundFilter.config = {
      ...backgroundFilter.config,
      ...withRebuiltBackgroundFilter(saved.config),
    };
  }

  return { ...config, backgroundFilter };
}

/**
 * @param json - Filter JSON representation
 * @internal
 */
export function createFilter(json: any): Filter {
  switch (json.filterType) {
    case FilterTypes.logicalAttribute:
      return new LogicalAttributeFilter(
        json.filters.map((f: any) => createFilter(f)),
        json.operator,
      );

    case FilterTypes.members:
      return new MembersFilter(create(json.attribute) as Attribute, json.members);

    case FilterTypes.exclude:
      return new ExcludeFilter(createFilter(json.filter), json.input && createFilter(json.input));

    case FilterTypes.measure:
      return new MeasureFilter(
        create(json.attribute) as Attribute,
        create(json.measure) as Measure,
        json.operatorA,
        json.valueA,
        json.operatorB,
        json.valueB,
      );

    case FilterTypes.ranking:
      return new RankingFilter(
        create(json.attribute) as Attribute,
        create(json.measure) as Measure,
        json.operator,
        json.count,
      );

    case FilterTypes.measureRanking:
      return new MeasureRankingFilter(
        create(json.measure) as BaseMeasure,
        json.operator,
        json.count,
      );

    case FilterTypes.numeric:
      return new NumericFilter(
        create(json.attribute) as Attribute,
        json.operatorA,
        json.valueA,
        json.operatorB,
        json.valueB,
      );

    case FilterTypes.text:
      return new TextFilter(create(json.attribute) as Attribute, json.operatorA, json.valueA);

    case FilterTypes.empty:
      return new EmptyFilter(create(json.attribute) as Attribute, json.not);

    case FilterTypes.relativeDate:
      return new RelativeDateFilter(
        create(json.attribute) as LevelAttribute,
        json.offset,
        json.count,
        json.operator,
        json.anchor,
      );

    case FilterTypes.dateMeasureMembers:
      return new DateMeasureMembersFilter(
        create(json.measure) as Measure,
        create(json.attribute) as LevelAttribute,
        json.members,
        withRebuiltBackgroundFilter(json.config),
        undefined,
        true,
      );

    case FilterTypes.dateMeasureRelative:
      return new DateMeasureRelativeFilter(
        create(json.measure) as Measure,
        create(json.attribute) as LevelAttribute,
        json.offset,
        json.count,
        json.operator,
        json.anchor,
        json.config,
        undefined,
        true,
      );

    case FilterTypes.dateRange:
      return new DateRangeFilter(
        create(json.attribute) as LevelAttribute,
        json.valueA,
        json.valueB,
      );
  }

  throw new TranslatableError('errors.filter.unsupportedType', {
    filterType: json.filterType,
  });
}
