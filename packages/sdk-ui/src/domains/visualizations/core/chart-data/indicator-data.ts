import { isDateMeasure } from '@sisense/sdk-data';

import {
  IndicatorChartDataOptionsInternal,
  StyledMeasureColumn,
} from '../chart-data-options/types';
import {
  DataTable,
  getColumnByName,
  getValue,
  Value,
} from '../chart-data-processor/table-processor';
import { IndicatorChartData } from './types.js';

type FirstRowValue = {
  value?: number;
  text?: string;
};

/**
 * Returns the cell as a number, or NaN when it is not one.
 *
 * An unavailable cell arrives as the `NOT_AVAILABLE_DATA_VALUE` string, even on a datetime column,
 * so it becomes NaN, which every reader downstream already treats as unavailable.
 *
 * @param rawValue - The value read from the data table.
 * @returns The numeric value, or `undefined` when the cell is missing.
 */
const toNumericValue = (rawValue: Value | undefined): number | undefined => {
  if (rawValue === undefined) {
    return undefined;
  }
  return typeof rawValue === 'number' ? rawValue : NaN;
};

const valueFromFirstRow = (
  dataTable: DataTable,
  measure: StyledMeasureColumn[] | undefined,
): FirstRowValue => {
  if (!measure || measure.length !== 1) {
    return {};
  }
  const column = getColumnByName(dataTable, measure[0].column.name);
  if (!column) {
    return {};
  }
  const row = dataTable.rows[0];
  const value = toNumericValue(getValue(row, column));
  // a date measure is displayed from the text `applyDateFormats` already produced, while the number
  // stays the epoch the gauge geometry needs. Availability comes first: an unavailable cell carries
  // `NOT_AVAILABLE_DATA_VALUE` as its text, which must never be displayed.
  const isAvailableDateMeasure = isDateMeasure(measure[0].column) && Number.isFinite(value);

  return {
    value,
    ...(isAvailableDateMeasure && { text: row[column.index]?.displayValue }),
  };
};

const colorConditionValuesFromRow = (
  dataTable: DataTable,
  colorConditionMeasures: StyledMeasureColumn[] | undefined,
): Record<string, number> | undefined => {
  if (!colorConditionMeasures?.length) {
    return undefined;
  }
  const entries = colorConditionMeasures
    .map((measure) => [measure.column.name, valueFromFirstRow(dataTable, [measure]).value] as const)
    .filter((entry): entry is [string, number] => entry[1] !== undefined);
  return entries.length ? Object.fromEntries(entries) : undefined;
};

// Given chart source and data options, generate indicator data
export const indicatorData = (
  dataOptions: IndicatorChartDataOptionsInternal,
  dataTable: DataTable,
): IndicatorChartData => {
  const emptyIndicatorData: IndicatorChartData = { type: 'indicator' };
  if (!dataOptions.value?.length || dataTable.rows.length === 0) {
    return emptyIndicatorData;
  }

  // required field
  const { value, text: valueText } = valueFromFirstRow(dataTable, dataOptions.value);
  if (value === undefined) {
    return emptyIndicatorData;
  }

  // optional fields
  const { value: secondary, text: secondaryText } = valueFromFirstRow(
    dataTable,
    dataOptions.secondary,
  );
  const { value: min, text: minText } = valueFromFirstRow(dataTable, dataOptions.min);
  const { value: max, text: maxText } = valueFromFirstRow(dataTable, dataOptions.max);
  const valueOption = dataOptions.value[0];
  const isDateValue = isDateMeasure(valueOption.column);
  if (isDateValue && 'color' in valueOption && valueOption.color) {
    console.warn(
      `The indicator's color options are ignored, because a color rule cannot be applied to a date measure.`,
    );
  }
  // color rules are skipped for a date value, so their thresholds are not worth resolving
  const colorConditionValues = isDateValue
    ? undefined
    : colorConditionValuesFromRow(dataTable, dataOptions.colorConditionMeasures);

  return {
    type: 'indicator',
    value,
    secondary,
    min,
    max,
    ...(valueText && { valueText }),
    ...(secondaryText && { secondaryText }),
    ...(minText && { minText }),
    ...(maxText && { maxText }),
    ...(colorConditionValues && { colorConditionValues }),
  };
};
