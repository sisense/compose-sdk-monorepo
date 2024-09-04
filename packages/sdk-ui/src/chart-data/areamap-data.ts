import { AreamapChartDataOptionsInternal } from '../chart-data-options/types.js';
import { DataTable, getColumnByName, getValue } from '../chart-data-processor/table-processor.js';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '../chart-options-processor/translations/number-format-config.js';
import { createValueColorOptions } from '../dashboard-widget/translate-panel-color-format.js';
import { geoDataColoringFunction } from './data-coloring/geo-data-coloring-function.js';
import { AreamapData, RawGeoDataElement } from './types.js';

const defaultAreamapColorOptions = createValueColorOptions({
  type: 'range',
  steps: 5,
  rangeMode: 'auto',
})!;

export const getAreamapData = (
  chartDataOptions: AreamapChartDataOptionsInternal,
  dataTable: DataTable,
): AreamapData => {
  const geoColumn = getColumnByName(dataTable, chartDataOptions.geo.name);
  const colorColumn = getColumnByName(
    dataTable,
    chartDataOptions.color?.name ?? chartDataOptions.geo.name,
  );
  if (!geoColumn || !colorColumn) {
    throw new Error('Missing required column');
  }
  const rawGeoData: RawGeoDataElement[] = dataTable.rows.map((row) => {
    const originalValue = getValue(row, colorColumn) as number;
    const numberFormatConfig = getCompleteNumberFormatConfig(
      chartDataOptions.color?.numberFormatConfig,
    );
    const formattedOriginalValue = applyFormatPlainText(numberFormatConfig, originalValue);
    return {
      geoName: getValue(row, geoColumn) as string,
      originalValue,
      formattedOriginalValue,
    };
  });

  let coloredGeoData;
  if (chartDataOptions.color) {
    coloredGeoData = geoDataColoringFunction(
      rawGeoData,
      chartDataOptions.color?.color || defaultAreamapColorOptions,
    );
  }

  return {
    type: 'areamap',
    geoData: coloredGeoData || rawGeoData,
  };
};
