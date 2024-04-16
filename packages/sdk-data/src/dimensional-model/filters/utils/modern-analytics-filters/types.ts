/* eslint-disable max-lines */

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

export type JaqlContext = Record<string, Partial<FilterJaqlInternal>>;

export type Id = string;

export type Datasource = {
  address: Id;
  database: string;
  id: string;
  title: string;
  live?: boolean;
  fullname: string;
  lastBuildTime?: string;
  revisionId?: string;
};

export enum GeneralFilterTypes {
  INCLUDE_ALL = 'INCLUDE_ALL',
  ADVANCED = 'ADVANCED',
  INVALID = 'INVALID',
  CONDITION = 'CONDITION',
  SPECIFIC_ITEMS = 'SPECIFIC_ITEMS',
}

export enum DateTimeFilterTypes {
  PERIOD = 'PERIOD',
  DATE_RANGE = 'DATE_RANGE',
}

export enum NumericFilterTypes {
  NUMERIC_RANGE = 'NUMERIC_RANGE',
}

export type FilterTypes = GeneralFilterTypes | DateTimeFilterTypes | NumericFilterTypes;

export interface FilterType {
  jaqlType?: FilterTypes;
  custom?: boolean;
  isAdvanced?: boolean;
  rankingMessage?: string;
  isBetween?: boolean;
  isEmpty?: boolean;
}

export interface IncludeAllJaql extends FilterType {
  all: boolean;
}

export type PeriodDetails = { count: number; offset: number; anchor?: string };
export interface PeriodJaqlOptions extends FilterType {
  last: PeriodDetails;
  next: PeriodDetails;
  multiSelection?: boolean;
  // an indicator when 'This' period is not selected
  // as no jaql property is defined for 'last + current period'
  isNotCurrentPeriod?: boolean;
}
export type PeriodJaql = RequireOnlyOne<PeriodJaqlOptions, 'last' | 'next'>;

export interface RangeJaql extends FilterType {
  from?: string | number;
  to?: string | number;
  multiSelection?: boolean;
}

export type RankingJaql = {
  agg: string;
  column: string;
  datatype: string;
  dim: string;
  level?: string;
  merged?: boolean;
  table: string;
};

export type FilterMultiSelect = {
  explicit?: boolean;
  multiSelection: boolean;
  members: string[];
  isCondition?: boolean;
};

export type MultipleCondition = { or: ConditionJaql[]; and: ConditionJaql[] };

export type ConditionJaqlOptions = FilterType & {
  top: number;
  bottom: number;
  exclude: { members?: string[]; from?: number; to?: number };
  startsWith: string;
  doesntStartWith: string;
  endsWith: string;
  doesntEndWith: string;
  doesntContain: string;
  equals: number | string;
  doesntEqual: number | string;
  to: number;
  toNotEqual: number;
  from: number;
  fromNotEqual: number;
  contains: string;
  by?: RankingJaql;
  rankingMessage?: string;
} & Partial<FilterMultiSelect> &
  Partial<PeriodJaql> &
  Partial<RangeJaql> &
  Partial<MultipleCondition>;

export type ConditionJaql = RequireOnlyOne<
  ConditionJaqlOptions,
  | 'top'
  | 'bottom'
  | 'exclude'
  | 'last'
  | 'next'
  | 'contains'
  | 'equals'
  | 'doesntEqual'
  | 'to'
  | 'toNotEqual'
  | 'from'
  | 'fromNotEqual'
  | 'startsWith'
  | 'doesntStartWith'
  | 'endsWith'
  | 'doesntEndWith'
  | 'doesntContain'
  | 'or'
  | 'and'
>;

export type InvalidType = FilterType;

export type SpecificItemsJaql = FilterType & FilterMultiSelect;

export type FilterJaqlTypes =
  | IncludeAllJaql
  | PeriodJaql
  | RangeJaql
  | ConditionJaql
  | InvalidType
  | SpecificItemsJaql;

export enum DatetimeLevel {
  YEARS = 'years',
  QUARTERS = 'quarters',
  MONTHS = 'months',
  WEEKS = 'weeks',
  DAYS = 'days',
  HOURS = 'hours',
  MINUTES = 'minutes',
}

export type FilterJaqlInternal = {
  title: string;
  column: string;
  datasource?: Datasource;
  datatype: string;
  dim: string;
  dimension?: string;
  fiscal?: string;
  firstday?: string;
  merged?: boolean;
  table: string;
  filter?: FilterJaqlTypes;
  level?: DatetimeLevel;
  locale?: string;
  bucket?: string;
  collapsed?: boolean;
  isDashboardFilter?: boolean;
  formula?: string;
  context?: JaqlContext;
  agg?: string;
};

export enum FilterModalTypes {
  DATE_TIME = 'datetime',
  NUMERIC = 'numeric',
  TEXT = 'text',
}

export type BackgroundFilterExtraProps = { level?: DatetimeLevel; turnedOff?: boolean };

export type BackgroundFilter = {
  filter?: FilterJaqlTypes & BackgroundFilterExtraProps;
};

export type FilterJaqlWrapperType = {
  filter: FilterJaqlTypes & BackgroundFilter;
  level?: DatetimeLevel;
  agg?: string;
};

export const nonSupportedMinutesBuckets = ['1', '30'];

export const FILTER_TYPES = {
  ...GeneralFilterTypes,
  ...DateTimeFilterTypes,
  ...NumericFilterTypes,
};

export type FilterJaqlDefaultType = {
  [FILTER_TYPES.INCLUDE_ALL]: IncludeAllJaql;
  [FILTER_TYPES.PERIOD]: PeriodJaql;
  [FILTER_TYPES.DATE_RANGE]: RangeJaql;
  [FILTER_TYPES.NUMERIC_RANGE]: RangeJaql;
  [FILTER_TYPES.CONDITION]: ConditionJaql;
  [FILTER_TYPES.SPECIFIC_ITEMS]: SpecificItemsJaql;
};

export const FILTER_JAQL_DEFAULT: FilterJaqlDefaultType = {
  [FILTER_TYPES.INCLUDE_ALL]: {
    all: true,
    jaqlType: FILTER_TYPES.INCLUDE_ALL,
  },
  [FILTER_TYPES.PERIOD]: {
    last: { count: 1, offset: 1 },
    isNotCurrentPeriod: true,
    jaqlType: FILTER_TYPES.PERIOD,
  },
  [FILTER_TYPES.DATE_RANGE]: {
    jaqlType: FILTER_TYPES.DATE_RANGE,
  },
  [FILTER_TYPES.NUMERIC_RANGE]: {
    jaqlType: FILTER_TYPES.NUMERIC_RANGE,
  },
  [FILTER_TYPES.CONDITION]: {
    explicit: false,
    multiSelection: true,
    exclude: { members: [] },
    jaqlType: FILTER_TYPES.CONDITION,
  },
  [FILTER_TYPES.SPECIFIC_ITEMS]: {
    explicit: true,
    multiSelection: true,
    members: [],
    jaqlType: FILTER_TYPES.SPECIFIC_ITEMS,
  },
};

export const FILTER_JAQL_WRAPPER: FilterJaqlWrapperType = {
  filter: FILTER_JAQL_DEFAULT.INCLUDE_ALL,
  level: DatetimeLevel.YEARS,
};

export enum ConditionTypes {
  IS = 'members',
  IS_NOT = 'exclude',
  IS_WITHIN = 'isWithin',
  TOP = 'top',
  BOTTOM = 'bottom',
  AFTER = 'after',
  BEFORE = 'before',
  STARTS_WITH = 'startsWith',
  DOESNT_START_WITH = 'doesntStartWith',
  ENDS_WITH = 'endsWith',
  DOESNT_END_WITH = 'doesntEndWith',
  CONTAINS = 'contains',
  DOESNT_CONTAIN = 'doesntContain',
  EQUALS = 'equals',
  DOESNT_EQUAL = 'doesntEqual',
  IS_EMPTY = 'isEmpty',
  IS_NOT_EMPTY = 'isNotEmpty',
  GREATER_THAN = 'fromNotEqual',
  GREATER_THAN_OR_EQUAL = 'from',
  LESS_THAN = 'toNotEqual',
  LESS_THAN_OR_EQUAL = 'to',
  BETWEEN = 'between',
  IS_NOT_BETWEEN = 'isNotBetween',
  MULTIPLE_CONDITION = 'multipleCondition',
  NONE = 'none',
}
