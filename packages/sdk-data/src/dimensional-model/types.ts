/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/*
 * Types
 */

import { type ConditionFilterJaql } from './filters/utils/types.js';

/**
 * Different aggregation types
 */
export const AggregationTypes = {
  /** Sum aggregation type */
  Sum: 'sum',

  /** Average aggregation type */
  Average: 'avg',

  /** Min aggregation type */
  Min: 'min',

  /** Max aggregation type */
  Max: 'max',

  /** Count aggregation type */
  Count: 'count',

  /** Count distinct aggregation type */
  CountDistinct: 'countDistinct',

  /** Median aggregation type */
  Median: 'median',

  /** Variance aggregation type */
  Variance: 'var',

  /** Standard deviation aggregation type */
  StandardDeviation: 'stdev',
};

/**
 * Different sort types.
 */
export enum Sort {
  /** No sort definition  */
  None,

  /** Sort Ascending */
  Ascending,

  /** Sort Descending */
  Descending,
}

/**
 * Different metadata types
 *
 * @internal
 */
export const MetadataTypes = {
  Measure: 'measure',
  MeasureTemplate: 'measuretemplate',
  BaseMeasure: 'basemeasure',
  CalculatedMeasure: 'calculatedmeasure',

  Dimension: 'dimension',
  DateDimension: 'datedimension',
  TextDimension: 'textdimension',
  NumericDimension: 'numericdimension',

  DateLevel: 'datelevel',
  Attribute: 'attribute',
  TextAttribute: 'text-attribute',
  NumericAttribute: 'numeric-attribute',

  Filter: 'filter',
  DimensionFilter: 'dimensionfilter',
  MeasureFilter: 'measurefilter',

  /**
   * Checks whether the given object or type is a metadata element
   *
   * @param o - object to check
   * @returns true if the object or type is a metadata element
   */
  isMetadata(o: any) {
    return (
      MetadataTypes.isMeasure(o) ||
      MetadataTypes.isDimension(o) ||
      MetadataTypes.isAttribute(o) ||
      MetadataTypes.isFilter(o)
    );
  },

  /**
   * Checks whether the given object or type is a measure template
   *
   * @param o - object to check
   * @returns true if the object or type is a measure template
   */
  isMeasureTemplate(o: any): boolean {
    if (!o) {
      return false;
    }

    if (typeof o === 'string') {
      const type = o;
      return type.toLowerCase() === MetadataTypes.MeasureTemplate;
    }

    return (
      o.agg === '*' ||
      o.aggregation === '*' ||
      (o.type && (<string>o.type).toLowerCase() === MetadataTypes.MeasureTemplate)
    );
  },

  /**
   * Checks whether the given object or type is a base measure
   *
   * @param o - object to check
   * @returns true if the object or type is a base measure
   */
  isBaseMeasure(o: any): boolean {
    if (!o) {
      return false;
    }

    if (typeof o === 'string') {
      const type = o;
      return type.toLowerCase() === MetadataTypes.BaseMeasure;
    }

    return (o.agg || o.aggregation) && o.attribute && !this.isMeasureTemplate(o);
  },

  /**
   * Checks whether the given object or type is a measure - of any type
   *
   * @param o - object to check
   * @returns true if the object or type is a measure - of any type
   */
  isMeasure(o: any): boolean {
    if (!o) {
      return false;
    }

    if (typeof o === 'string') {
      const type = o;
      return (
        type.toLowerCase() === MetadataTypes.Measure ||
        type.toLowerCase() === MetadataTypes.BaseMeasure ||
        type.toLowerCase() === MetadataTypes.MeasureTemplate ||
        type.toLowerCase() === MetadataTypes.CalculatedMeasure
      );
    }

    return this.isBaseMeasure(o) || this.isCalculatedMeasure(o) || this.isMeasureTemplate(o);
  },

  /**
   * Checks whether the given object or type is a calculated measure
   *
   * @param o - object to check
   * @returns true if the object or type is a calculated measure
   */
  isCalculatedMeasure(o: any): boolean {
    if (!o) {
      return false;
    }

    if (typeof o === 'string') {
      const type = o;
      return type.toLowerCase() === MetadataTypes.CalculatedMeasure;
    }

    return (o.expression || o.formula) && o.context;
  },

  /**
   * Checks whether the given object or type is a date dimension
   *
   * @param o - object to check
   * @returns true if the object or type is a date dimension
   */
  isDateDimension(o: any): boolean {
    if (!o) {
      return false;
    }

    if (typeof o === 'string') {
      const type = o;
      return type.toLowerCase() === MetadataTypes.DateDimension;
    }

    return (o.dim || o.expression) && o.level;
  },

  /**
   * Checks whether the given object or type is a text dimension
   *
   * @param o - object to check
   * @returns true if the object or type is a text dimension
   */
  isTextDimension(o: any): boolean {
    if (!o) {
      return false;
    }

    if (typeof o === 'string') {
      const type = o;
      return type.toLowerCase() === MetadataTypes.TextDimension;
    }

    return false;
  },

  /**
   * Checks whether the given object or type is a numeric dimension
   *
   * @param o - object to check
   * @returns true if the object or type is a numeric dimension
   */
  isNumericDimension(o: any): boolean {
    if (!o) {
      return false;
    }

    if (typeof o === 'string') {
      const type = o;
      return type.toLowerCase() === MetadataTypes.NumericDimension;
    }

    return false;
  },

  /**
   * Checks whether the given object or type is a dimension - of any type
   *
   * @param o - object to check
   * @returns true if the object or type is a dimension - of any type
   */
  isDimension(o: any): boolean {
    if (typeof o === 'object') {
      o = o.type;
    }

    if (typeof o === 'string') {
      const type = o;
      return (
        type.toLowerCase() === MetadataTypes.DateDimension ||
        type.toLowerCase() === MetadataTypes.Dimension ||
        type.toLowerCase() === MetadataTypes.TextDimension ||
        type.toLowerCase() === MetadataTypes.NumericDimension
      );
    }
    return false;
  },

  /**
   * Checks whether the given object or type is an attribute - of any type
   *
   * @param o - object to check
   * @returns true if the object or type is an attribute - of any type
   */
  isAttribute(o: any): boolean {
    if (typeof o === 'string') {
      const type = o;
      return (
        type.toLowerCase() === MetadataTypes.Attribute ||
        type.toLowerCase() === MetadataTypes.TextAttribute ||
        type.toLowerCase() === MetadataTypes.NumericAttribute ||
        type.toLowerCase() === MetadataTypes.DateLevel
      );
    }

    if (o && o.type) {
      return this.isAttribute(o.type);
    }

    return false;
  },

  /**
   * Checks whether the given object or type is a filter
   *
   * @param o - object to check
   * @returns true if the object or type is a filter
   */
  isFilter(o: any): boolean {
    if (typeof o === 'object') {
      o = o.type;
    }

    if (typeof o === 'string') {
      const type = o;
      return (
        type.toLowerCase() === MetadataTypes.Filter ||
        type.toLowerCase() === MetadataTypes.DimensionFilter ||
        type.toLowerCase() === MetadataTypes.MeasureFilter
      );
    }

    return false;
  },
};
/**
 * Levels for {@link DateDimension}
 */
export const DateLevels = {
  Years: 'Years',
  Quarters: 'Quarters',
  Months: 'Months',
  Weeks: 'Weeks',
  Days: 'Days',
  Hours: 'Hours',
  MinutesRoundTo30: 'MinutesRoundTo30',
  MinutesRoundTo15: 'MinutesRoundTo15',
  Minutes: 'Minutes',
  Seconds: 'Seconds',

  AggHours: 'AggHours',
  AggMinutesRoundTo30: 'AggMinutesRoundTo30',
  AggMinutesRoundTo15: 'AggMinutesRoundTo15',
  AggMinutesRoundTo1: 'AggMinutesRoundTo1',

  /** @internal */
  get all(): string[] {
    return [
      DateLevels.Years,
      DateLevels.Quarters,
      DateLevels.Months,
      DateLevels.Weeks,
      DateLevels.Days,
      DateLevels.Hours,
      DateLevels.MinutesRoundTo30,
      DateLevels.MinutesRoundTo15,
      DateLevels.Minutes,
      DateLevels.Seconds,
      DateLevels.AggHours,
      DateLevels.AggMinutesRoundTo30,
      DateLevels.AggMinutesRoundTo15,
      DateLevels.AggMinutesRoundTo1,
    ];
  },
};

/** @internal */
export enum DataType {
  TEXT = 'text',
  NUMERIC = 'numeric',
  DATETIME = 'datetime',
}

/** @internal */
export enum JaqlSortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

/** @internal */
export type Jaql = BaseJaql | FormulaJaql | FilterJaql | PivotJaql;

/** @internal */
export type PivotJaql = (BaseJaql | FormulaJaql) & {
  sortDetails?: {
    dir: JaqlSortDirection;
    field: number;
    measurePath?: Record<string, string> | null;
  };
  subtotalAgg?: 'sum' | 'min' | 'max' | 'avg' | 'median';
};

/** @internal */
export type BaseJaql = {
  agg?: string;
  datatype: `${DataType}`;
  dim: string;
  table: string;
  column: string;
  title: string;
  level?: 'years' | 'quarters' | 'months' | 'weeks' | 'minutes' | 'days';
  sort?: `${JaqlSortDirection}`;
  in?: {
    selected?: {
      jaql: FilterJaql;
    };
  };
};

/** @internal */
export type FormulaID = string;

/** @internal */
export type FormulaContext = BaseJaql | FormulaJaql | FilterJaql;

/** @internal */
export type FormulaJaql = {
  type?: 'measure';
  sort?: JaqlSortDirection;
  title: string;
  formula: string;
  context?: Record<FormulaID, FormulaContext>;
};

/** @internal */
export type BaseFilter =
  | IncludeAllFilter
  | IncludeMembersFilter
  | ExcludeMembersFilter
  | JaqlNumericFilter
  | ConditionFilterJaql
  | AndFilter<JaqlNumericFilter | ConditionFilterJaql>
  | OrFilter<JaqlNumericFilter | ConditionFilterJaql>;

/** @internal */
export type BackgroundFilter = BaseFilter & {
  level?: 'string';
};

/** @internal */
export type IncludeAllFilter = {
  all: true;
};

/** @internal */
export type IncludeMembersFilter = {
  members: string[];
};

/** @internal */
export type ExcludeMembersFilter = {
  exclude: {
    members: string[];
  };
};

/** @internal */
export type TurnOffMembersFilter = ExcludeMembersFilter & {
  turnedOff: boolean;
};

/** @internal */
export type FilterJaql = BaseJaql & {
  filter: BaseFilter & {
    filter?: BackgroundFilter | TurnOffMembersFilter;
  };
};

type NumericFilterValue = number | FormulaJaql;

/** @internal */
export type JaqlNumericFilter = {
  equals?: NumericFilterValue;
  doesntEqual?: NumericFilterValue;
  toNotEqual?: NumericFilterValue;
  to?: NumericFilterValue;
  fromNotEqual?: NumericFilterValue;
  from?: NumericFilterValue;
  '='?: NumericFilterValue;
  '<'?: NumericFilterValue;
  '>'?: NumericFilterValue;
  '>='?: NumericFilterValue;
  '<='?: NumericFilterValue;
};

type AndFilter<FilterItem> = {
  and: FilterItem[];
};

/** @internal */
export type OrFilter<FilterItem> = {
  or: FilterItem[];
};
