import { TFunction } from '@sisense/sdk-common';
import { BoxplotChartData } from '../chart-data/types';
import { determineHighchartsChartType } from './translations/translations-to-highcharts';
import { BoxplotChartDataOptionsInternal } from '../chart-data-options/types';
import { HighchartsOptionsInternal } from './chart-options-service';
import { HighchartsSelectEvent, OptionsWithAlerts } from '../types';
import { buildBoxplotSeries } from './translations/boxplot/boxplot-series';
import {
  getBoxplotXAxisSettings,
  getBoxplotYAxisSettings,
} from './translations/boxplot/boxplot-axis';
import { getBoxplotPlotOptions } from './translations/boxplot/boxplot-plot-options';
import { BoxplotChartDesignOptions } from './translations/design-options';
import { getLegendSettings } from './translations/legend-section';
import { getNavigator } from './translations/navigator';
import { getBoxplotTooltipSettings } from './translations/boxplot/boxplot-tooltip';
import { ChartDesignOptions } from './translations/types';

/**
 * Convert intermediate chart data, data options, and design options
 * into pure highcharts config data.
 */
export const getBoxplotChartOptions = (
  chartData: BoxplotChartData,
  chartDesignOptions: ChartDesignOptions,
  dataOptions: BoxplotChartDataOptionsInternal,
  translate: TFunction,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const globalDesignOptions = chartDesignOptions.globalDesign as BoxplotChartDesignOptions;
  const sisenseChartType = determineHighchartsChartType('boxplot', globalDesignOptions);
  const { series, alerts } = buildBoxplotSeries(chartData, globalDesignOptions);
  const categories = chartData.xValues.map((xAxisValue) => xAxisValue.key);

  const boxplotOptions: HighchartsOptionsInternal = {
    title: { text: null },
    chart: {
      type: sisenseChartType,
      spacing: [25, 20, 20, 20],
      polar: false,
      zooming: {
        type: 'x',
      },
      events: {
        // disables default zooming
        selection: (nativeEvent: HighchartsSelectEvent) => {
          nativeEvent.preventDefault();
        },
      },
    },
    legend: getLegendSettings(globalDesignOptions.legend),
    xAxis: getBoxplotXAxisSettings(globalDesignOptions.xAxis, categories, dataOptions.category),
    // Note: as we have multiple data options that describe the yAxis,
    // we are just using one of them to get formatting configuration
    yAxis: getBoxplotYAxisSettings(globalDesignOptions.yAxis, chartData, dataOptions.whiskerMax),
    series,
    plotOptions: getBoxplotPlotOptions(globalDesignOptions.valueLabel),
    navigator: getNavigator(
      sisenseChartType,
      globalDesignOptions.autoZoom,
      chartData.xValues.length,
    ),
    tooltip: getBoxplotTooltipSettings(dataOptions, translate),
  };
  return { options: boxplotOptions, alerts };
};
