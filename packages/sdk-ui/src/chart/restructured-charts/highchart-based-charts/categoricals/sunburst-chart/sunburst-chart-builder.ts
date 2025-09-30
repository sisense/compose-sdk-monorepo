import { ChartBuilder } from '../../../types';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { dataOptionsTranslators } from './data-options';
import { dataTranslators } from './data';
import { designOptionsTranslators } from './design-options';
import { sunburstHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder';
import { getSunburstAlerts } from './alerts';

export const sunburstChartBuilder: ChartBuilder<'sunburst'> = {
  dataOptions: dataOptionsTranslators,
  data: dataTranslators,
  designOptions: designOptionsTranslators,
  renderer: {
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: sunburstHighchartsOptionsBuilder,
      getAlerts: getSunburstAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
