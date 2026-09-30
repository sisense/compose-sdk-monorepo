import {
  type Column,
  DateLevels,
  DimensionalLevelAttribute,
  isDateMeasure,
} from '@sisense/sdk-data';
import { type JaqlPanel } from '@sisense/sdk-pivot-query-client';

import {
  type AnyColumn,
  type PivotTableDataOptions,
  type StyledColumn,
  type StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types';
import {
  getDataOptionGranularity,
  getDefaultDateMeasureFormat,
  normalizeColumn,
} from '@/domains/visualizations/core/chart-data-options/utils';
import { getDefaultDateFormat } from '@/domains/visualizations/core/chart-options-processor/translations/axis-section';
import { getCompleteNumberFormatConfig } from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config';

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

/**
 * Resolves the mask for a date MEASURE cell.
 *
 * Masks come from `DimensionalLevelAttribute.getDefaultFormatForGranularity`, so a date measure
 * reads like the date dimension beside it. `getDateFormatConfig` is not used: it takes a dimension
 * column and falls back to `getDefaultDateFormat` (axis-section.ts), which answers days as
 * `M/d/yy` where this path answers `yyyy-MM-dd`.
 *
 * The panel-item fallback is what a measure with no level attribute resolves through, such as a
 * formula date measure.
 *
 * @param dataOption - The values data option for this cell, or undefined when there is none.
 * @param jaqlPanelItem - The panel item, used when the option carries no format of its own.
 * @returns The mask to format the cell with.
 * @internal
 */
export const resolvePivotDateMeasureFormat = (
  dataOption: AnyColumn | undefined,
  jaqlPanelItem: JaqlPanel | undefined,
): string => {
  const daysFormat = DimensionalLevelAttribute.getDefaultFormatForGranularity(DateLevels.Days);
  const measureColumn = dataOption as StyledMeasureColumn | undefined;

  if (measureColumn?.dateFormat) {
    return measureColumn.dateFormat;
  }

  // the shared resolver owns every rule about a date measure's default mask, the sub-day clamp
  // included, so this asks it rather than re-deriving one of them here
  if (measureColumn?.column && isDateMeasure(measureColumn.column)) {
    return getDefaultDateMeasureFormat(measureColumn.column);
  }

  if (!jaqlPanelItem?.jaql) {
    return daysFormat;
  }
  // the level travels on the panel item, so a measure with no style still masks like its dimension
  const granularity = DimensionalLevelAttribute.translateJaqlToGranularity(jaqlPanelItem.jaql);

  return DimensionalLevelAttribute.getDefaultFormatForGranularity(granularity) || daysFormat;
};
