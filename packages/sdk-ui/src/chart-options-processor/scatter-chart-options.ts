/* eslint-disable max-params */
import { ChartDesignOptions } from './translations/types';
import { determineHighchartsChartType } from './translations/translations-to-highcharts';
import { ChartType, OptionsWithAlerts, CompleteThemeSettings } from '../types';
import { ScatterChartData } from '../chart-data/types';
import { HighchartsOptionsInternal } from './chart-options-service';
import {
  ChartDataOptionsInternal,
  ScatterChartDataOptionsInternal,
} from '../chart-data-options/types';
import { getLegendSettings, LegendPosition, LegendSettings } from './translations/legend-section';
import { ScatterChartDesignOptions } from './translations/design-options';
import { getScatterPlotOptions } from './translations/scatter-plot-options';
import { getScatterXAxisSettings, getScatterYAxisSettings } from './translations/scatter-axis';
import { buildScatterSeries } from './translations/scatter-series';
import { getScatterTooltipSettings } from './translations/scatter-tooltip';
import { categoriesSliceWarning } from '../utils/data-limit-warning';
import { createCategoriesMap } from '../chart-data/scatter-data';

const SPACING = 20;
const MARGIN_TOP = 30;

/**
 * @param position
 * @internal
 */
export const getScatterLegendSettings = (position: LegendPosition): LegendSettings => ({
  ...getLegendSettings(position),
  symbolHeight: 12,
  symbolWidth: 12,
});

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
export const getScatterChartOptions = (
  chartData: ScatterChartData,
  chartType: ChartType,
  designOptions: ChartDesignOptions,
  dataOptions: ChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const alerts: OptionsWithAlerts<HighchartsOptionsInternal>['alerts'] = [];
  const globalDesignOptions = designOptions.globalDesign;
  const sisenseChartType = determineHighchartsChartType(chartType, globalDesignOptions);

  const scatterDesignOptions = globalDesignOptions as ScatterChartDesignOptions;
  const scatterDataOptions = dataOptions as ScatterChartDataOptionsInternal;
  const { scatterDataTable } = chartData;
  const { seriesCapacity, categoriesCapacity } = globalDesignOptions.dataLimits;

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
  };

  return { options, alerts };
};
