import { type Column } from '@ethings-os/sdk-data';
import { getDataOptionGranularity, normalizeColumn } from '@/chart-data-options/utils';
import {
  type PivotTableDataOptions,
  type StyledColumn,
  type AnyColumn,
} from '@/chart-data-options/types';
import { getCompleteNumberFormatConfig } from '@/chart-options-processor/translations/number-format-config';
import { getDefaultDateFormat } from '@/chart-options-processor/translations/axis-section';

export const getPivotDataOptionByJaqlIndex = (
  dataOptions: PivotTableDataOptions,
  dataOptionIndex = -1,
): AnyColumn | undefined => {
  const alignedDataOptionsArray = [
    ...(dataOptions.rows ?? []),
    ...(dataOptions.columns ?? []),
    ...(dataOptions.values ?? []),
  ];
  return alignedDataOptionsArray[dataOptionIndex];
};

export const getPivotDataOptionIdByJaqlIndex = (
  dataOptions: PivotTableDataOptions,
  dataOptionIndex = -1,
): string | undefined => {
  const { rows = [], columns = [], values = [] } = dataOptions;
  const rowsLength = Number(rows.length) || 0;
  const columnsLength = Number(columns.length) || 0;
  const valuesLength = Number(values.length) || 0;

  if (dataOptionIndex === -1) {
    return undefined;
  }
  if (dataOptionIndex < rowsLength) {
    return `rows.${dataOptionIndex}`;
  }
  if (dataOptionIndex < rowsLength + columnsLength) {
    return `columns.${dataOptionIndex - rowsLength}`;
  }
  if (dataOptionIndex < rowsLength + columnsLength + valuesLength) {
    return `values.${dataOptionIndex - rowsLength - columnsLength}`;
  }
  return undefined;
};

export const getNumberFormatConfig = (dataOption?: AnyColumn) => {
  const numberFormatConfig =
    dataOption && 'numberFormatConfig' in dataOption ? dataOption.numberFormatConfig : undefined;

  return getCompleteNumberFormatConfig(numberFormatConfig);
};

export const getDateFormatConfig = (dataOption: Column | StyledColumn) => {
  // Note: need to normalize column in order to get `dateFormat` with default value
  const column = normalizeColumn(dataOption);
  const granularity = getDataOptionGranularity(column);
  return column?.dateFormat || getDefaultDateFormat(granularity);
};
