import { FormulaContext, FormulaJaql } from '../../types.js';

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

export type JaqlContext = Record<string, Partial<FilterJaqlInternal>>;

export type Id = string;

/**
 * Data source as specified in the jaql
 *
 * @internal
 */
export type JaqlDataSource = {
  address?: Id;
  database?: string;
  id?: string;
  title: string;
  live?: boolean;
  fullname?: string;
  lastBuildTime?: string;
  revisionId?: string;
  type?: 'live' | 'elasticube';
};

/**
 * Data source as specified in the jaql
 * but with required filelds
 *
 * @internal
 */
export type JaqlDataSourceForDto = JaqlDataSource & { id: string; address?: string };

export enum GeneralFilterType {
  INCLUDE_ALL = 'INCLUDE_ALL',
  ADVANCED = 'ADVANCED',
  INVALID = 'INVALID',
  CONDITION = 'CONDITION',
  SPECIFIC_ITEMS = 'SPECIFIC_ITEMS',
}

export enum DateTimeFilterType {
  PERIOD = 'PERIOD',
  DATE_RANGE = 'DATE_RANGE',
}

export enum NumericFilterType {
  NUMERIC_RANGE = 'NUMERIC_RANGE',
}

export type FilterType = GeneralFilterType | DateTimeFilterType | NumericFilterType;

export interface BaseFilterJaql {
  filterType?: FilterType;
  custom?: boolean;
  isAdvanced?: boolean;
  rankingMessage?: string;
  isBetween?: boolean;
  isEmpty?: boolean;
}

export interface IncludeAllFilterJaql extends BaseFilterJaql {
  all: boolean;
}

export type PeriodFilterDetails = { count: number; offset: number; anchor?: string };
export interface PeriodFilterJaqlOptions extends BaseFilterJaql {
  last: PeriodFilterDetails;
  next: PeriodFilterDetails;
  multiSelection?: boolean;
  // an indicator when 'This' period is not selected
  // as no jaql property is defined for 'last + current period'
  isNotCurrentPeriod?: boolean;
}
export type PeriodFilterJaql = RequireOnlyOne<PeriodFilterJaqlOptions, 'last' | 'next'>;

export interface RangeFilterJaql extends BaseFilterJaql {
  from?: string | number;
  to?: string | number;
  multiSelection?: boolean;
}

export type CustomFormulaJaql =
  | (FormulaJaql & { context?: FormulaJaql | FormulaContext })
  | FormulaContext;

export type RankingFilterJaql = {
  agg: string;
  column: string;
  datatype: string;
  dim: string;
  level?: string;
  merged?: boolean;
  table: string;
};

export type FilterMultiSelectJaql = {
  explicit?: boolean;
  multiSelection: boolean;
  members: string[];
  isCondition?: boolean;
  filter?: {
    turnedOff?: boolean;
    exclude?: { members?: string[] };
  };
};

export type FilterMultipleConditionJaql = { or: ConditionFilterJaql[]; and: ConditionFilterJaql[] };

export type ConditionFilterJaqlOptions = BaseFilterJaql & {
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
  by?: RankingFilterJaql;
  rankingMessage?: string;
} & Partial<FilterMultiSelectJaql> &
  Partial<PeriodFilterJaql> &
  Partial<RangeFilterJaql> &
  Partial<FilterMultipleConditionJaql>;

export type ConditionFilterJaql = RequireOnlyOne<
  ConditionFilterJaqlOptions,
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

export type InvalidTypeFilterJaql = BaseFilterJaql;

export type SpecificItemsFilterJaql = BaseFilterJaql & FilterMultiSelectJaql;

export type AnyTypeFilterJaql =
  | IncludeAllFilterJaql
  | PeriodFilterJaql
  | RangeFilterJaql
  | ConditionFilterJaql
  | InvalidTypeFilterJaql
  | SpecificItemsFilterJaql;

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
  datasource?: JaqlDataSource;
  datatype: string;
  dim: string;
  dimension?: string;
  fiscal?: string;
  firstday?: string;
  merged?: boolean;
  table?: string;
  filter?: AnyTypeFilterJaql;
  level?: DatetimeLevel;
  locale?: string;
  bucket?: string;
  collapsed?: boolean;
  isDashboardFilter?: boolean;
  formula?: string;
  context?: JaqlContext;
  agg?: string;
};

export enum FilterModalType {
  DATE_TIME = 'datetime',
  NUMERIC = 'numeric',
  TEXT = 'text',
}

export type BackgroundFilterExtraProps = { level?: DatetimeLevel; turnedOff?: boolean };

export type BackgroundFilter = {
  filter?: AnyTypeFilterJaql & BackgroundFilterExtraProps;
};

export type FilterJaqlWrapperWithType = {
  filter: AnyTypeFilterJaql & BackgroundFilter;
  level?: DatetimeLevel;
  agg?: string;
};

export const nonSupportedMinutesBuckets = ['1', '30'];

export const FILTER_TYPES = {
  ...GeneralFilterType,
  ...DateTimeFilterType,
  ...NumericFilterType,
};

export type FilterJaqlByTypeMap = {
  [FILTER_TYPES.INCLUDE_ALL]: IncludeAllFilterJaql;
  [FILTER_TYPES.PERIOD]: PeriodFilterJaql;
  [FILTER_TYPES.DATE_RANGE]: RangeFilterJaql;
  [FILTER_TYPES.NUMERIC_RANGE]: RangeFilterJaql;
  [FILTER_TYPES.CONDITION]: ConditionFilterJaql;
  [FILTER_TYPES.SPECIFIC_ITEMS]: SpecificItemsFilterJaql;
};

export const DEFAULT_FILTER_JAQL_BY_TYPE_MAP: FilterJaqlByTypeMap = {
  [FILTER_TYPES.INCLUDE_ALL]: {
    all: true,
    filterType: FILTER_TYPES.INCLUDE_ALL,
  },
  [FILTER_TYPES.PERIOD]: {
    last: { count: 1, offset: 1 },
    isNotCurrentPeriod: true,
    filterType: FILTER_TYPES.PERIOD,
  },
  [FILTER_TYPES.DATE_RANGE]: {
    filterType: FILTER_TYPES.DATE_RANGE,
  },
  [FILTER_TYPES.NUMERIC_RANGE]: {
    filterType: FILTER_TYPES.NUMERIC_RANGE,
  },
  [FILTER_TYPES.CONDITION]: {
    explicit: false,
    multiSelection: true,
    exclude: { members: [] },
    filterType: FILTER_TYPES.CONDITION,
  },
  [FILTER_TYPES.SPECIFIC_ITEMS]: {
    explicit: true,
    multiSelection: true,
    members: [],
    filterType: FILTER_TYPES.SPECIFIC_ITEMS,
  },
};

export const DEFAULT_FILTER_JAQL_WRAPPER: FilterJaqlWrapperWithType = {
  filter: DEFAULT_FILTER_JAQL_BY_TYPE_MAP.INCLUDE_ALL,
  level: DatetimeLevel.YEARS,
};

export enum ConditionFilterType {
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
