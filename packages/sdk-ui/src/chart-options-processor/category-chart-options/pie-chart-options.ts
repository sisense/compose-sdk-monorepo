/* eslint-disable max-params */
import { CategoricalChartDataOptionsInternal } from '../../chart-data-options/types';
import { CategoricalChartData } from '../../chart-data/types';
import { CompleteThemeSettings, OptionsWithAlerts } from '../../types';
import { HighchartsOptionsInternal } from '../chart-options-service';
import { getCategoryTooltipSettings } from '../tooltip';
import { PieChartDesignOptions } from '../translations/design-options';
import { getLegendSettings } from '../translations/legend-section';
import { getPiePlotOptions } from '../translations/pie-plot-options';
import { formatCategoricalChartData } from '../translations/pie-series';
import { determineHighchartsChartType } from '../translations/translations-to-highcharts';

/**
 * Convert intermediate chart data, data options, and design options
 * into pure highcharts config data for pie charts.
 *
 * @param chartData - the data for the chart in an intermediate format
 * @param chartDesignOptions - pie chart specific design options
 * @param dataOptions - chart data options
 * @param themeSettings - theme settings
 */
export const getPieChartOptions = (
  chartData: CategoricalChartData,
  chartDesignOptions: PieChartDesignOptions,
  dataOptions: CategoricalChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const alerts: OptionsWithAlerts<HighchartsOptionsInternal>['alerts'] = [];
  const sisenseChartType = determineHighchartsChartType('pie', chartDesignOptions);
  const topSpacings = 20;

  const {
    series: categoricalSeries,
    convolutionSeries,
    alerts: categoricalAlerts,
  } = formatCategoricalChartData(chartData, dataOptions, chartDesignOptions, themeSettings);
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
    legend: getLegendSettings(chartDesignOptions.legend),
    series: categoricalSeries,
    plotOptions: getPiePlotOptions(
      chartDesignOptions.pieType,
      chartDesignOptions.seriesLabels,
      dataOptions,
      themeSettings,
    ),
    tooltip: getCategoryTooltipSettings(
      chartDesignOptions.seriesLabels?.percentageLabels?.showDecimals,
      dataOptions,
    ),
    drilldown: {
      activeDataLabelStyle: {
        cursor: 'pointer',
        fontWeight: 'bold',
        textDecoration: 'none',
      },
      series: convolutionSeries,
    },
  };

  return { options: pieOptions, alerts };
};
