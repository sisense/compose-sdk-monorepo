import { ChartBuilder } from '../../../types';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { getCommonCartesianAlerts } from '../helpers/alerts';
import { dataTranslators } from './data';
import { dataOptionsTranslators } from './data-options';
import { designOptionsTranslators } from './design-options';
import { polarHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder';

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
