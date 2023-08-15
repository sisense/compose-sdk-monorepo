/* eslint-disable max-lines-per-function */
/* eslint-disable max-params */
/* eslint-disable no-case-declarations */
import { ChartDesignOptions } from './translations/types';
import { getLegendSettings } from './translations/legend_section';
import { PieChartDesignOptions, FunnelChartDesignOptions } from './translations/design_options';
import { determineHighchartsChartType } from './translations/translations_to_highcharts';
import { getTooltipSettings } from './tooltip';
import { getPiePlotOptions } from './translations/pie_plot_options';
import { getFunnelPlotOptions } from './translations/funnel_plot_options';
import { formatCategoricalChartData } from './translations/pie_series';
import { formatFunnelChartData } from './translations/funnel_series';
import { ChartType, OptionsWithAlerts, CompleteThemeSettings } from '../types';
import { CategoricalChartData } from '../chart-data/types';
import { HighchartsOptionsInternal } from './chart_options_service';
import {
  ChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
} from '../chart-data-options/types';

/**
 * Convert intermediate chart data, data options, and design options
 * into pure highcharts config data.
 *
 * @param chartData - the data for the chart in an intermediate format
 * @param chartType -
 * @param chartDesignOptions -
 * @param dataOptions -
 * @param themeSettings -
 */
export const getCategoricalChartOptions = (
  chartData: CategoricalChartData,
  chartType: ChartType,
  chartDesignOptions: ChartDesignOptions,
  dataOptions: ChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const alerts: OptionsWithAlerts<HighchartsOptionsInternal>['alerts'] = [];
  const sisenseChartType = determineHighchartsChartType(chartType, chartDesignOptions);

  // TODO Following code will be refactored per https://sisenseglobal.atlassian.net/browse/SNS-76482
  const topSpacings = 20;
  switch (chartType) {
    case 'pie':
      const pieDesignOptions = chartDesignOptions as PieChartDesignOptions;

      const { series: categoricalSeries, alerts: categoricalAlerts } = formatCategoricalChartData(
        chartData,
        dataOptions as CategoricalChartDataOptionsInternal,
        pieDesignOptions,
        themeSettings,
      );
      alerts.push(...categoricalAlerts);

      const pieOptions = {
        title: { text: null },
        chart: {
          type: sisenseChartType,
          spacing: [topSpacings, 20, 20, 20],
          alignTicks: false,
          polar: false,
        },
        xAxis: [],
        yAxis: [],
        // The series level animation disables all animations, the chart
        // level animation only disables initial or subsequent paints
        legend: getLegendSettings(pieDesignOptions.legend),
        series: categoricalSeries,
        plotOptions: getPiePlotOptions(
          pieDesignOptions.pieType,
          pieDesignOptions.pieLabels,
          dataOptions,
        ),
        tooltip: getTooltipSettings(pieDesignOptions.pieLabels?.showDecimals, dataOptions),
        boost: { useGPUTranslations: true, usePreAllocated: true },
      };
      return { options: pieOptions, alerts };
    case 'funnel':
      const funnelDesignOptions = chartDesignOptions as FunnelChartDesignOptions;

      const { series: funnelSeries, alerts: funnelSeriesAlerts } = formatFunnelChartData(
        chartData,
        dataOptions as CategoricalChartDataOptionsInternal,
        funnelDesignOptions,
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
        legend: getLegendSettings(funnelDesignOptions.legend),
        series: funnelSeries,
        plotOptions: getFunnelPlotOptions(funnelDesignOptions, dataOptions),
        tooltip: getTooltipSettings(funnelDesignOptions.funnelLabels?.showDecimals, dataOptions),
        boost: { useGPUTranslations: true, usePreAllocated: true },
      };
      return { options: funnelOptions, alerts };
    default:
      throw new Error('Unexpected chart type');
  }
};
