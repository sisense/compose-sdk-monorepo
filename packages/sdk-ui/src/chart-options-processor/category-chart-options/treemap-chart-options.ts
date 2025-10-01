/* eslint-disable max-params */
import { TreemapChartDesignOptions } from '../translations/design-options';
import { OptionsWithAlerts, CompleteThemeSettings } from '../../types';
import { CategoricalChartData } from '../../chart-data/types';
import { HighchartsOptionsInternal } from '../chart-options-service';
import { CategoricalChartDataOptionsInternal } from '../../chart-data-options/types';
import { prepareTreemapOptions } from '../translations/treemap/treemap-options';
import { TFunction } from '@ethings-os/sdk-common';

/**
 * Convert intermediate chart data, data options, and design options
 * into pure highcharts config data for treemap charts.
 *
 * @param chartData - the data for the chart in an intermediate format
 * @param chartDesignOptions - treemap chart specific design options
 * @param dataOptions - chart data options
 * @param translate - translation function
 * @param themeSettings - theme settings
 */
export const getTreemapChartOptions = (
  chartData: CategoricalChartData,
  chartDesignOptions: TreemapChartDesignOptions,
  dataOptions: CategoricalChartDataOptionsInternal,
  translate: TFunction,
  themeSettings?: CompleteThemeSettings,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const alerts: OptionsWithAlerts<HighchartsOptionsInternal>['alerts'] = [];

  return {
    options: prepareTreemapOptions(
      chartData,
      dataOptions,
      chartDesignOptions,
      translate,
      themeSettings,
    ),
    alerts,
  };
};
