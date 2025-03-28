import { type Column } from '@sisense/sdk-data';
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
