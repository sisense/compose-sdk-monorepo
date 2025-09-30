import { ChartBuilder } from '../../../types';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { dataOptionsTranslators } from './data-options';
import { dataTranslators } from './data';
import { designOptionsTranslators } from './design-options';
import { treemapHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder';
import { getTreemapAlerts } from './alerts';

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
