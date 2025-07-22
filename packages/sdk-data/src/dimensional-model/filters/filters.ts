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
  CompleteBaseFilterConfig,
  CompleteMembersFilterConfig,
  Filter,
  LevelAttribute,
  Measure,
  MembersFilterConfig,
} from '../interfaces.js';
import { isDimensionalBaseMeasure } from '../measures/measures.js';
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
  To: 'to',
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
  text: 'text',
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
  ) {
    super(attribute, FilterTypes.members, undefined, composeCode);
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
 * @internal
 */
export class MeasureFilter extends DoubleOperatorFilter<number> {
  /**
   * @internal
   */
  readonly __serializable: string = 'MeasureFilter';

  measure: Measure;

  constructor(
    att: Attribute,
    measure: Measure,
    operatorA?: string,
    valueA?: number,
    operatorB?: string,
    valueB?: number,
    config?: BaseFilterConfig,
    composeCode?: string,
  ) {
    super(att, FilterTypes.measure, operatorA, valueA, operatorB, valueB, config, composeCode);

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

    if (isDimensionalBaseMeasure(this.measure)) {
      Object.entries(this.measure.jaql().jaql).forEach(([key, value]) => {
        result.jaql[key] = value;
      });
    }

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
  ) {
    super(
      levelAttribute,
      FilterTypes.dateRange,
      DateOperators.From,
      valueFrom,
      DateOperators.To,
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
   */
  filterJaql(): any {
    return super.filterJaql();
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
  ) {
    super(levelAttribute, FilterTypes.relativeDate, config, composeCode);

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
   * gets the element's ID
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
 * Checks if a filter is a TextFilter.
 *
 * @param filter - The filter to check.
 * @internal
 */
export function isRankingFilter(filter: Filter & AnyObject): filter is RankingFilter {
  return filter && filter.__serializable === 'RankingFilter';
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
      break;

    case FilterTypes.members:
      return new MembersFilter(create(json.attribute) as Attribute, json.members);
      break;

    case FilterTypes.exclude:
      return new ExcludeFilter(createFilter(json.filter), json.input && createFilter(json.input));
      break;

    case FilterTypes.measure:
      return new MeasureFilter(
        create(json.attribute) as Attribute,
        create(json.measure) as Measure,
        json.operatorA,
        json.valueA,
        json.operatorB,
        json.valueB,
      );
      break;

    case FilterTypes.ranking:
      return new RankingFilter(
        create(json.attribute) as Attribute,
        create(json.measure) as Measure,
        json.operator,
        json.count,
      );
      break;

    case FilterTypes.numeric:
      return new NumericFilter(
        create(json.attribute) as Attribute,
        json.operatorA,
        json.valueA,
        json.operatorB,
        json.valueB,
      );
      break;

    case FilterTypes.text:
      return new TextFilter(create(json.attribute) as Attribute, json.operatorA, json.valueA);
      break;

    case FilterTypes.relativeDate:
      return new RelativeDateFilter(
        create(json.attribute) as LevelAttribute,
        json.offset,
        json.count,
        json.operator,
        json.anchor,
      );
      break;

    case FilterTypes.dateRange:
      return new DateRangeFilter(
        create(json.attribute) as LevelAttribute,
        json.valueA,
        json.valueB,
      );
      break;
  }

  throw new TranslatableError('errors.filter.unsupportedType', {
    filterType: json.filterType,
  });
}
