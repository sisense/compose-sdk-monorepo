/* eslint-disable max-lines-per-function */
/* eslint-disable max-params */
/* eslint-disable no-case-declarations */
import type { SeriesPieOptions } from '@sisense/sisense-charts';
import { ChartDesignOptions } from './translations/types';
import { getLegendSettings } from './translations/legend-section';
import {
  PieChartDesignOptions,
  FunnelChartDesignOptions,
  TreemapChartDesignOptions,
} from './translations/design-options';
import { determineHighchartsChartType } from './translations/translations-to-highcharts';
import { getTooltipSettings } from './tooltip';
import { getPiePlotOptions } from './translations/pie-plot-options';
import { getFunnelPlotOptions } from './translations/funnel-plot-options';
import { formatCategoricalChartData } from './translations/pie-series';
import { formatFunnelChartData } from './translations/funnel-series';
import { ChartType, OptionsWithAlerts, CompleteThemeSettings } from '../types';
import { CategoricalChartData } from '../chart-data/types';
import { HighchartsOptionsInternal } from './chart-options-service';
import {
  ChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
} from '../chart-data-options/types';
import { prepareTreemapOptions } from './translations/treemap/treemap-options';

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

  const topSpacings = 20;
  switch (chartType) {
    case 'pie':
      const pieDesignOptions = chartDesignOptions as PieChartDesignOptions;

      const {
        series: categoricalSeries,
        convolutionSeries,
        alerts: categoricalAlerts,
      } = formatCategoricalChartData(
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
        drilldown: {
          activeDataLabelStyle: {
            cursor: 'pointer',
            fontWeight: 'bold',
            textDecoration: 'none',
          },
          series: convolutionSeries as SeriesPieOptions[],
        },
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
      };
      return { options: funnelOptions, alerts };
    case 'treemap':
      return {
        options: prepareTreemapOptions(
          chartData,
          dataOptions as CategoricalChartDataOptionsInternal,
          chartDesignOptions as TreemapChartDesignOptions,
          themeSettings,
        ),
        alerts,
      };
    default:
      throw new Error('Unexpected chart type');
  }
};
