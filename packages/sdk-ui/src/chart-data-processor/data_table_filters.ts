/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import { DataTable } from './table_processor';
import { simpleColumnType } from '@sisense/sdk-data';
import {
  periodCompareValueForNow,
  DatePeriod,
  periodCompareValueForPastPeriod,
  periodCompareValueForFuturePeriod,
  periodCompareValueForSpecificDate,
  ExtendedDatePeriod,
  isPseudoDatePeriod,
  toPeriodCompareValue,
} from './data_table_date_period';

export enum FilterOperator {
  BETWEEN = 'Between',
  NOT_BETWEEN = 'Not between',
  DOES_NOT_END_WITH = 'Does not end with',
  DOES_NOT_START_WITH = 'Does not start with',
  ENDS_WITH = 'Ends with',
  IN = 'In',
  NOT_IN = 'Not in',
  CONTAINS = 'Contains',
  NOT_CONTAINS = 'Does not contain',
  STARTS_WITH = 'Starts with',
  EQUALS = 'Equals',
  NOT_EQUALS = 'Does not equal',
  EMPTY = 'Empty',
  NOT_EMPTY = 'Not empty',
  LESS_THAN = 'Less Than',
  LESS_THAN_OR_EQUAL = 'Equal or Less Than',
  GREATER_THAN = 'Greater Than',
  GREATER_THAN_OR_EQUAL = 'Equal or Greater Than',
  BEFORE = 'Before',
  CURRENT = 'Current',
  AFTER = 'After',
  TOP = 'Top',
  BOTTOM = 'Bottom',
}

export type Column = {
  name: string;
  type: string;
};

type FilterDate = number;

export type FilterDateList = {
  period: ExtendedDatePeriod;
  dates: FilterDate[];
};

const DIRECTIONS = [FilterOperator.BEFORE, FilterOperator.CURRENT, FilterOperator.AFTER];
export type TopBottomOptions = {
  cellId?: string;
  limit?: number;
  period?: ExtendedDatePeriod;
  aggColumnName?: string;
};

export type FilterDateDynamicDirection = (typeof DIRECTIONS)[number];
export type FilterDateConditionalIsOrIsNot = {
  op: FilterOperator.IN | FilterOperator.NOT_IN;
  list: FilterDateList;
};

export type FilterDateConditionalIsWithin = {
  op: FilterOperator.BEFORE | FilterOperator.AFTER;
  num: number;
  period: DatePeriod;
  referenceDate?: FilterDate;
};

export type FilterDateConditionalTopBottom = {
  op: FilterOperator.TOP | FilterOperator.BOTTOM;
  topBottomOptions: TopBottomOptions;
};
export type FilterDateConditional =
  | FilterDateConditionalIsOrIsNot
  | FilterDateConditionalIsWithin
  | FilterDateConditionalTopBottom;

// Includes everything that can be changed in the Filter Modal
// by pressing the 'Apply' button
export type DateFilterSelectionState = {
  columnName: string;
  dataType: FilterType.DATETIME;
  type: FilterSubType;
  list?: FilterDateList;
  dynamic?: {
    dir: FilterDateDynamicDirection;
    num: number;
    period: DatePeriod;
  };
  range?: {
    start: FilterDate;
    end: FilterDate;
  };
  conditional?: FilterDateConditional;
};

export type FilterNumberConditional = {
  op: FilterOperator;
  values: number[];
  topBottomOptions?: TopBottomOptions;
};

export type NumberFilterSelectionState = {
  columnName: string;
  dataType: FilterType.NUMBER;
  type: FilterSubType;
  range?: {
    start: number;
    end: number;
  };
  list?: number[];
  conditional?: FilterNumberConditional;
};

export type TextFilterSelectionState = {
  columnName: string;
  dataType: FilterType.TEXT;
  type: FilterSubType;
  list?: string[];
  conditional?: {
    op: FilterOperator;
    text: string[];
    topBottomOptions?: TopBottomOptions;
  };
};

export type FilterState =
  | DateFilterSelectionState
  | NumberFilterSelectionState
  | TextFilterSelectionState;

export enum FilterType {
  DATETIME = 'datetime',
  NUMBER = 'number',
  TEXT = 'text',
}

export enum FilterSubType {
  LIST = 'List',
  DYNAMIC = 'Dynamic',
  RANGE = 'Range',
  CONDITIONAL = 'Conditional',
  INCLUDE_ALL = 'Include All',
}

export type Filter = {
  column: Column;
  data: Array<FilterData>;
  type?: FilterType;
  userSelections: FilterState;
};

export type FilterData = {
  operator: FilterOperator;
  period?: ExtendedDatePeriod;
  values: Array<string | number | Date>;
};

// Keyed by column name, then type
export type FilterGroup = Record<string, Record<string, Filter>>;

export const filterBy = (table: DataTable, filters: FilterGroup, locale: Locale): DataTable => {
  let filteredRows = table.rows;

  // Iterate through each column that has filters
  const filterColumns = Object.keys(filters);
  for (let i = 0; i < filterColumns.length; i++) {
    const columnName = filterColumns[i];
    const types = Object.keys(filters[columnName]);

    // Iterate through each column type for the column
    for (let j = 0; j < types.length; j++) {
      const type = types[j];
      const columnIndex = getColumnIndex(table, columnName, type);

      // If column not found, continue, else filter rows
      if (columnIndex === -1 || filters[columnName][type].data.length === 0) {
        continue;
      }

      filteredRows = filteredRows.filter((row) => {
        switch (type) {
          case FilterType.DATETIME:
            return filterDateTime(
              row[columnIndex].displayValue,
              filters[columnName][type].data[0],
              locale,
            );
          case FilterType.NUMBER:
            return filterNumber(row[columnIndex].displayValue, filters[columnName][type].data[0]);
          case FilterType.TEXT:
            return filterText(row[columnIndex].displayValue, filters[columnName][type].data[0]);
          default:
            return false;
        }
      });
    }
  }

  return {
    columns: table.columns,
    rows: filteredRows,
  };
};

const filterDateTime = (value: string, filterData: FilterData, locale: Locale) => {
  const period: ExtendedDatePeriod = filterData.period ?? DatePeriod.DATE;
  if (filterData.values.length === 0) {
    return true;
  }
  const compareValue = toPeriodCompareValue(period, value, locale);

  switch (filterData.operator) {
    case FilterOperator.TOP:
    case FilterOperator.BOTTOM:
    case FilterOperator.IN:
      return filterData.values.includes(compareValue);
    case FilterOperator.NOT_IN:
      return !filterData.values.includes(compareValue);
  }

  if (isPseudoDatePeriod(period)) {
    return true;
  }

  switch (filterData.operator) {
    case FilterOperator.BETWEEN:
      return (
        filterData.values.length === 2 &&
        compareValue >= filterData.values[0] &&
        compareValue <= filterData.values[1]
      );
    case FilterOperator.BEFORE:
      return (
        compareValue >=
          periodCompareValueForPastPeriod(
            period,
            Number(filterData.values[0]),
            Number(filterData.values[1] ?? Date.now()),
            locale,
          ) &&
        compareValue <=
          periodCompareValueForSpecificDate(
            period,
            Number(filterData.values[1] ?? Date.now()),
            locale,
          )
      );
    case FilterOperator.CURRENT:
      return compareValue === periodCompareValueForNow(period, locale);
    case FilterOperator.AFTER:
      return (
        compareValue >=
          periodCompareValueForSpecificDate(
            period,
            Number(filterData.values[1] ?? Date.now()),
            locale,
          ) &&
        compareValue <=
          periodCompareValueForFuturePeriod(
            period,
            Number(filterData.values[0]),
            Number(filterData.values[1] ?? Date.now()),
            locale,
          )
      );
  }

  return false;
};

const filterNumber = (value: string, filter: FilterData) => {
  const number = Number(value);
  const isEmpty = isNaN(number);

  if (isEmpty) {
    return filter.operator === FilterOperator.EMPTY;
  } else if (filter.operator === FilterOperator.EMPTY) {
    return false;
  } else if (filter.operator === FilterOperator.NOT_EMPTY) {
    return true;
  }

  if (filter.values.length === 0) {
    return true;
  }
  switch (filter.operator) {
    case FilterOperator.BETWEEN:
      return filter.values.length === 2 && number >= filter.values[0] && number <= filter.values[1];
    case FilterOperator.NOT_BETWEEN:
      return filter.values.length === 2 && (number < filter.values[0] || number > filter.values[1]);
    case FilterOperator.TOP:
    case FilterOperator.BOTTOM:
    case FilterOperator.IN:
      return filter.values.includes(number);
    case FilterOperator.NOT_IN:
      return !filter.values.includes(number);
    case FilterOperator.EQUALS:
      return number === filter.values[0];
    case FilterOperator.NOT_EQUALS:
      return number !== filter.values[0];
    case FilterOperator.LESS_THAN:
      return number < filter.values[0];
    case FilterOperator.LESS_THAN_OR_EQUAL:
      return number <= filter.values[0];
    case FilterOperator.GREATER_THAN:
      return number > filter.values[0];
    case FilterOperator.GREATER_THAN_OR_EQUAL:
      return number >= filter.values[0];
  }
  return false;
};

const filterText = (value: string, filterData: FilterData) => {
  const filterValuesLower: string[] = filterData.values.map((text) => {
    if (typeof text === 'string') {
      return text.toLowerCase();
    }
    // text should only ever be of string type when filterText is called,
    // so this line should never really be reached. It is only here to keep
    // Typescript from complaining about return types.
    return text.toString();
  });
  const valueLower = value.toLowerCase();
  if (filterData.values.length === 0) {
    return true;
  }

  switch (filterData.operator) {
    case FilterOperator.DOES_NOT_END_WITH:
      return !valueLower.endsWith(filterValuesLower[0]);
    case FilterOperator.DOES_NOT_START_WITH:
      return !valueLower.startsWith(filterValuesLower[0]);
    case FilterOperator.ENDS_WITH:
      return valueLower.endsWith(filterValuesLower[0]);
    case FilterOperator.IN:
    case FilterOperator.TOP:
    case FilterOperator.BOTTOM:
      return filterValuesLower.includes(valueLower);
    case FilterOperator.NOT_IN:
      return !filterValuesLower.includes(valueLower);
    case FilterOperator.CONTAINS:
      return valueLower.includes(filterValuesLower[0]);
    case FilterOperator.NOT_CONTAINS:
      return !valueLower.includes(filterValuesLower[0]);
    case FilterOperator.STARTS_WITH:
      return valueLower.startsWith(filterValuesLower[0]);
    case FilterOperator.EQUALS:
      return filterValuesLower[0] === valueLower;
    case FilterOperator.NOT_EQUALS:
      return filterValuesLower[0] !== valueLower;
    case FilterOperator.EMPTY:
      return !valueLower;
    case FilterOperator.NOT_EMPTY:
      return valueLower;
  }
  return false;
};

// Get the index of the column in the table, else -1
const getColumnIndex = (table: DataTable, columnName: string, type: string): number => {
  for (let i = 0; i < table.columns.length; i++) {
    if (table.columns[i].name === columnName && simpleColumnType(table.columns[i].type) === type) {
      return i;
    }
  }
  return -1;
};

export const filtersUpdatedForTable = (
  columns: readonly Column[],
  filters?: FilterGroup,
  prevFilters?: FilterGroup,
): boolean => {
  for (let i = 0; i < columns.length; i++) {
    const name = columns[i].name;
    const type = simpleColumnType(columns[i].type);

    const hasFilter =
      filters !== undefined && filters[name] !== undefined && filters[name][type] !== undefined;
    const hasPrevFilter =
      prevFilters !== undefined &&
      prevFilters[name] !== undefined &&
      prevFilters[name][type] !== undefined;
    if (hasFilter !== hasPrevFilter) {
      if (!(hasFilter && !hasPrevFilter && filters && filters[name][type].data.length === 0)) {
        return true;
      }
    } else if (hasFilter && hasPrevFilter && filters && prevFilters) {
      const currentFilter = JSON.stringify(filters[name][type].data);
      const previousFilter = JSON.stringify(prevFilters[name][type].data);
      if (currentFilter !== previousFilter) {
        return true;
      }
    }
  }

  return false;
};

export const getAppliedFilters = (columns: readonly Column[], filters: FilterGroup): Filter[] => {
  const addedFilters = [];
  for (let i = 0; i < columns.length; i++) {
    const name = columns[i].name;
    const type = simpleColumnType(columns[i].type);

    if (filters[name]?.[type]?.data.length > 0) {
      addedFilters.push(filters[name][type]);
    }
  }
  return addedFilters;
};
