/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import hash from 'object-hash';
import { LevelAttribute, Attribute, Measure, Filter } from '../interfaces.js';

import { DimensionalElement } from '../base.js';

import { DateLevels, MetadataTypes } from '../types.js';

import { create } from '../factory.js';
import { DimensionalBaseMeasure } from '../measures/measures.js';
import { TranslatableError } from '../../translation/translatable-error.js';
import { guidFast } from '../../utils.js';

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
};

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
};

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
};

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
};

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
  date: 'date',
  relativeDate: 'relativeDate',
  cascading: 'cascading',
  advanced: 'advanced',
};

// CLASSES

/**
 * base implementation for filter classes
 *
 * @internal
 */
abstract class AbstractFilter extends DimensionalElement implements Filter {
  /**
   * Attribute this filter instance is filtering
   */
  readonly attribute: Attribute;

  /**
   * Filter type
   */
  readonly filterType: string;

  /**
   * Global filter identifier
   */
  readonly guid: string;

  private _disabled: boolean;

  private _locked: boolean;

  /**
   * Boolean flag whether the filter is disabled
   *
   * @internal
   */
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
  }

  /**
   * Boolean flag whether the filter is locked
   *
   * @internal
   */
  get locked(): boolean {
    return this._locked;
  }

  set locked(value: boolean) {
    this._locked = value;
  }

  constructor(att: Attribute, filterType: string, guid?: string) {
    super('filter', MetadataTypes.Filter);
    this.filterType = filterType;

    AbstractFilter.checkAttributeSupport(att);
    this.attribute = att;

    this.guid = guid || guidFast(13);
    this.disabled = false;
    this.locked = false;
  }

  get name(): string {
    return hash(this.jaql());
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
  serializable(): any {
    const result = super.serializable();

    result.filterType = this.filterType;
    result.attribute = this.attribute.serializable();

    return result;
  }

  /**
   * Gets the JAQL representation of this instance
   *
   * @param nested - defines whether the JAQL is nested within parent JAQL statement or a root JAQL element
   */
  jaql(nested?: boolean): any {
    if (this.disabled) {
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
  readonly filters: Filter[];

  readonly operator: string;

  constructor(filters: Filter[], operator: string, guid?: string) {
    super(filters[0].attribute, FilterTypes.logicalAttribute, guid);

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
  serializable(): any {
    const result = super.serializable();

    result.operator = this.operator;
    result.filters = this.filters.map((f) => f.serializable());

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
  readonly members: any[];

  /** @internal */
  excludeMembers: boolean;

  /** @internal */
  deactivatedMembers: any[];

  /** @internal */
  backgroundFilter?: Filter;

  constructor(
    attribute: Attribute,
    members?: any[],
    excludeMembers?: boolean,
    guid?: string,
    deactivatedMembers?: any[],
    backgroundFilter?: Filter,
  ) {
    super(attribute, FilterTypes.members, guid);

    this.members = members ?? [];
    this.excludeMembers = excludeMembers ?? false;
    this.deactivatedMembers = deactivatedMembers ?? [];
    this.backgroundFilter = backgroundFilter;

    if (this.members.filter((m) => m === null || m === undefined).length > 0) {
      throw new TranslatableError('errors.filter.membersFilterNullMember', {
        attributeId: attribute.id,
      });
    }
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return `${this.attribute.id}_${this.members.map((m) => m.toString()).join()}`;
  }

  /**
   * Gets a serializable representation of the element
   */
  serializable(): any {
    const result = super.serializable();

    result.members = this.members;
    if (this.backgroundFilter) {
      result.backgroundFilter = this.backgroundFilter.serializable();
    }

    return result;
  }

  /**
   * Gets JAQL representing this Filter instance
   */
  filterJaql(): any {
    const membersFilterJaql = {
      members: this.members.map((m) => m.toString()),
    };

    // if there's no members to exclude, do not add the exclude property
    const filterJaql =
      this.excludeMembers && this.members.length
        ? { exclude: membersFilterJaql }
        : membersFilterJaql;

    if (this.backgroundFilter) {
      return {
        and: [filterJaql, this.backgroundFilter.filterJaql()],
      };
    }

    return filterJaql;
  }
}

/**
 * @internal
 */
export class CascadingFilter extends AbstractFilter {
  // level filters
  readonly filters: Filter[];

  constructor(filters: Filter[], guid?: string) {
    super(filters[0].attribute, FilterTypes.cascading, guid);
    this.filters = filters;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return `${this.filterType}_${this.filters.map((f) => f.id).join()}`;
  }

  get disabled(): boolean {
    return super.disabled;
  }

  set disabled(value: boolean) {
    super.disabled = value;
    if (this.filters) {
      this.filters.forEach((filter) => {
        filter.disabled = value;
      });
    }
  }

  get locked(): boolean {
    return super.locked;
  }

  set locked(value: boolean) {
    super.locked = value;
    if (this.filters) {
      this.filters.forEach((filter) => {
        filter.locked = value;
      });
    }
  }

  /**
   * Gets a serializable representation of the element
   */
  serializable(): any {
    const result = super.serializable();
    result.filters = this.filters.map((f) => f.serializable());
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
    if (this.disabled) {
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
  readonly filter: Filter;

  readonly input?: Filter;

  constructor(filter: Filter, input?: Filter, guid?: string) {
    super(filter.attribute, FilterTypes.exclude, guid);

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
  serializable(): any {
    const result = super.serializable();

    result.filter = this.filter.serializable();

    if (this.input) {
      result.input = this.input.serializable();
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
    guid?: string,
  ) {
    super(att, filterType, guid);

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
  serializable(): any {
    const result = super.serializable();

    if (this.operatorA) {
      result.operatorA = this.operatorA;
    }

    if (this.operatorB) {
      result.operatorB = this.operatorB;
    }

    if (this.valueA !== undefined) {
      result.valueA = this.valueA;
    }

    if (this.valueB !== undefined) {
      result.valueB = this.valueB;
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
  measure: Measure;

  constructor(
    att: Attribute,
    measure: Measure,
    operatorA?: string,
    valueA?: number,
    operatorB?: string,
    valueB?: number,
    guid?: string,
  ) {
    super(att, FilterTypes.measure, operatorA, valueA, operatorB, valueB, guid);

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
  serializable(): any {
    const result = super.serializable();

    result.measure = this.measure.serializable();

    return result;
  }

  jaql(nested?: boolean | undefined) {
    if (this.disabled) {
      return AbstractFilter.disabledJaql(nested);
    }

    const result = super.jaql(nested);

    if (this.measure instanceof DimensionalBaseMeasure) {
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
  count: number;

  operator: string;

  measure: Measure;

  constructor(att: Attribute, measure: Measure, operator: string, count: number, guid?: string) {
    super(att, FilterTypes.ranking, guid);

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
  serializable(): any {
    const result = super.serializable();

    result.count = this.count;
    result.operator = this.operator;
    result.measure = this.measure.serializable();

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
  constructor(
    att: Attribute,
    operatorA?: string,
    valueA?: number,
    operatorB?: string,
    valueB?: number,
    guid?: string,
  ) {
    super(att, FilterTypes.numeric, operatorA, valueA, operatorB, valueB, guid);
  }
}

/**
 * @internal
 */
export class TextFilter extends DoubleOperatorFilter<string> {
  constructor(att: Attribute, operator: string, value: string, guid?: string) {
    super(att, FilterTypes.text, operator, value, undefined, undefined, guid);
  }
}

/**
 * @internal
 */
export class DateRangeFilter extends DoubleOperatorFilter<Date | string> {
  constructor(
    l: LevelAttribute,
    valueFrom?: Date | string,
    valueTo?: Date | string,
    guid?: string,
  ) {
    super(l, FilterTypes.date, DateOperators.From, valueFrom, DateOperators.To, valueTo, guid);

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
}

/**
 * @internal
 */
export class RelativeDateFilter extends AbstractFilter {
  readonly offset: number;

  readonly count: number;

  readonly operator: string;

  readonly anchor?: Date | string;

  constructor(
    l: LevelAttribute,
    offset: number,
    count: number,
    operator?: string,
    anchor?: Date | string,
    guid?: string,
  ) {
    super(l, FilterTypes.relativeDate, guid);

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
  serializable(): any {
    const result = super.serializable();

    result.offset = this.offset;
    result.count = this.count;
    result.operator = this.operator;

    if (this.anchor) {
      result.anchor = this.anchor;
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
  readonly jaqlExpression: any;

  constructor(att: Attribute, jaql: any, guid?: string) {
    super(att, FilterTypes.advanced, guid);
    // remove filterType from jaql as it is not needed
    delete jaql.filterType;
    this.jaqlExpression = jaql;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return `custom_${this.attribute.id}_${this.guid}`;
  }

  /**
   * Gets JAQL representing this Filter instance
   *
   */
  filterJaql(): any {
    return this.jaqlExpression;
  }
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

    case FilterTypes.date:
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
