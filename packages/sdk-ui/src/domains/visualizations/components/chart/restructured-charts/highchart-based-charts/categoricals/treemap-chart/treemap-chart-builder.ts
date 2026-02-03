import { ChartBuilder } from '../../../types.js';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer.js';
import { getTreemapAlerts } from './alerts/index.js';
import { dataOptionsTranslators } from './data-options/index.js';
import { dataTranslators } from './data/index.js';
import { designOptionsTranslators } from './design-options/index.js';
import { treemapHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder.js';

export const treemapChartBuilder: ChartBuilder<'treemap'> = {
  dataOptions: dataOptionsTranslators,
  data: dataTranslators,
  designOptions: designOptionsTranslators,
  renderer: {
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: treemapHighchartsOptionsBuilder,
      getAlerts: getTreemapAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
