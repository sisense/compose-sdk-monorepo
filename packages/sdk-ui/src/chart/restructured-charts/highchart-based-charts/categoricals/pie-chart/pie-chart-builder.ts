import { ChartBuilder } from '../../../types';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { getPieChartAlerts } from './alerts';
import { dataTranslators } from './data';
import { dataOptionsTranslators } from './data-options';
import { designOptionsTranslators } from './design-options';
import { pieHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder';

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
