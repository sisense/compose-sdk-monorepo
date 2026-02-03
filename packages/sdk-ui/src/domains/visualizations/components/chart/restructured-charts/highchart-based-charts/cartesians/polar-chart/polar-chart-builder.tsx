import { ChartBuilder } from '../../../types.js';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer.js';
import { getCommonCartesianAlerts } from '../helpers/alerts.js';
import { dataOptionsTranslators } from './data-options/index.js';
import { dataTranslators } from './data/index.js';
import { designOptionsTranslators } from './design-options/index.js';
import { polarHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder.js';

export const polarChartBuilder: ChartBuilder<'polar'> = {
  dataOptions: dataOptionsTranslators,
  data: dataTranslators,
  designOptions: designOptionsTranslators,
  renderer: {
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: polarHighchartsOptionsBuilder,
      getAlerts: getCommonCartesianAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
