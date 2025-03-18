import { ChartBuilder } from '../types.js';
import { dataOptionsTranslators } from './data-options';
import { areamapDataTranslators } from './data';
import { areamapDesignOptionsTranslators } from './design-options';
import { Areamap, isAreamapProps } from './renderer';

export const areamapChartBuilder: ChartBuilder<'areamap'> = {
  dataOptions: dataOptionsTranslators,
  data: areamapDataTranslators,
  designOptions: areamapDesignOptionsTranslators,
  renderer: {
    ChartRendererComponent: Areamap,
    isCorrectRendererProps: isAreamapProps,
  },
};
