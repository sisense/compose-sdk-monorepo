/* eslint-disable max-params */
import { TreemapChartDesignOptions } from '../translations/design-options';
import { OptionsWithAlerts, CompleteThemeSettings } from '../../types';
import { CategoricalChartData } from '../../chart-data/types';
import { HighchartsOptionsInternal } from '../chart-options-service';
import { CategoricalChartDataOptionsInternal } from '../../chart-data-options/types';
import { prepareSunburstOptions } from '../translations/sunburst/sunburst-options';
import { TFunction } from '@sisense/sdk-common';

/**
 * Convert intermediate chart data, data options, and design options
 * into pure highcharts config data for sunburst charts.
 *
 * @param chartData - the data for the chart in an intermediate format
 * @param chartDesignOptions - sunburst chart specific design options
 * @param dataOptions - chart data options
 * @param translate - translation function
 * @param themeSettings - theme settings
 */
export const getSunburstChartOptions = (
  chartData: CategoricalChartData,
  chartDesignOptions: TreemapChartDesignOptions,
  dataOptions: CategoricalChartDataOptionsInternal,
  translate: TFunction,
  themeSettings?: CompleteThemeSettings,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const alerts: OptionsWithAlerts<HighchartsOptionsInternal>['alerts'] = [];

  return {
    options: prepareSunburstOptions(
      chartData,
      dataOptions,
      chartDesignOptions,
      translate,
      themeSettings,
    ),
    alerts,
  };
};
