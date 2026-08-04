import { isRendererReady } from '../../helpers/readiness.js';
import { ChartBuilder } from '../../types.js';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../highcharts-based-chart-renderer/highcharts-based-chart-renderer.js';
import { getSankeyChartAlerts } from './alerts/index.js';
import { dataOptionsTranslators } from './data-options/index.js';
import { dataTranslators } from './data/index.js';
import { designOptionsTranslators } from './design-options/index.js';
import { sankeyHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder.js';

/**
 * Wires together data options, data, design options, and Highcharts renderer
 * for the Sankey chart.
 *
 * `onReady` (Fusion `domready`): Highcharts render is forwarded via
 * `ChartRendererProps.onReady`; the shared chart-render contract below tells
 * RegularChart when to fire the consumer callback.
 */
export const sankeyChartBuilder: ChartBuilder<'sankey'> = {
  dataOptions: dataOptionsTranslators,
  data: dataTranslators,
  designOptions: designOptionsTranslators,
  renderer: {
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: sankeyHighchartsOptionsBuilder,
      getAlerts: getSankeyChartAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
    isReady: isRendererReady,
  },
};
