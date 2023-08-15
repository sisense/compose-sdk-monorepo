/* eslint-disable max-params */
/* eslint-disable max-lines-per-function */
import { ChartDesignOptions } from './translations/types';
import { determineHighchartsChartType } from './translations/translations_to_highcharts';
import { ChartType, OptionsWithAlerts, CompleteThemeSettings } from '../types';
import { ScatterChartData } from '../chart-data/types';
import { HighchartsOptionsInternal } from './chart_options_service';
import {
  ChartDataOptionsInternal,
  ScatterChartDataOptionsInternal,
} from '../chart-data-options/types';
import { getLegendSettings, LegendPosition, LegendSettings } from './translations/legend_section';
import { ScatterChartDesignOptions } from './translations/design_options';
import { getScatterPlotOptions } from './translations/scatter_plot_options';
import { getScatterXAxisSettings, getScatterYAxisSettings } from './translations/scatter_axis';
import { buildScatterSeries } from './translations/scatter_series';
import { getScatterTooltipSettings } from './translations/scatter_tooltip';
import { categoriesSliceWarning } from '../utils/dataLimitWarning';
import { createCategoriesMap } from '../chart-data/scatter_data';

const SPACING = 20;
const MARGIN_TOP = 30;

/**
 * @param position
 * @internal
 */
export const getScatterLegendSettings = (position: LegendPosition): LegendSettings => ({
  ...getLegendSettings(position),
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  borderWidth: '0',
  itemStyle: {
    color: '#5B6372',
    cursor: 'default',
    fontFamily: 'Open Sans',
    fontSize: '13px',
    fontWeight: 'normal',
  },
  symbolHeight: 12,
  symbolWidth: 12,
  symbolRadius: 0,
});

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
export const getScatterChartOptions = (
  chartData: ScatterChartData,
  chartType: ChartType,
  chartDesignOptions: ChartDesignOptions,
  dataOptions: ChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const alerts: OptionsWithAlerts<HighchartsOptionsInternal>['alerts'] = [];
  const sisenseChartType = determineHighchartsChartType(chartType, chartDesignOptions);

  const scatterDesignOptions = chartDesignOptions as ScatterChartDesignOptions;
  const scatterDataOptions = dataOptions as ScatterChartDataOptionsInternal;
  const { scatterDataTable } = chartData;
  const { seriesCapacity, categoriesCapacity } = chartDesignOptions.dataLimits;

  let { xCategories, yCategories } = chartData;

  if (xCategories && xCategories.length > categoriesCapacity) {
    alerts.push(categoriesSliceWarning('x', xCategories.length, categoriesCapacity));
    xCategories = xCategories.slice(0, categoriesCapacity);
  }

  if (yCategories && yCategories.length > categoriesCapacity) {
    alerts.push(categoriesSliceWarning('y', yCategories.length, categoriesCapacity));
    yCategories = yCategories.slice(0, categoriesCapacity);
  }

  const { series, alerts: scatterSeriesErrors } = buildScatterSeries(
    scatterDataTable,
    createCategoriesMap(xCategories, yCategories),
    scatterDataOptions,
    themeSettings,
    seriesCapacity,
  );
  alerts.unshift(...scatterSeriesErrors);

  const options = {
    title: { text: null },
    subtitle: { text: null },
    chart: {
      type: sisenseChartType,
      spacing: [SPACING, SPACING, SPACING, SPACING],
      marginTop: MARGIN_TOP,
      alignTicks: false,
      polar: false,
    },
    xAxis: getScatterXAxisSettings(
      scatterDesignOptions.xAxis,
      xCategories?.slice(0, categoriesCapacity),
      scatterDataOptions,
    ),
    yAxis: getScatterYAxisSettings(
      scatterDesignOptions.yAxis,
      yCategories?.slice(0, categoriesCapacity),
      scatterDataOptions,
    ),
    legend: getScatterLegendSettings(scatterDesignOptions.legend),
    series,
    plotOptions: getScatterPlotOptions(scatterDesignOptions, scatterDataOptions),
    tooltip: getScatterTooltipSettings(scatterDataOptions),
    boost: { useGPUTranslations: true, usePreAllocated: true },
  };

  return { options, alerts };
};
