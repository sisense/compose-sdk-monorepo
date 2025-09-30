import { ChartBuilder } from '../../../types';
import { dataOptionsTranslators } from './data-options';
import { dataTranslators } from './data';
import { designOptionsTranslators } from './design-options';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { funnelHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder';
import { getFunnelChartAlerts } from './alerts';

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
