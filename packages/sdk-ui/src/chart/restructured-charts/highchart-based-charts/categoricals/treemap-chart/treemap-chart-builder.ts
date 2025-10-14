import { ChartBuilder } from '../../../types';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { getTreemapAlerts } from './alerts';
import { dataTranslators } from './data';
import { dataOptionsTranslators } from './data-options';
import { designOptionsTranslators } from './design-options';
import { treemapHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder';

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
