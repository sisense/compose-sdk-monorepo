import { ChartBuilder } from '../../../types';
import { dataOptionsTranslators } from './data-options';
import { dataTranslators } from './data';
import { designOptionsTranslators } from './design-options';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { pieHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder';
import { getPieChartAlerts } from './alerts';

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
