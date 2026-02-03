import { ChartBuilder } from '../../../types.js';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer.js';
import { getFunnelChartAlerts } from './alerts/index.js';
import { dataOptionsTranslators } from './data-options/index.js';
import { dataTranslators } from './data/index.js';
import { designOptionsTranslators } from './design-options/index.js';
import { funnelHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder.js';

export const funnelChartBuilder: ChartBuilder<'funnel'> = {
  dataOptions: dataOptionsTranslators,
  data: dataTranslators,
  designOptions: designOptionsTranslators,
  renderer: {
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: funnelHighchartsOptionsBuilder,
      getAlerts: getFunnelChartAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
