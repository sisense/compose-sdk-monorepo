import { SeriesValueData } from '../types.js';
import { createDataColoringFunction } from './create-data-coloring-function.js';

export const seriesDataColoringFunction = createDataColoringFunction({
  getValueFromDataStructure: (seriesValue: SeriesValueData) => seriesValue.value,
  applyColorToDataStructure: (seriesValue: SeriesValueData, color?: string) => ({
    ...seriesValue,
    color,
  }),
});
