/* eslint-disable max-params */
import { getLegendSettings } from '../translations/legend-section';
import { FunnelChartDesignOptions } from '../translations/design-options';
import { determineHighchartsChartType } from '../translations/translations-to-highcharts';
import { getCategoryTooltipSettings } from '../tooltip';
import { getFunnelPlotOptions } from '../translations/funnel-plot-options';
import { formatFunnelChartData } from '../translations/funnel-series';
import { OptionsWithAlerts, CompleteThemeSettings } from '../../types';
import { CategoricalChartData } from '../../chart-data/types';
import { HighchartsOptionsInternal } from '../chart-options-service';
import { CategoricalChartDataOptionsInternal } from '../../chart-data-options/types';

/**
 * Convert intermediate chart data, data options, and design options
 * into pure highcharts config data for funnel charts.
 *
 * @param chartData - the data for the chart in an intermediate format
 * @param chartDesignOptions - funnel chart specific design options
 * @param dataOptions - chart data options
 * @param themeSettings - theme settings
 */
export const getFunnelChartOptions = (
  chartData: CategoricalChartData,
  chartDesignOptions: FunnelChartDesignOptions,
  dataOptions: CategoricalChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const alerts: OptionsWithAlerts<HighchartsOptionsInternal>['alerts'] = [];
  const sisenseChartType = determineHighchartsChartType('funnel', chartDesignOptions);

  const { series: funnelSeries, alerts: funnelSeriesAlerts } = formatFunnelChartData(
    chartData,
    dataOptions,
    chartDesignOptions,
    themeSettings,
  );
  alerts.push(...funnelSeriesAlerts);

  const funnelOptions = {
    title: { text: null },
    chart: {
      type: sisenseChartType,
      spacing: [30, 30, 30, 30],
      alignTicks: false,
      polar: false,
    },
    xAxis: [],
    yAxis: [],
    // The series level animation disables all animations, the chart
    // level animation only disables initial or subsequent paints
    legend: getLegendSettings(chartDesignOptions.legend),
    series: funnelSeries,
    plotOptions: getFunnelPlotOptions(chartDesignOptions, dataOptions, themeSettings),
    tooltip: getCategoryTooltipSettings(chartDesignOptions.funnelLabels?.showDecimals, dataOptions),
  };

  return { options: funnelOptions, alerts };
};
