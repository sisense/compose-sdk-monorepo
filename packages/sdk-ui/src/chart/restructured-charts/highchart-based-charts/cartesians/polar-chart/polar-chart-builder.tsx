import { ChartBuilder } from '../../../types';
import { dataOptionsTranslators } from './data-options';
import { dataTranslators } from './data';
import { designOptionsTranslators } from './design-options';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { polarHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder';
import { getCommonCartesianAlerts } from '../helpers/alerts';

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
