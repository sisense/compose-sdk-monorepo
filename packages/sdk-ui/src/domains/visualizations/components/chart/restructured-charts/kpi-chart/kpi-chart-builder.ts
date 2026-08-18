import { isRendererReady } from '../helpers/readiness.js';
import { ChartBuilder } from '../types.js';
import {
  getKpiAttributes,
  getKpiMeasures,
  isKpiChartDataOptions,
  isKpiChartDataOptionsInternal,
  translateKpiChartDataOptions,
} from './data-options/index.js';
import { getKpiChartData, loadKpiData } from './data/index.js';
import {
  getDefaultKpiStyleOptions,
  isKpiStyleOptions,
  translateKpiStyleOptionsToDesignOptions,
} from './design-options/index.js';
import { isKpiChartRendererProps, KpiChartRenderer } from './renderer/index.js';

/**
 * KPI chart builder configuration.
 *
 * Provides a complete configuration for building KPI charts,
 * including data processing, styling, and rendering capabilities.
 *
 * `onReady` (Fusion `domready` / PDF): the renderer reports its own paint via
 * `KpiChartRendererProps.onReady` once the card is committed to the DOM (sparkline
 * included), so readiness follows the shared chart-render contract below.
 * @internal
 */
export const kpiChartBuilder: ChartBuilder<'kpi'> = {
  dataOptions: {
    translateDataOptionsToInternal: translateKpiChartDataOptions,
    getAttributes: getKpiAttributes,
    getMeasures: getKpiMeasures,
    isCorrectDataOptions: isKpiChartDataOptions,
    isCorrectDataOptionsInternal: isKpiChartDataOptionsInternal,
  },
  data: {
    loadData: loadKpiData,
    getChartData: getKpiChartData,
  },
  designOptions: {
    translateStyleOptionsToDesignOptions: translateKpiStyleOptionsToDesignOptions,
    isCorrectStyleOptions: isKpiStyleOptions,
    getDefaultStyleOptions: getDefaultKpiStyleOptions,
  },
  renderer: {
    ChartRendererComponent: KpiChartRenderer,
    isCorrectRendererProps: isKpiChartRendererProps,
    isReady: isRendererReady,
  },
};
