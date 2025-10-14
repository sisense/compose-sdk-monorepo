import { ChartBuilder } from '../../../types';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { getFunnelChartAlerts } from './alerts';
import { dataTranslators } from './data';
import { dataOptionsTranslators } from './data-options';
import { designOptionsTranslators } from './design-options';
import { funnelHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder';

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
