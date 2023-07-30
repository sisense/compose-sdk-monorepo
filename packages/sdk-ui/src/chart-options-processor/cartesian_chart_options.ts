/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-disable max-params */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-lines */
import { CategoricalSeriesValues, ChartData } from '../chart-data/types';
import { ChartDesignOptions } from './translations/types';
import { getLegendSettings } from './translations/legend_section';
import {
  getPolarValueLabelSettings,
  getValueLabelSettings,
} from './translations/value_label_section';
import { getMarkerSettings } from './translations/marker_section';
import {
  getXAxisSettings,
  getYAxisSettings,
  AxisSettings,
  Axis,
  getXAxisDatetimeSettings,
  getCategoricalCompareValue,
} from './translations/axis_section';
import { StackableChartDesignOptions, PolarType } from './translations/design_options';
import {
  determineHighchartsChartType,
  addStackingIfSpecified,
  formatSeries,
  autoCalculateYAxisMinMax,
  indexMapWhenOnlyY,
  determineYAxisOptions,
  getColorSetting,
  formatSeriesContinuousXAxis,
} from './translations/translations_to_highcharts';
import { getTooltipSettings } from './tooltip';
import merge from 'deepmerge';
import { chartOptionsDefaults } from './defaults/cartesian';
import { onlyY } from '../chart-data/utils';
import { getAPaletteColor } from './translations/pie_series';
import { ChartType, CompleteThemeSettings } from '../types';
import { CartesianChartDataOptionsInternal } from '../chart-data-options/types';
import { applyNumberFormatToPlotBands, getCategoriesIndexMapAndPlotBands } from './plot_bands';
import { HighchartsOptionsInternal } from './chart_options_service';
import { getNavigator } from './translations/navigator';
import { isDatetime } from '@sisense/sdk-data';
import { categoriesSliceWarning, seriesSliceWarning } from '../utils/dataLimitWarning';
import { OptionsWithAlerts } from './../types';

/**
 * Convert intermediate chart data, data options, and design options
 * into pure highcharts config data.
 *
 * @param chartData - the data for the chart in an intermediate format
 * @param chartType -
 * @param chartDesignOptions -
 * @param dataOptions -
 * @param themeSettings -
 * @param dateFormatter
 */
export const getCartesianChartOptions = (
  chartData: ChartData,
  chartType: ChartType,
  chartDesignOptions: ChartDesignOptions,
  dataOptions: CartesianChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
  dateFormatter?: (date: Date, format: string) => string,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  const alerts: OptionsWithAlerts<HighchartsOptionsInternal>['alerts'] = [];
  const continuousDatetimeXAxis =
    (dataOptions.x.length === 1 &&
      dataOptions.x[0].continuous &&
      isDatetime(dataOptions.x[0].type)) ||
    false;
  const sisenseChartType = determineHighchartsChartType(chartType, chartDesignOptions);
  if (chartData.type !== 'cartesian') {
    throw new Error('Unexpected chart type');
  }

  const { seriesCapacity, categoriesCapacity } = chartDesignOptions.dataLimits;

  if (chartData.xValues.length > categoriesCapacity) {
    alerts.push(categoriesSliceWarning('x', chartData.xValues.length, categoriesCapacity));
  }

  // get categories and limit to max allowed
  // create plot band for each X2 value
  // create map of tic index to category value
  // index if X2 exist because plotBands adds
  // extra blank category (tic) between plot bands
  const { categories, indexMap, plotBands } = applyNumberFormatToPlotBands(
    dataOptions,
    getCategoriesIndexMapAndPlotBands(
      {
        ...chartData,
        xValues: chartData.xValues.slice(0, categoriesCapacity),
      },
      dataOptions,
      chartDesignOptions,
      continuousDatetimeXAxis,
    ),
  );

  const [yAxisSide, yAxisChartType, yTreatNullDataAsZeros] = determineYAxisOptions(
    chartData,
    dataOptions,
  );

  const xAxisOrientation =
    chartType === 'bar' || yAxisChartType.includes('bar') ? 'vertical' : 'horizontal';

  const xAxisSettings = continuousDatetimeXAxis
    ? getXAxisDatetimeSettings(
        chartDesignOptions.xAxis,
        dataOptions.x[0],
        chartData.xValues.map(getCategoricalCompareValue),
        dateFormatter,
      )
    : getXAxisSettings(
        chartDesignOptions.xAxis,
        chartDesignOptions.x2Axis,
        categories,
        plotBands,
        xAxisOrientation,
        dataOptions,
        chartType,
      );

  const yAxisMinMax = autoCalculateYAxisMinMax(
    chartType,
    chartData,
    chartDesignOptions,
    yAxisSide,
    yTreatNullDataAsZeros,
    0,
  );
  const y2AxisMinMax = autoCalculateYAxisMinMax(
    chartType,
    chartData,
    chartDesignOptions,
    yAxisSide,
    yTreatNullDataAsZeros,
    1,
  );

  const { stacking, showTotal } = addStackingIfSpecified(
    chartType,
    chartDesignOptions as StackableChartDesignOptions,
  );

  let polarType: PolarType | undefined = undefined;
  let yAxis: Axis | undefined = chartDesignOptions.yAxis;
  if ('polarType' in chartDesignOptions) {
    polarType = chartDesignOptions.polarType;

    // Polar charts on the Analytics tab do not allow a y-axis title to be
    // set. Clear this value if it happens to be set.
    //
    // NOTE: In the future, we may want to refactor the design options type
    // so it is impossible to set a title on the y-axis if the chartType is
    // "polar".
    yAxis = {
      ...chartDesignOptions.yAxis,
      titleEnabled: false,
      title: null,
    };
  }

  const yAxisSettings: AxisSettings[] = getYAxisSettings(
    yAxis,
    chartDesignOptions.y2Axis,
    yAxisMinMax,
    y2AxisMinMax,
    showTotal,
    dataOptions,
  );

  // if stack100 or x2 axis increase top spacing
  const addSpacing = stacking === 'percent' || chartData.xAxisCount > 1;
  const topSpacing = addSpacing && xAxisOrientation === 'horizontal' ? 75 : 20;
  const rightSpacing = addSpacing && xAxisOrientation === 'vertical' ? 90 : 20;

  // change null data to 0 for area stacked charts
  const treatNullDataAsZeros = chartType === 'area' && stacking !== undefined;
  const isPolarChart = Boolean(polarType);

  if (chartData.series.length > seriesCapacity) {
    alerts.push(seriesSliceWarning(chartData.series.length, seriesCapacity));
  }

  const options = merge<HighchartsOptionsInternal>(
    chartOptionsDefaults(chartType, polarType, stacking),
    {
      title: { text: null },
      chart: {
        type: sisenseChartType,
        spacing: [topSpacing, rightSpacing, 20, 20],
        alignTicks: false,
        polar: isPolarChart,
      },
      xAxis: xAxisSettings,
      yAxis: yAxisSettings,
      // The series level animation disables all animations, the chart
      // level animation only disables initial or subsequent paints
      legend: getLegendSettings(chartDesignOptions.legend),
      series: chartData.series
        .slice(0, seriesCapacity)
        .map((v: CategoricalSeriesValues, index: number) => ({
          ...(continuousDatetimeXAxis
            ? formatSeriesContinuousXAxis(
                v,
                indexMap,
                treatNullDataAsZeros || yTreatNullDataAsZeros[index],
                xAxisSettings[0].tickInterval as number,
                chartDesignOptions.dataLimits.categoriesCapacity,
              )
            : onlyY(dataOptions) && !stacking
            ? formatSeries(
                v,
                indexMapWhenOnlyY(categories, index),
                treatNullDataAsZeros || yTreatNullDataAsZeros[index],
              )
            : formatSeries(v, indexMap, treatNullDataAsZeros || yTreatNullDataAsZeros[index])),
          showInNavigator: true,
          stickyTracking: false,
          boostThreshold: 0,
          turboThreshold: 0,
          color:
            getColorSetting(dataOptions, v.name) ??
            getAPaletteColor(themeSettings?.palette?.variantColors, index),
          yAxis: yAxisSide[index],
          ...(yAxisChartType[index] && { type: yAxisChartType[index] }),
        })),
      plotOptions: {
        series: {
          lineWidth: chartDesignOptions.lineWidth,
          dataLabels: isPolarChart
            ? getPolarValueLabelSettings(chartDesignOptions.valueLabel, dataOptions, polarType!)
            : getValueLabelSettings(xAxisOrientation, chartDesignOptions.valueLabel, dataOptions),
          marker: getMarkerSettings(chartDesignOptions.marker),
          ...(stacking && { stacking: stacking }),
          connectNulls: false,
        },
      },
      navigator: getNavigator(
        sisenseChartType,
        chartDesignOptions.autoZoom,
        chartData.xValues.length,
      ),
      tooltip: getTooltipSettings(undefined, dataOptions),
      boost: { useGPUTranslations: true, usePreAllocated: true },
    },
  );

  return { options, alerts };
};
