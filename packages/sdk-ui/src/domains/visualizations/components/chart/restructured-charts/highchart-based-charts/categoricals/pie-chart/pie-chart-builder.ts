import { ChartBuilder } from '../../../types.js';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer.js';
import { getPieChartAlerts } from './alerts/index.js';
import { dataOptionsTranslators } from './data-options/index.js';
import { dataTranslators } from './data/index.js';
import { designOptionsTranslators } from './design-options/index.js';
import { pieHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder.js';

export const pieChartBuilder: ChartBuilder<'pie'> = {
  dataOptions: dataOptionsTranslators,
  data: dataTranslators,
  designOptions: designOptionsTranslators,
  renderer: {
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: pieHighchartsOptionsBuilder,
      getAlerts: getPieChartAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
