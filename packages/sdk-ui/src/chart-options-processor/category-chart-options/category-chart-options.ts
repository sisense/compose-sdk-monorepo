/* eslint-disable max-params */
/* eslint-disable no-case-declarations */
import { ChartDesignOptions } from '../translations/types';
import {
  PieChartDesignOptions,
  FunnelChartDesignOptions,
  TreemapChartDesignOptions,
} from '../translations/design-options';
import { ChartType, OptionsWithAlerts, CompleteThemeSettings } from '../../types';
import { CategoricalChartData } from '../../chart-data/types';
import { HighchartsOptionsInternal } from '../chart-options-service';
import {
  ChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
} from '../../chart-data-options/types';
import { TranslatableError } from '@/translation/translatable-error';
import { TFunction } from '@sisense/sdk-common';

// Export individual chart option functions
export { getPieChartOptions } from './pie-chart-options';
export { getFunnelChartOptions } from './funnel-chart-options';
export { getTreemapChartOptions } from './treemap-chart-options';
export { getSunburstChartOptions } from './sunburst-chart-options';

// Import individual chart option functions for use in main function
import { getPieChartOptions } from './pie-chart-options';
import { getFunnelChartOptions } from './funnel-chart-options';
import { getTreemapChartOptions } from './treemap-chart-options';
import { getSunburstChartOptions } from './sunburst-chart-options';

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
        chartDesignOptions as TreemapChartDesignOptions,
        dataOptions as CategoricalChartDataOptionsInternal,
        translate,
        themeSettings,
      );
    default:
      throw new TranslatableError('errors.unexpectedChartType', { chartType });
  }
};
