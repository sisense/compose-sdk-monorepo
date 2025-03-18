import { TranslatableError } from '@/translation/translatable-error.js';
import { createValueColorOptions } from '@/widget-by-id/translate-panel-color-format.js';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '@/chart-options-processor/translations/number-format-config.js';
import { AreamapChartDataOptionsInternal } from '@/chart-data-options/types.js';
import { DataTable, getColumnByName, getValue } from '@/chart-data-processor/table-processor';
import { geoDataColoringFunction } from './geo-data-coloring-function';
import { AreamapData, RawGeoDataElement } from '../types';

const defaultAreamapColorOptions = createValueColorOptions({
  type: 'range',
  steps: 5,
  rangeMode: 'auto',
})!;

export const getAreamapData = (
  dataOptions: AreamapChartDataOptionsInternal,
  dataTable: DataTable,
): AreamapData => {
  const geoColumn = getColumnByName(dataTable, dataOptions.geo.column.name);
  const colorColumn = getColumnByName(
    dataTable,
    dataOptions.color?.column.name ?? dataOptions.geo.column.name,
  );
  if (!geoColumn || !colorColumn) {
    throw new TranslatableError('errors.requiredColumnMissing');
  }

  const rawGeoData: RawGeoDataElement[] = dataTable.rows.map((row) => {
    const originalValue = getValue(row, colorColumn) as number;
    const numberFormatConfig = getCompleteNumberFormatConfig(dataOptions.color?.numberFormatConfig);
    const formattedOriginalValue = applyFormatPlainText(numberFormatConfig, originalValue);
    return {
      geoName: getValue(row, geoColumn) as string,
      originalValue,
      formattedOriginalValue,
    };
  });

  let coloredGeoData;
  if (dataOptions.color) {
    coloredGeoData = geoDataColoringFunction(
      rawGeoData,
      dataOptions.color.color || defaultAreamapColorOptions,
    );
  }

  return {
    type: 'areamap',
    geoData: coloredGeoData || rawGeoData,
  };
};
