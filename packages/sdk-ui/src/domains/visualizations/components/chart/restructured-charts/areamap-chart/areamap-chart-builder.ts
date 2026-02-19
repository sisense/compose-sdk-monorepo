import { ChartBuilder } from '../types.js';
import { dataOptionsTranslators } from './data-options/index.js';
import { areamapDataTranslators } from './data/index.js';
import { areamapDesignOptionsTranslators } from './design-options/index.js';
import { Areamap, isAreamapProps } from './renderer/index.js';

export const areamapChartBuilder: ChartBuilder<'areamap'> = {
  dataOptions: dataOptionsTranslators,
  data: areamapDataTranslators,
  designOptions: areamapDesignOptionsTranslators,
  renderer: {
    ChartRendererComponent: Areamap,
    isCorrectRendererProps: isAreamapProps,
  },
};
