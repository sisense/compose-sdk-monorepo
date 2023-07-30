/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */
import { isNumber, isDatetime } from '@sisense/sdk-data';
import { parseISO } from 'date-fns';
import isObject from 'lodash/isObject';
import { Row, Column, Value, ComparableData, CompareValue } from './table_processor';

export const createCompareValue = (
  displayValue: string | undefined | null,
  columnType: string,
): CompareValue => {
  const valueUndefined = !displayValue || displayValue === '';
  let value: Value;
  let valueIsNaN: boolean;
  let lowercaseValue: string | undefined;

  if (isNumber(columnType)) {
    value = parseFloat(displayValue as string);
    valueIsNaN = isNaN(value);
  } else if (isDatetime(columnType)) {
    value = parseISO(displayValue as string).valueOf();
    valueIsNaN = isNaN(value);
  } else {
    value = displayValue as string;
    lowercaseValue = displayValue?.toLowerCase();
    valueIsNaN = false;
  }

  return {
    value,
    valueUndefined,
    valueIsNaN,
    lowercaseValue,
  };
};

type ComparableValue = string | number | ComparableData | null | undefined;
type ComparableDataFull = ComparableData & {
  compareValue: CompareValue;
};

/**
 * Prepares comparable data with a compare value based on the provided value and type.
 *
 * @param {ComparableValue} value - The value to be converted into comparable data.
 * @param {string} type - The type of the value.
 * @returns {ComparableDataFull} The comparable data result.
 */
function prepareComparableData(value: ComparableValue, type: string): ComparableDataFull {
  const comparableData = isObject(value)
    ? value
    : ({ displayValue: value?.toString() } as ComparableData);

  // populates compareValue based on displayValue if it wasn't provided
  if (!comparableData.compareValue) {
    comparableData.compareValue = createCompareValue(comparableData.displayValue, type);
  }

  return comparableData as ComparableDataFull;
}

// TODO: use for Column['direction']
export enum SortDirectionValue {
  ASC = 1,
  DESC = -1,
  NONE = 0,
}

/**
 * Compares the two values as ComparableData objects.
 *
 * @param data1 - The first data to compare.
 * @param data2 - The second data to compare.
 * @param direction - The sorting direction. A positive number for ascending order, a negative number for descending order.
 * @param type - The data type of comparison to perform. Defaults to 'string'.
 * @returns {number} Returns -1 if data1 is smaller, 1 if data1 is larger, or 0 if they are equal.
 */
// eslint-disable-next-line max-params
export function compareValues(
  data1: ComparableValue,
  data2: ComparableValue,
  direction: SortDirectionValue = SortDirectionValue.ASC,
  type = 'string',
) {
  const comparableData1 = prepareComparableData(data1, type);
  const comparableData2 = prepareComparableData(data2, type);

  const value1 = comparableData1.compareValue;
  const value2 = comparableData2.compareValue;

  // null or '' are treated the same and are always last
  if (value1.valueUndefined && value2.valueUndefined) {
    return 0;
  } else if (value1.valueUndefined) {
    return 1;
  } else if (value2.valueUndefined) {
    return -1;
  }

  // NaN is always last
  if (value1.valueIsNaN && value2.valueIsNaN) {
    return 0;
  } else if (value1.valueIsNaN) {
    return 1;
  } else if (value2.valueIsNaN) {
    return -1;
  }

  // Notes: To match the server-side sorting behavior, we need to follow the following comparison algorithm for strings:
  // #1: Perform a case-insensitive comparison.
  // #2: If the strings are equal after the previous step, perform a case-sensitive comparison.
  const lowercaseValue1 = value1.lowercaseValue;
  const lowercaseValue2 = value2.lowercaseValue;
  const isTextComparison = lowercaseValue1 !== undefined && lowercaseValue2 !== undefined;
  if (isTextComparison) {
    if (lowercaseValue1 < lowercaseValue2) {
      return -1 * direction;
    } else if (lowercaseValue1 > lowercaseValue2) {
      return 1 * direction;
    }
  }

  if (value1.value < value2.value) {
    return -1 * direction;
  } else if (value1.value > value2.value) {
    return 1 * direction;
  }

  return 0;
}

export class RowComparator {
  columns: readonly Column[] = [];

  constructor(columns: readonly Column[]) {
    this.columns = columns;
  }

  compare(row1: Row, row2: Row) {
    for (let index = 0; index < this.columns.length; index++) {
      const column = this.columns[index];
      const data1 = row1[column.index];
      const data2 = row2[column.index];
      const direction = column.direction || 1;

      const comparisonResult = compareValues(data1, data2, direction, column.type);

      // finish the comparison only if values are not equal
      if (comparisonResult !== 0) {
        return comparisonResult;
      }
    }
    return 0;
  }
}
