/* eslint-disable max-params */

/* eslint-disable no-case-declarations */
import { TFunction } from '@sisense/sdk-common';

import { TranslatableError } from '@/translation/translatable-error';

import {
  CategoricalChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../../chart-data-options/types';
import { CategoricalChartData } from '../../chart-data/types';
import { ChartType, CompleteThemeSettings, OptionsWithAlerts } from '../../types';
import { HighchartsOptionsInternal } from '../chart-options-service';
import {
  FunnelChartDesignOptions,
  PieChartDesignOptions,
  SunburstChartDesignOptions,
  TreemapChartDesignOptions,
} from '../translations/design-options';
import { ChartDesignOptions } from '../translations/types';
import { getFunnelChartOptions } from './funnel-chart-options';
// Import individual chart option functions for use in main function
import { getPieChartOptions } from './pie-chart-options';
import { getSunburstChartOptions } from './sunburst-chart-options';
import { getTreemapChartOptions } from './treemap-chart-options';

// Export individual chart option functions
export { getPieChartOptions } from './pie-chart-options';
export { getFunnelChartOptions } from './funnel-chart-options';
export { getTreemapChartOptions } from './treemap-chart-options';
export { getSunburstChartOptions } from './sunburst-chart-options';

/**
 * Convert intermediate chart data, data options, and design options
 * into pure highcharts config data.
 *
 * @param chartData - the data for the chart in an intermediate format
 * @param chartType -
 * @param globalDesignOptions -
 * @param dataOptions -
 * @param themeSettings -
 */
export const getCategoricalChartOptions = (
  chartData: CategoricalChartData,
  chartType: ChartType,
  chartDesignOptions: ChartDesignOptions,
  dataOptions: ChartDataOptionsInternal,
  translate: TFunction,
  themeSettings?: CompleteThemeSettings,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  switch (chartType) {
    case 'pie':
      return getPieChartOptions(
        chartData,
        chartDesignOptions as PieChartDesignOptions,
        dataOptions as CategoricalChartDataOptionsInternal,
        themeSettings,
      );
    case 'funnel':
      return getFunnelChartOptions(
        chartData,
        chartDesignOptions as FunnelChartDesignOptions,
        dataOptions as CategoricalChartDataOptionsInternal,
        themeSettings,
      );
    case 'treemap':
      return getTreemapChartOptions(
        chartData,
        chartDesignOptions as TreemapChartDesignOptions,
        dataOptions as CategoricalChartDataOptionsInternal,
        translate,
        themeSettings,
      );
    case 'sunburst':
      return getSunburstChartOptions(
        chartData,
        chartDesignOptions as SunburstChartDesignOptions,
        dataOptions as CategoricalChartDataOptionsInternal,
        translate,
        themeSettings,
      );
    default:
      throw new TranslatableError('errors.unexpectedChartType', { chartType });
  }
};
