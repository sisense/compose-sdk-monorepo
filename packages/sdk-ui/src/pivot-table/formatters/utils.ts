import { type Column } from '@sisense/sdk-data';
import { translateColumnToCategory } from '@/chart-data-options/utils';
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
  // Note: need to convert column into category in order to get `dateFormat` with default value
  const category = translateColumnToCategory(dataOption);
  return category?.dateFormat || getDefaultDateFormat(category?.granularity);
};
