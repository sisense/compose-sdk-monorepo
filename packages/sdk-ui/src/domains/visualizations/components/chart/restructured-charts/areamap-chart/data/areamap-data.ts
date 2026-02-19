import { AreamapChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  DataTable,
  getColumnByName,
  getValue,
} from '@/domains/visualizations/core/chart-data-processor/table-processor.js';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config.js';
import { createValueColorOptions } from '@/domains/widgets/components/widget-by-id/translate-panel-color-format.js';
import { TranslatableError } from '@/infra/translation/translatable-error.js';

import { AreamapData, RawGeoDataElement } from '../types.js';
import { geoDataColoringFunction } from './geo-data-coloring-function.js';

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
    throw new TranslatableError('errors.requiredColumnMissing', {
      hint: 'geo or color column is missing for Areamap',
    });
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
