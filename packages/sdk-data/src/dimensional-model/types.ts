/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/*
 * Types
 */
import type {
  ConditionFilterJaql,
  JaqlDataSource,
  JaqlDataSourceForDto,
} from './filters/utils/types.js';
import { Attribute } from './interfaces.js';

/**
 * @internal
 */
export type { JaqlDataSource, JaqlDataSourceForDto };

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
    // JaqlElement doesn't have property attribute. Check for jaql, dim, or expression instead
    return (
      (o.agg || o.aggregation) &&
      (o.attribute || o.jaql || o.dim || o.expression) &&
      !this.isMeasureTemplate(o)
    );
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
    if (o && typeof o === 'object') {
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
  isAttribute(o: any): o is Attribute {
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
    if (o && typeof o === 'object') {
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

  /** @internal */
  get dateOnly(): string[] {
    return [
      DateLevels.Years,
      DateLevels.Quarters,
      DateLevels.Months,
      DateLevels.Weeks,
      DateLevels.Days,
    ];
  },

  /** @internal */
  get timeOnly(): string[] {
    return [
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
} as const;

/** @internal */
export type DateLevel = Exclude<
  (typeof DateLevels)[keyof typeof DateLevels],
  typeof DateLevels.all
>;

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
  datasource?: JaqlDataSource;
  title: string;
  level?: 'years' | 'quarters' | 'months' | 'weeks' | 'minutes' | 'days';
  sort?: `${JaqlSortDirection}`;
  in?: {
    selected?: {
      jaql: FilterJaql;
    };
  };
  merged?: boolean;
  panel?: 'rows' | 'columns';
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
  datasource?: JaqlDataSource;
};

/** @internal */
export type BaseFilterJaql =
  | IncludeAllFilterJaql
  | IncludeMembersFilterJaql
  | ExcludeMembersFilterJaql
  | NumericFilterJaql
  | ConditionFilterJaql
  | AndFilterJaql<NumericFilterJaql | ConditionFilterJaql>
  | OrFilterJaql<NumericFilterJaql | ConditionFilterJaql>;

/** @internal */
export type BackgroundFilterJaql = BaseFilterJaql & {
  level?: 'string';
};

/** @internal */
export type IncludeAllFilterJaql = {
  all: true;
};

/** @internal */
export type IncludeMembersFilterJaql = {
  members: string[];
  multiSelection?: boolean;
};

/** @internal */
export type ExcludeMembersFilterJaql = {
  exclude: {
    members: string[];
  };
  multiSelection?: boolean;
};

/** @internal */
export type TurnOffMembersFilterJaql = ExcludeMembersFilterJaql & {
  turnedOff: boolean;
};

/** @internal */
export type FilterJaql = BaseJaql & {
  filter: BaseFilterJaql & {
    filter?: BackgroundFilterJaql | TurnOffMembersFilterJaql;
  };
};

type NumericFilterValue = number | FormulaJaql;

/** @internal */
export type NumericFilterJaql = {
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

type AndFilterJaql<FilterItem> = {
  and: FilterItem[];
};

/** @internal */
export type OrFilterJaql<FilterItem> = {
  or: FilterItem[];
};

/**
 * Abstract object with any unknown values
 */
export type AnyObject = Record<string, any>;

/**
 * JSON Value
 *
 * @internal
 */
export type JSONValue = string | number | boolean | undefined | null | JSONArray | JSONObject;

/**
 * JSON Array
 *
 * @internal
 */
export interface JSONArray extends Array<JSONValue> {}

/**
 * JSON Object
 *
 * @internal
 */
export interface JSONObject {
  [key: string]: JSONValue;
}

/**
 * @internal
 */
interface DecimalAbbreviations {
  k: boolean;
  m: boolean;
  b: boolean;
  t: boolean;
}
/**
 * @internal
 */
export enum CurrencyPosition {
  PRE = 'pre',
  POST = 'post',
}

/**
 * @internal
 */
export type NumericMask = {
  isdefault?: boolean;
  abbreviations?: DecimalAbbreviations;
  decimals?: 'auto' | number | string;
  currency?: { symbol: string; position: CurrencyPosition };
  percent?: boolean;
  number?: { separated: boolean };
  separated?: boolean;
  type?: string;
};

/**
 * @internal
 */
export type DatetimeMask = {
  isdefault?: boolean;
  years: string;
  quarters: string;
  months: string;
  weeks: string;
  minutes: string;
  days: string;
  type: string;
  dateAndTime?: string;
};

/**
 * @internal
 */
export type MetadataItem = {
  instanceid?: string;
  measure?: MetadataItemJaql;
  jaql: MetadataItemJaql;
  panel?: string;
  isScope?: boolean;
  members?: string[];
  format?: {
    mask?: Partial<DatetimeMask> | Partial<NumericMask>;
    number?: string;
    /* PIVOT OPTIONS START */
    subtotal?: boolean;
    width?: number;
    databars?: boolean;
    color?: {
      type: string;
      color?: string;
      conditions?: Array<{
        color: string;
        operator: string;
        expression: string | Record<string, any>;
      }>;
    };
  };
  field?: {
    id?: string;
    index?: number;
  };
  /* PIVOT OPTIONS END */
  filter?: MetadataItem;
  exclude?: MetadataItem;
  by?: MetadataItemJaql;
  level?: string;
  anchor?: string;

  from?: string;
  to?: string;
};

/**
 * @internal
 */
export type VagueMetadataItem = Omit<MetadataItem, 'json'> & {
  json?: MetadataItem;
};

/**
 * @internal
 */
export type MetadataItemJaql = {
  dim?: string;
  agg?: string;
  datatype?: string;
  table?: string;
  column?: string;
  level?: string;
  dateTimeLevel?: string;
  bucket?: string;
  sort?: string;
  in?: {
    selected: {
      jaql: MetadataItemJaql;
    };
  };
  title?: string;
  type?: string;
  formula?: string;
  context?: {
    [itemId: string]: MetadataItemJaql;
  };
  filter?: MetadataItem;
  sortDetails?: {
    dir: string;
    field?: number;
    measurePath?: Record<number, string | number>;
    sortingLastDimension?: boolean;
    initialized?: boolean;
  };
  // to support dashboard of multi sources
  datasource?: JaqlDataSource;
};

/**
 * Legacy Fusion data structure to describe a column (attribute) in a data source.
 * Better use {@link Attribute} instead if possible.
 * @internal
 */
export type DataSourceField = {
  column: string;
  dimtype: string;
  id: string;
  indexed: boolean;
  merged: boolean;
  table: string;
  tableTitle?: null | string;
  title: string;
  type: string;
  description?: null | string;
  tableDescription?: null | string;
};

/**
 * @internal
 */
export type DataSourceSchema = {
  title: string;
  type: 'extract' | 'live';
} & AnyObject;

/**
 * @internal
 */
export type DataSourceMetadata = {
  title: string;
  fullname: string;
  live: boolean;
};
